import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserNav } from '../user-nav'

// Mock Next.js
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Supabase
const mockSignOut = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signOut: mockSignOut
      }
    }
  })
}))

// Mock user hook
const mockUser = vi.fn()
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUser()
}))

// Mock notifications hook
const mockNotifications = vi.fn()
vi.mock('@/contexts/notifications-context', () => ({
  useNotifications: () => mockNotifications()
}))

describe('UserNav', () => {
  const defaultUser = {
    id: 'user-1',
    email: 'user@example.com',
    display_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'contributor'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUser.mockReturnValue({ user: defaultUser })
    mockNotifications.mockReturnValue({
      unreadCount: 0
    })
    mockSignOut.mockResolvedValue({ error: null })
  })

  it('displays user information', () => {
    render(<UserNav />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows user initials when no avatar', () => {
    mockUser.mockReturnValue({
      user: { ...defaultUser, avatar_url: null }
    })

    render(<UserNav />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows notification badge with count', () => {
    mockNotifications.mockReturnValue({
      unreadCount: 5
    })

    render(<UserNav />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument()
  })

  it('opens user menu on click', async () => {
    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('navigates to profile', async () => {
    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    const profileLink = screen.getByText('Profile')
    await user.click(profileLink)

    expect(mockPush).toHaveBeenCalledWith('/profile')
  })

  it('navigates to settings', async () => {
    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    const settingsLink = screen.getByText('Settings')
    await user.click(settingsLink)

    expect(mockPush).toHaveBeenCalledWith('/settings')
  })

  it('handles sign out', async () => {
    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    const signOutButton = screen.getByText('Sign out')
    await user.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('handles sign out error', async () => {
    mockSignOut.mockResolvedValue({ 
      error: new Error('Sign out failed') 
    })

    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    const signOutButton = screen.getByText('Sign out')
    await user.click(signOutButton)

    await waitFor(() => {
      expect(screen.getByText(/Error signing out/i)).toBeInTheDocument()
    })
  })

  it('shows admin link for admin users', async () => {
    mockUser.mockReturnValue({
      user: { ...defaultUser, role: 'admin' }
    })

    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })

  it('opens notifications dropdown', async () => {
    mockNotifications.mockReturnValue({
      unreadCount: 3,
      notifications: [
        {
          id: '1',
          title: 'New content published',
          message: 'Your content has been published',
          created_at: new Date().toISOString(),
          read_at: null
        }
      ]
    })

    const user = userEvent.setup()
    render(<UserNav />)

    const notificationButton = screen.getByRole('button', { name: /Notifications/i })
    await user.click(notificationButton)

    expect(screen.getByText('New content published')).toBeInTheDocument()
    expect(screen.getByText('Your content has been published')).toBeInTheDocument()
  })

  it('shows keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    const shortcutsButton = screen.getByText('Keyboard shortcuts')
    await user.click(shortcutsButton)

    await waitFor(() => {
      expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument()
      expect(screen.getByText(/Search/i)).toBeInTheDocument()
      expect(screen.getByText(/Create new/i)).toBeInTheDocument()
    })
  })

  it('shows theme toggle', async () => {
    const user = userEvent.setup()
    render(<UserNav />)

    const userButton = screen.getByRole('button', { name: /Open user menu/i })
    await user.click(userButton)

    expect(screen.getByRole('button', { name: /Toggle theme/i })).toBeInTheDocument()
  })

  it('displays role badge', () => {
    mockUser.mockReturnValue({
      user: { ...defaultUser, role: 'admin' }
    })

    render(<UserNav />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toHaveClass('bg-red-100')
  })

  it('handles loading state', () => {
    mockUser.mockReturnValue({ user: null, loading: true })

    render(<UserNav />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles unauthenticated state', () => {
    mockUser.mockReturnValue({ user: null })

    render(<UserNav />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toHaveAttribute('href', '/auth/login')
  })
})