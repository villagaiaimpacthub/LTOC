import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MainNav } from '../main-nav'

// Mock Next.js
const mockPathname = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname()
}))

// Mock user hook
const mockUser = vi.fn()
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUser()
}))

describe('MainNav', () => {
  it('renders navigation links for readers', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })
    mockPathname.mockReturnValue('/dashboard')

    render(<MainNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Browse')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('AI Chat')).toBeInTheDocument()
    
    // Should not show contributor/admin links
    expect(screen.queryByText('Create')).not.toBeInTheDocument()
    expect(screen.queryByText('Reviews')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('renders additional links for contributors', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        role: 'contributor'
      }
    })
    mockPathname.mockReturnValue('/dashboard')

    render(<MainNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Browse')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Reviews')).toBeInTheDocument()
    expect(screen.getByText('Synthesis')).toBeInTheDocument()
    expect(screen.getByText('Collaborate')).toBeInTheDocument()
    
    // Should not show admin link
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('renders all links for admins', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'admin-id',
        role: 'admin'
      }
    })
    mockPathname.mockReturnValue('/dashboard')

    render(<MainNav />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Browse')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Reviews')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('highlights active link', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })
    mockPathname.mockReturnValue('/content')

    render(<MainNav />)

    const browseLink = screen.getByText('Browse')
    expect(browseLink.closest('a')).toHaveClass('bg-muted')
  })

  it('shows no navigation for unauthenticated users', () => {
    mockUser.mockReturnValue({ user: null })
    mockPathname.mockReturnValue('/')

    const { container } = render(<MainNav />)

    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('renders correct href attributes', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        role: 'contributor'
      }
    })
    mockPathname.mockReturnValue('/dashboard')

    render(<MainNav />)

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Browse').closest('a')).toHaveAttribute('href', '/content')
    expect(screen.getByText('Create').closest('a')).toHaveAttribute('href', '/content/create')
    expect(screen.getByText('Reviews').closest('a')).toHaveAttribute('href', '/reviews')
    expect(screen.getByText('Search').closest('a')).toHaveAttribute('href', '/search')
    expect(screen.getByText('AI Chat').closest('a')).toHaveAttribute('href', '/chat')
  })

  it('shows notification badge for reviews', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'contributor-id',
        role: 'contributor'
      }
    })
    mockPathname.mockReturnValue('/dashboard')

    // Mock pending reviews count
    vi.mock('@/hooks/use-pending-reviews', () => ({
      usePendingReviews: () => ({ count: 3 })
    }))

    render(<MainNav />)

    const reviewsLink = screen.getByText('Reviews')
    expect(reviewsLink.parentElement?.querySelector('.badge')).toHaveTextContent('3')
  })

  it('adapts for mobile view', () => {
    mockUser.mockReturnValue({
      user: {
        id: 'reader-id',
        role: 'reader'
      }
    })
    mockPathname.mockReturnValue('/dashboard')

    // Mock mobile viewport
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    render(<MainNav />)

    // Should show mobile menu button
    expect(screen.getByRole('button', { name: /Menu/i })).toBeInTheDocument()
  })
})