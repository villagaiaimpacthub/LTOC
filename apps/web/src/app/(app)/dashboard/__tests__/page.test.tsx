import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardPage from '../page'

// Mock router
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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays admin dashboard for admin users', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'admin-id',
        display_name: 'Admin User',
        role: 'admin'
      }
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      count: vi.fn().mockResolvedValue({
        count: 42,
        error: null
      })
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument()
      expect(screen.getByText(/Manage users/i)).toBeInTheDocument()
      expect(screen.getByText(/Review content/i)).toBeInTheDocument()
      expect(screen.getByText(/View analytics/i)).toBeInTheDocument()
    })
  })

  it('displays contributor dashboard for contributors', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        display_name: 'Contributor User',
        role: 'contributor'
      }
    })

    const mockContent = [
      {
        id: '1',
        title: 'My First Content',
        status: 'published',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Draft Content',
        status: 'draft',
        created_at: new Date().toISOString()
      }
    ]

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: mockContent,
        error: null
      })
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Create new content/i)).toBeInTheDocument()
      expect(screen.getByText(/My First Content/i)).toBeInTheDocument()
      expect(screen.getByText(/Draft Content/i)).toBeInTheDocument()
    })
  })

  it('displays reader dashboard for readers', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        display_name: 'Reader User',
        role: 'reader'
      }
    })

    const mockContent = [
      {
        id: '1',
        title: 'Interesting Article',
        author: { display_name: 'Author Name' },
        created_at: new Date().toISOString()
      }
    ]

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: mockContent,
        error: null
      })
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/Recently published content/i)).toBeInTheDocument()
      expect(screen.getByText(/Interesting Article/i)).toBeInTheDocument()
    })
  })

  it('redirects to login when no user', () => {
    mockUser.mockReturnValue({ user: null })

    render(<DashboardPage />)

    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('handles data loading errors gracefully', async () => {
    mockUser.mockReturnValue({
      user: {
        id: 'user-id',
        display_name: 'Test User',
        role: 'contributor'
      }
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to load')
      })
    })

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading content/i)).toBeInTheDocument()
    })
  })
})