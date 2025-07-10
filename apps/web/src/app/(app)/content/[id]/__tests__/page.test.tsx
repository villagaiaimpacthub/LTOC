import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentDetailPage from '../page'

// Mock Next.js
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack
  }),
  notFound: vi.fn()
}))

// Mock Supabase
const mockFrom = vi.fn()
const mockRpc = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: mockFrom,
      rpc: mockRpc
    }
  })
}))

// Mock user hook
const mockUser = vi.fn()
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUser()
}))

// Mock ContentView component
vi.mock('@/components/content-view', () => ({
  ContentView: ({ content }: any) => (
    <div data-testid="content-view">{JSON.stringify(content)}</div>
  )
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  toast: (props: any) => mockToast(props)
}))

describe('ContentDetailPage', () => {
  const mockContent = {
    id: '1',
    title: 'Understanding Systems Thinking',
    content: { type: 'doc', content: [] },
    status: 'published',
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-02').toISOString(),
    reading_time_minutes: 15,
    views_count: 100,
    likes_count: 25,
    author: {
      id: 'author-1',
      display_name: 'Jane Doe',
      avatar_url: null
    },
    tags: ['systems-thinking', 'theory'],
    organization: {
      name: 'Test Org'
    }
  }

  const defaultProps = {
    params: { id: '1' }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock setup
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockContent,
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis()
    })

    mockRpc.mockResolvedValue({ error: null })
  })

  it('displays content details for published content', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Understanding Systems Thinking')).toBeInTheDocument()
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('15 min read')).toBeInTheDocument()
      expect(screen.getByText('100 views')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument() // likes count
    })
  })

  it('shows edit button for content author', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'author-1',
        role: 'contributor'
      }
    })

    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
    })
  })

  it('shows edit button for admin', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'admin-id',
        role: 'admin'
      }
    })

    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
    })
  })

  it('handles like functionality', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    // Mock checking if already liked
    mockFrom.mockImplementation((table) => {
      if (table === 'content_likes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null, // Not liked yet
            error: { code: 'PGRST116' } // Not found error
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockContent,
          error: null
        })
      }
    })

    const user = userEvent.setup()
    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Like/i })).toBeInTheDocument()
    })

    const likeButton = screen.getByRole('button', { name: /Like/i })
    await user.click(likeButton)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('content_likes')
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Content liked!'
      })
    })
  })

  it('handles unlike functionality', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    // Mock already liked
    mockFrom.mockImplementation((table) => {
      if (table === 'content_likes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'like-1' }, // Already liked
            error: null
          }),
          delete: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockContent,
          error: null
        })
      }
    })

    const user = userEvent.setup()
    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Unlike/i })).toBeInTheDocument()
    })

    const unlikeButton = screen.getByRole('button', { name: /Unlike/i })
    await user.click(unlikeButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Like removed'
      })
    })
  })

  it('tracks content view', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('track_content_view', {
        p_content_id: '1',
        p_user_id: 'reader-id'
      })
    })
  })

  it('displays tags and allows navigation by tag', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    const user = userEvent.setup()
    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('systems-thinking')).toBeInTheDocument()
      expect(screen.getByText('theory')).toBeInTheDocument()
    })

    const tagButton = screen.getByText('systems-thinking')
    await user.click(tagButton)

    expect(mockPush).toHaveBeenCalledWith('/content?tag=systems-thinking')
  })

  it('shows related content', async () => {
    const relatedContent = [
      {
        id: '2',
        title: 'Advanced Systems Thinking',
        summary: 'Deep dive into systems',
        tags: ['systems-thinking']
      },
      {
        id: '3',
        title: 'Theory of Change Basics',
        summary: 'Introduction to theory of change',
        tags: ['theory']
      }
    ]

    mockFrom.mockImplementation((table) => {
      if (table === 'content' && !table.includes('likes')) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            // First call returns the main content
            if (!mockFrom.mock.calls.some(call => call[0] === 'related')) {
              return Promise.resolve({
                data: mockContent,
                error: null
              })
            }
            // Subsequent calls return related content
            return Promise.resolve({
              data: relatedContent,
              error: null
            })
          }),
          neq: vi.fn().mockReturnThis(),
          contains: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: relatedContent,
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      }
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Related Content')).toBeInTheDocument()
      expect(screen.getByText('Advanced Systems Thinking')).toBeInTheDocument()
      expect(screen.getByText('Theory of Change Basics')).toBeInTheDocument()
    })
  })

  it('handles draft content access', async () => {
    const draftContent = {
      ...mockContent,
      status: 'draft'
    }

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: draftContent,
        error: null
      })
    })

    // Non-author trying to access draft
    mockUser.mockReturnValue({
      user: {
        id: 'other-user',
        role: 'reader'
      }
    })

    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/not authorized/i)).toBeInTheDocument()
    })
  })

  it('handles content not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Not found')
      })
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    const { notFound } = await import('next/navigation')
    
    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(notFound).toHaveBeenCalled()
    })
  })

  it('handles share functionality', async () => {
    // Mock clipboard API
    const mockWriteText = vi.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })

    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    const user = userEvent.setup()
    render(<ContentDetailPage {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Share/i })).toBeInTheDocument()
    })

    const shareButton = screen.getByRole('button', { name: /Share/i })
    await user.click(shareButton)

    expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('/content/1'))
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Link copied!',
      description: 'The content link has been copied to your clipboard'
    })
  })
})