import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewsPage from '../page'

// Mock Next.js
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
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

// Mock ReviewCard component
vi.mock('@/components/review-card', () => ({
  ReviewCard: ({ content }: any) => (
    <div data-testid={`review-${content.id}`}>
      <h3>{content.title}</h3>
      <p>{content.author?.display_name}</p>
    </div>
  )
}))

describe('ReviewsPage', () => {
  const mockPendingContent = [
    {
      id: 'content-1',
      title: 'Climate Action Strategies',
      summary: 'Comprehensive guide to climate action',
      status: 'in_review',
      created_at: new Date('2024-01-01').toISOString(),
      author: {
        id: 'author-1',
        display_name: 'Jane Doe',
        email: 'jane@example.com'
      },
      reviews: []
    },
    {
      id: 'content-2',
      title: 'Systems Thinking Guide',
      summary: 'Introduction to systems thinking',
      status: 'in_review',
      created_at: new Date('2024-01-02').toISOString(),
      author: {
        id: 'author-2',
        display_name: 'John Smith',
        email: 'john@example.com'
      },
      reviews: [
        {
          id: 'review-1',
          reviewer_id: 'other-reviewer',
          decision: null,
          created_at: new Date().toISOString()
        }
      ]
    }
  ]

  const mockCompletedReviews = [
    {
      id: 'review-2',
      content_id: 'content-3',
      reviewer_id: 'reviewer-id',
      decision: 'approve',
      comments: 'Great work!',
      completed_at: new Date('2024-01-03').toISOString(),
      content: {
        id: 'content-3',
        title: 'Community Engagement',
        author: {
          display_name: 'Alice Johnson'
        }
      }
    },
    {
      id: 'review-3',
      content_id: 'content-4',
      reviewer_id: 'reviewer-id',
      decision: 'reject',
      comments: 'Needs more detail',
      completed_at: new Date('2024-01-04').toISOString(),
      content: {
        id: 'content-4',
        title: 'Policy Framework',
        author: {
          display_name: 'Bob Wilson'
        }
      }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default user setup
    mockUser.mockReturnValue({
      user: {
        id: 'reviewer-id',
        role: 'contributor'
      }
    })

    // Mock content query
    mockFrom.mockImplementation((table) => {
      if (table === 'content') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockPendingContent,
            error: null
          })
        }
      }
      if (table === 'reviews') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: mockCompletedReviews,
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      }
    })
  })

  it('displays review queue for contributors', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('Review Queue')).toBeInTheDocument()
      expect(screen.getByText('Help maintain quality by reviewing community contributions')).toBeInTheDocument()
    })
  })

  it('redirects readers who cannot review', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })

    render(<ReviewsPage />)

    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('displays pending reviews tab', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Pending Reviews \(1\)/i })).toBeInTheDocument()
      expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
    })
  })

  it('filters out already reviewed content', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      // Should show only content not reviewed by current user
      expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
      expect(screen.queryByText('Systems Thinking Guide')).not.toBeInTheDocument()
    })
  })

  it('displays completed reviews tab', async () => {
    const user = userEvent.setup()
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /My Reviews \(2\)/i })).toBeInTheDocument()
    })

    const completedTab = screen.getByRole('tab', { name: /My Reviews/i })
    await user.click(completedTab)

    await waitFor(() => {
      expect(screen.getByText('Community Engagement')).toBeInTheDocument()
      expect(screen.getByText('Policy Framework')).toBeInTheDocument()
      expect(screen.getByText('Great work!')).toBeInTheDocument()
      expect(screen.getByText('Needs more detail')).toBeInTheDocument()
    })
  })

  it('shows review decisions with appropriate styling', async () => {
    const user = userEvent.setup()
    render(<ReviewsPage />)

    const completedTab = screen.getByRole('tab', { name: /My Reviews/i })
    await user.click(completedTab)

    await waitFor(() => {
      const approvedDecision = screen.getByText('approve')
      const rejectedDecision = screen.getByText('reject')
      
      expect(approvedDecision).toHaveClass('text-green-600')
      expect(rejectedDecision).toHaveClass('text-red-600')
    })
  })

  it('shows empty state for no pending reviews', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'content') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      }
    })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('No content pending review')).toBeInTheDocument()
      expect(screen.getByText('Check back later for new submissions')).toBeInTheDocument()
    })
  })

  it('shows empty state for no completed reviews', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'reviews') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          not: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockPendingContent, error: null })
      }
    })

    const user = userEvent.setup()
    render(<ReviewsPage />)

    const completedTab = screen.getByRole('tab', { name: /My Reviews/i })
    await user.click(completedTab)

    await waitFor(() => {
      expect(screen.getByText("You haven't reviewed any content yet")).toBeInTheDocument()
    })
  })

  it('handles data loading errors', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to load')
      })
    })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading reviews/i)).toBeInTheDocument()
    })
  })

  it('refreshes data when switching tabs', async () => {
    const user = userEvent.setup()
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledTimes(2) // Initial load
    })

    // Switch to completed tab
    const completedTab = screen.getByRole('tab', { name: /My Reviews/i })
    await user.click(completedTab)

    // Switch back to pending
    const pendingTab = screen.getByRole('tab', { name: /Pending Reviews/i })
    await user.click(pendingTab)

    // Should refetch data
    expect(mockFrom).toHaveBeenCalledTimes(4)
  })

  it('allows filtering reviews by status', async () => {
    const user = userEvent.setup()
    render(<ReviewsPage />)

    const completedTab = screen.getByRole('tab', { name: /My Reviews/i })
    await user.click(completedTab)

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Filter by status/i })).toBeInTheDocument()
    })

    const filterSelect = screen.getByRole('combobox', { name: /Filter by status/i })
    await user.selectOptions(filterSelect, 'approved')

    // Should filter to show only approved reviews
    expect(screen.getByText('Community Engagement')).toBeInTheDocument()
    expect(screen.queryByText('Policy Framework')).not.toBeInTheDocument()
  })

  it('shows review statistics', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Total Reviews: 2/i)).toBeInTheDocument()
      expect(screen.getByText(/Approved: 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Rejected: 1/i)).toBeInTheDocument()
    })
  })
})