import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from '../page'

// Mock Next.js
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Supabase
const mockFrom = vi.fn()
const mockStorage = vi.fn()
const mockAuth = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: mockFrom,
      storage: mockStorage,
      auth: mockAuth
    }
  })
}))

// Mock user hook
const mockUser = vi.fn()
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUser()
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  toast: (props: any) => mockToast(props)
}))

// Mock validation
vi.mock('@ltoc/utils', () => ({
  validationSchemas: {
    displayName: { parse: (v: string) => v },
    email: { parse: (v: string) => v },
    password: { parse: (v: string) => v }
  }
}))

describe('ProfilePage', () => {
  const mockUserData = {
    id: 'user-1',
    email: 'user@example.com',
    display_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about systems thinking',
    role: 'contributor',
    created_at: new Date('2024-01-01').toISOString(),
    organization: {
      name: 'Test Organization'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUser.mockReturnValue({
      user: mockUserData
    })

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      }),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockUserData,
        error: null
      })
    })

    mockAuth.mockReturnValue({
      updateUser: vi.fn().mockResolvedValue({
        error: null
      })
    })
  })

  it('displays user profile information', async () => {
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument()
      expect(screen.getByText('Software developer passionate about systems thinking')).toBeInTheDocument()
      expect(screen.getByText('Contributor')).toBeInTheDocument()
      expect(screen.getByText('Test Organization')).toBeInTheDocument()
    })
  })

  it('updates profile information', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    // Update display name
    const nameInput = screen.getByLabelText(/Display Name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    // Update bio
    const bioInput = screen.getByLabelText(/Bio/i)
    await user.clear(bioInput)
    await user.type(bioInput, 'Updated bio')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockFrom().update).toHaveBeenCalledWith({
        display_name: 'Jane Doe',
        bio: 'Updated bio'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    })
  })

  it('handles avatar upload', async () => {
    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })
    
    mockStorage.mockReturnValue({
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'avatars/new-avatar.jpg' },
          error: null
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/new-avatar.jpg' }
        })
      })
    })

    const user = userEvent.setup()
    render(<ProfilePage />)

    const fileInput = screen.getByLabelText(/Avatar/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(mockStorage().from).toHaveBeenCalledWith('avatars')
      expect(mockFrom().update).toHaveBeenCalledWith({
        avatar_url: 'https://example.com/new-avatar.jpg'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Avatar updated successfully'
      })
    })
  })

  it('validates file size for avatar upload', async () => {
    const largeMockFile = new File(
      ['x'.repeat(6 * 1024 * 1024)], // 6MB
      'large.jpg',
      { type: 'image/jpeg' }
    )

    const user = userEvent.setup()
    render(<ProfilePage />)

    const fileInput = screen.getByLabelText(/Avatar/i)
    await user.upload(fileInput, largeMockFile)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive'
      })
    })
  })

  it('validates file type for avatar upload', async () => {
    const invalidFile = new File(['doc'], 'document.pdf', { type: 'application/pdf' })

    const user = userEvent.setup()
    render(<ProfilePage />)

    const fileInput = screen.getByLabelText(/Avatar/i)
    await user.upload(fileInput, invalidFile)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Only image files are allowed',
        variant: 'destructive'
      })
    })
  })

  it('changes password', async () => {
    mockAuth.mockReturnValue({
      updateUser: vi.fn().mockResolvedValue({
        data: { user: {} },
        error: null
      })
    })

    const user = userEvent.setup()
    render(<ProfilePage />)

    // Open password change section
    const changePasswordButton = screen.getByRole('button', { name: /Change Password/i })
    await user.click(changePasswordButton)

    // Fill password fields
    await user.type(screen.getByLabelText(/Current Password/i), 'oldPassword123!')
    await user.type(screen.getByLabelText(/New Password/i), 'newPassword123!')
    await user.type(screen.getByLabelText(/Confirm Password/i), 'newPassword123!')

    // Submit password change
    const updatePasswordButton = screen.getByRole('button', { name: /Update Password/i })
    await user.click(updatePasswordButton)

    await waitFor(() => {
      expect(mockAuth().updateUser).toHaveBeenCalledWith({
        password: 'newPassword123!'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Password updated successfully'
      })
    })
  })

  it('validates password match', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)

    // Open password change section
    const changePasswordButton = screen.getByRole('button', { name: /Change Password/i })
    await user.click(changePasswordButton)

    // Fill password fields with mismatch
    await user.type(screen.getByLabelText(/Current Password/i), 'oldPassword123!')
    await user.type(screen.getByLabelText(/New Password/i), 'newPassword123!')
    await user.type(screen.getByLabelText(/Confirm Password/i), 'differentPassword123!')

    // Submit password change
    const updatePasswordButton = screen.getByRole('button', { name: /Update Password/i })
    await user.click(updatePasswordButton)

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
      expect(mockAuth().updateUser).not.toHaveBeenCalled()
    })
  })

  it('displays user statistics', async () => {
    // Mock statistics queries
    mockFrom.mockImplementation((table) => {
      if (table === 'content') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue({
            count: 15,
            error: null
          })
        }
      }
      if (table === 'content_likes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue({
            count: 45,
            error: null
          })
        }
      }
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument() // Content count
      expect(screen.getByText('45')).toBeInTheDocument() // Likes received
      expect(screen.getByText(/Content Created/i)).toBeInTheDocument()
      expect(screen.getByText(/Likes Received/i)).toBeInTheDocument()
    })
  })

  it('handles profile update errors', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: new Error('Update failed')
      })
    })

    const user = userEvent.setup()
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    const nameInput = screen.getByLabelText(/Display Name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Update failed',
        variant: 'destructive'
      })
    })
  })

  it('shows loading state during save', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      )
    })

    const user = userEvent.setup()
    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled()
  })

  it('redirects if no user is logged in', () => {
    mockUser.mockReturnValue({ user: null })

    render(<ProfilePage />)

    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })
})