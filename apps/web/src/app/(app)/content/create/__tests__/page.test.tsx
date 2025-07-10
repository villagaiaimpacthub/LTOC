import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateContentPage from '../page'

// Mock Next.js
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Supabase
const mockFrom = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: mockFrom
    }
  })
}))

// Mock user hook
const mockUser = vi.fn()
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUser()
}))

// Mock Editor component
vi.mock('@/components/editor/editor', () => ({
  Editor: ({ onChange, placeholder }: any) => (
    <div>
      <div data-testid="editor-placeholder">{placeholder}</div>
      <textarea
        data-testid="editor"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  toast: (props: any) => mockToast(props)
}))

// Mock validation
vi.mock('@ltoc/utils', () => ({
  validationSchemas: {
    contentTitle: { parse: (v: string) => v },
    tag: { parse: (v: string) => v.toLowerCase() }
  }
}))

describe('CreateContentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        organization_id: 'org-1',
        role: 'contributor'
      }
    })

    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: { id: 'new-content-id' },
        error: null
      })
    })
  })

  it('renders content creation form', () => {
    render(<CreateContentPage />)

    expect(screen.getByText('Create New Content')).toBeInTheDocument()
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument()
    expect(screen.getByTestId('editor')).toBeInTheDocument()
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Publish/i })).toBeInTheDocument()
  })

  it('restricts access for non-contributors', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<CreateContentPage />)

    expect(mockPush).toHaveBeenCalledWith('/content')
  })

  it('saves content as draft', async () => {
    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Fill in form
    await user.type(screen.getByLabelText(/Title/i), 'My New Article')
    await user.type(screen.getByLabelText(/Summary/i), 'This is a summary')
    await user.type(screen.getByTestId('editor'), 'This is the content')
    await user.type(screen.getByLabelText(/Tags/i), 'test, article')

    // Save as draft
    const saveDraftButton = screen.getByRole('button', { name: /Save Draft/i })
    await user.click(saveDraftButton)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('content')
      expect(mockFrom().insert).toHaveBeenCalledWith({
        title: 'My New Article',
        summary: 'This is a summary',
        content: 'This is the content',
        tags: ['test', 'article'],
        status: 'draft',
        author_id: 'contributor-id',
        organization_id: 'org-1'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content saved as draft'
      })
      expect(mockPush).toHaveBeenCalledWith('/content/new-content-id')
    })
  })

  it('publishes content directly', async () => {
    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Fill in form
    await user.type(screen.getByLabelText(/Title/i), 'Published Article')
    await user.type(screen.getByLabelText(/Summary/i), 'This will be published')
    await user.type(screen.getByTestId('editor'), 'Published content body')
    await user.type(screen.getByLabelText(/Tags/i), 'published, test')

    // Publish directly
    const publishButton = screen.getByRole('button', { name: /Publish/i })
    await user.click(publishButton)

    await waitFor(() => {
      expect(mockFrom().insert).toHaveBeenCalledWith({
        title: 'Published Article',
        summary: 'This will be published',
        content: 'Published content body',
        tags: ['published', 'test'],
        status: 'published',
        author_id: 'contributor-id',
        organization_id: 'org-1',
        published_at: expect.any(String)
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content published successfully'
      })
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Try to save without filling required fields
    const saveDraftButton = screen.getByRole('button', { name: /Save Draft/i })
    await user.click(saveDraftButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/Content is required/i)).toBeInTheDocument()
    })

    // Should not call insert
    expect(mockFrom().insert).not.toHaveBeenCalled()
  })

  it('handles tag input correctly', async () => {
    const user = userEvent.setup()
    render(<CreateContentPage />)

    const tagInput = screen.getByLabelText(/Tags/i)
    await user.type(tagInput, 'Tag1, TAG2,  tag3  ')

    // Fill other required fields
    await user.type(screen.getByLabelText(/Title/i), 'Test')
    await user.type(screen.getByTestId('editor'), 'Content')

    const saveDraftButton = screen.getByRole('button', { name: /Save Draft/i })
    await user.click(saveDraftButton)

    await waitFor(() => {
      expect(mockFrom().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'] // Should be normalized
        })
      )
    })
  })

  it('handles save errors', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to save')
      })
    })

    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Fill in form
    await user.type(screen.getByLabelText(/Title/i), 'Test Article')
    await user.type(screen.getByTestId('editor'), 'Test content')

    const saveDraftButton = screen.getByRole('button', { name: /Save Draft/i })
    await user.click(saveDraftButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save',
        variant: 'destructive'
      })
    })
  })

  it('shows loading state during save', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
    })

    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Fill in form
    await user.type(screen.getByLabelText(/Title/i), 'Test')
    await user.type(screen.getByTestId('editor'), 'Content')

    const saveDraftButton = screen.getByRole('button', { name: /Save Draft/i })
    await user.click(saveDraftButton)

    // Check loading state
    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled()
  })

  it('auto-saves draft periodically', async () => {
    vi.useFakeTimers()
    
    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Fill in form
    await user.type(screen.getByLabelText(/Title/i), 'Auto-save Test')
    await user.type(screen.getByTestId('editor'), 'This should auto-save')

    // Fast forward 5 minutes (auto-save interval)
    vi.advanceTimersByTime(5 * 60 * 1000)

    await waitFor(() => {
      expect(mockFrom().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Auto-save Test',
          status: 'draft'
        })
      )
    })

    vi.useRealTimers()
  })

  it('warns when leaving with unsaved changes', async () => {
    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Make changes
    await user.type(screen.getByLabelText(/Title/i), 'Unsaved content')

    // Mock beforeunload event
    const event = new Event('beforeunload')
    Object.defineProperty(event, 'returnValue', {
      writable: true,
      value: ''
    })

    window.dispatchEvent(event)

    expect(event.returnValue).toBe('You have unsaved changes. Are you sure you want to leave?')
  })

  it('supports markdown preview', async () => {
    const user = userEvent.setup()
    render(<CreateContentPage />)

    // Check for preview toggle
    const previewButton = screen.getByRole('button', { name: /Preview/i })
    expect(previewButton).toBeInTheDocument()

    await user.click(previewButton)

    // Should show preview mode
    expect(screen.getByTestId('content-preview')).toBeInTheDocument()
  })
})