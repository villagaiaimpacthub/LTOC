import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContentManagementTable } from '../content-management-table'

// Mock Supabase
const mockFrom = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: mockFrom
    }
  })
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  toast: (props: any) => mockToast(props)
}))

// Mock router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('ContentManagementTable', () => {
  const mockContent = [
    {
      id: 'content-1',
      title: 'Understanding Systems Thinking',
      status: 'published',
      author: {
        display_name: 'John Doe'
      },
      organization: {
        name: 'Org A'
      },
      created_at: new Date('2024-01-01').toISOString(),
      published_at: new Date('2024-01-02').toISOString(),
      views_count: 150,
      likes_count: 25
    },
    {
      id: 'content-2',
      title: 'Climate Change Mitigation Strategies',
      status: 'draft',
      author: {
        display_name: 'Jane Smith'
      },
      organization: {
        name: 'Org B'
      },
      created_at: new Date('2024-01-03').toISOString(),
      published_at: null,
      views_count: 0,
      likes_count: 0
    },
    {
      id: 'content-3',
      title: 'Community Engagement Best Practices',
      status: 'under_review',
      author: {
        display_name: 'Bob Wilson'
      },
      organization: {
        name: 'Org A'
      },
      created_at: new Date('2024-01-04').toISOString(),
      published_at: null,
      views_count: 0,
      likes_count: 0
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock setup
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockContent,
        error: null
      })
    })
  })

  it('renders content table with all content', async () => {
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
      expect(screen.getByText('Climate Change Mitigation Strategies')).toBeInTheDocument()
      expect(screen.getByText('Community Engagement Best Practices')).toBeInTheDocument()
    })
  })

  it('displays content status badges', async () => {
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Under Review')).toBeInTheDocument()
    })
  })

  it('shows content metrics', async () => {
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('150 views')).toBeInTheDocument()
      expect(screen.getByText('25 likes')).toBeInTheDocument()
    })
  })

  it('filters content by search query', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search content/i)
    await user.type(searchInput, 'climate')

    expect(screen.queryByText('Understanding Systems Thinking')).not.toBeInTheDocument()
    expect(screen.getByText('Climate Change Mitigation Strategies')).toBeInTheDocument()
    expect(screen.queryByText('Community Engagement Best Practices')).not.toBeInTheDocument()
  })

  it('filters content by status', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const statusFilter = screen.getByRole('combobox', { name: /Filter by status/i })
    await user.click(statusFilter)
    await user.click(screen.getByText('Published'))

    expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    expect(screen.queryByText('Climate Change Mitigation Strategies')).not.toBeInTheDocument()
    expect(screen.queryByText('Community Engagement Best Practices')).not.toBeInTheDocument()
  })

  it('opens preview when clicking view', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByRole('button', { name: /View/i })
    await user.click(viewButtons[0])

    expect(mockPush).toHaveBeenCalledWith('/content/content-1')
  })

  it('opens edit dialog', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Edit/i })
    await user.click(editButtons[0])

    expect(screen.getByText('Edit Content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Understanding Systems Thinking')).toBeInTheDocument()
  })

  it('updates content status', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Climate Change Mitigation Strategies')).toBeInTheDocument()
    })

    // Find the draft content row
    const draftRow = screen.getByText('Climate Change Mitigation Strategies').closest('tr')
    const publishButton = draftRow?.querySelector('button[title="Publish content"]')
    
    if (publishButton) {
      await user.click(publishButton)
    }

    // Confirm publish
    await waitFor(() => {
      expect(screen.getByText('Confirm Publish')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockFrom().update).toHaveBeenCalledWith({
        status: 'published',
        published_at: expect.any(String)
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content published successfully'
      })
    })
  })

  it('archives content', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const contentRow = screen.getByText('Understanding Systems Thinking').closest('tr')
    const archiveButton = contentRow?.querySelector('button[title="Archive content"]')
    
    if (archiveButton) {
      await user.click(archiveButton)
    }

    // Confirm archive
    await waitFor(() => {
      expect(screen.getByText('Confirm Archive')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockFrom().update).toHaveBeenCalledWith({
        status: 'archived'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content archived successfully'
      })
    })
  })

  it('deletes content permanently', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const contentRow = screen.getByText('Understanding Systems Thinking').closest('tr')
    const deleteButton = contentRow?.querySelector('button[title="Delete content"]')
    
    if (deleteButton) {
      await user.click(deleteButton)
    }

    // Confirm delete with warning
    await waitFor(() => {
      expect(screen.getByText('Delete Content')).toBeInTheDocument()
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /Delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockFrom().delete).toHaveBeenCalled()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content deleted successfully'
      })
    })
  })

  it('handles bulk actions', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    // Select multiple items
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // First content
    await user.click(checkboxes[2]) // Second content

    expect(screen.getByText('2 selected')).toBeInTheDocument()

    // Open bulk actions menu
    const bulkActionsButton = screen.getByRole('button', { name: /Bulk Actions/i })
    await user.click(bulkActionsButton)

    expect(screen.getByText('Archive Selected')).toBeInTheDocument()
    expect(screen.getByText('Delete Selected')).toBeInTheDocument()
  })

  it('exports content data', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: /Export/i })
    await user.click(exportButton)

    // Select export format
    await user.click(screen.getByText('CSV'))

    expect(screen.getByText(/Exported \d+ content items/i)).toBeInTheDocument()
  })

  it('shows content analytics modal', async () => {
    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const contentRow = screen.getByText('Understanding Systems Thinking').closest('tr')
    const analyticsButton = contentRow?.querySelector('button[title="View analytics"]')
    
    if (analyticsButton) {
      await user.click(analyticsButton)
    }

    await waitFor(() => {
      expect(screen.getByText('Content Analytics')).toBeInTheDocument()
      expect(screen.getByText(/150 total views/i)).toBeInTheDocument()
      expect(screen.getByText(/25 likes/i)).toBeInTheDocument()
    })
  })

  it('handles errors gracefully', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: { message: 'Network error' }
      })
    })

    const user = userEvent.setup()
    render(<ContentManagementTable contents={mockContent} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Edit/i })
    await user.click(editButtons[0])

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Network error',
        variant: 'destructive'
      })
    })
  })
})