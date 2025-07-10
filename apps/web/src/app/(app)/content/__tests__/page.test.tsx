import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentPage from '../page'

// Mock Next.js navigation
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

describe('ContentPage', () => {
  const mockContent = [
    {
      id: '1',
      title: 'Climate Action Strategies',
      summary: 'Comprehensive guide to climate action',
      status: 'published',
      tags: ['climate', 'action'],
      created_at: new Date('2024-01-01').toISOString(),
      reading_time_minutes: 10,
      author: {
        display_name: 'Jane Doe'
      }
    },
    {
      id: '2',
      title: 'Community Engagement Best Practices',
      summary: 'How to engage communities effectively',
      status: 'published',
      tags: ['community', 'engagement'],
      created_at: new Date('2024-01-02').toISOString(),
      reading_time_minutes: 15,
      author: {
        display_name: 'John Smith'
      }
    },
    {
      id: '3',
      title: 'Draft: Systems Thinking Guide',
      summary: 'Understanding systems thinking',
      status: 'draft',
      tags: ['systems', 'thinking'],
      created_at: new Date('2024-01-03').toISOString(),
      reading_time_minutes: 20,
      author: {
        display_name: 'Alice Johnson'
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock setup
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: mockContent.filter(c => c.status === 'published'),
        error: null
      })
    })
  })

  it('displays published content for readers', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByText('Browse Content')).toBeInTheDocument()
      expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
      expect(screen.getByText('Community Engagement Best Practices')).toBeInTheDocument()
      expect(screen.queryByText('Draft: Systems Thinking Guide')).not.toBeInTheDocument()
    })
  })

  it('shows create button for contributors', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        role: 'contributor'
      }
    })

    // Mock to return user's content including drafts
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: mockContent,
        error: null
      })
    })

    render(<ContentPage />)

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /Create New Content/i })
      expect(createButton).toBeInTheDocument()
    })
  })

  it('navigates to create page when create button clicked', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        role: 'contributor'
      }
    })

    const user = userEvent.setup()
    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New Content/i })).toBeInTheDocument()
    })

    const createButton = screen.getByRole('button', { name: /Create New Content/i })
    await user.click(createButton)

    expect(mockPush).toHaveBeenCalledWith('/content/create')
  })

  it('filters content by search query', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    const user = userEvent.setup()
    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search content/i)
    await user.type(searchInput, 'climate')

    // Local filtering should hide non-matching content
    expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
    expect(screen.queryByText('Community Engagement Best Practices')).not.toBeInTheDocument()
  })

  it('filters content by tags', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    const user = userEvent.setup()
    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
    })

    // Click on a tag to filter
    const climateTag = screen.getAllByText('climate')[0]
    await user.click(climateTag)

    // Should show only content with that tag
    expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
    expect(screen.queryByText('Community Engagement Best Practices')).not.toBeInTheDocument()
  })

  it('handles loading state', () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => new Promise(() => {})) // Never resolves
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentPage />)

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('handles error state', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to load content')
      })
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading content/i)).toBeInTheDocument()
    })
  })

  it('handles empty content state', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByText(/No content available/i)).toBeInTheDocument()
    })
  })

  it('paginates content correctly', async () => {
    // Create many content items
    const manyContent = Array.from({ length: 25 }, (_, i) => ({
      id: `content-${i}`,
      title: `Content Item ${i}`,
      summary: `Summary for item ${i}`,
      status: 'published',
      tags: ['test'],
      created_at: new Date().toISOString(),
      reading_time_minutes: 5,
      author: { display_name: 'Test Author' }
    }))

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: manyContent,
        error: null
      })
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    const user = userEvent.setup()
    render(<ContentPage />)

    await waitFor(() => {
      expect(screen.getByText('Content Item 0')).toBeInTheDocument()
      expect(screen.queryByText('Content Item 20')).not.toBeInTheDocument()
    })

    // Navigate to next page
    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    expect(screen.queryByText('Content Item 0')).not.toBeInTheDocument()
    expect(screen.getByText('Content Item 20')).toBeInTheDocument()
  })
})