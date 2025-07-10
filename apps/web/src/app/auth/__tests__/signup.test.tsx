import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '../signup/page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Supabase
const mockSignUp = vi.fn()
const mockSignInWithOAuth = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      auth: {
        signUp: mockSignUp,
        signInWithOAuth: mockSignInWithOAuth
      }
    }
  })
}))

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form with all fields', () => {
    render(<SignupPage />)
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows OAuth buttons', () => {
    render(<SignupPage />)
    
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /linkedin/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<SignupPage />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  it('handles successful signup', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: '123' },
        session: null
      },
      error: null
    })
    
    render(<SignupPage />)
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/^password/i), 'Password123!')
    await userEvent.type(screen.getByLabelText(/organization name/i), 'Test Org')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'Password123!',
        options: {
          data: {
            display_name: 'John Doe',
            organization_name: 'Test Org'
          }
        }
      })
    })
  })

  it('handles signup error', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email already registered' }
    })
    
    render(<SignupPage />)
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/^password/i), 'Password123!')
    await userEvent.type(screen.getByLabelText(/organization name/i), 'Test Org')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })
  })

  it('handles OAuth signup', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      data: { url: 'https://google.com/auth' },
      error: null
    })
    
    render(<SignupPage />)
    
    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)
    
    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback')
        }
      })
    })
  })

  it('shows loading state during submission', async () => {
    mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SignupPage />)
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/^password/i), 'Password123!')
    await userEvent.type(screen.getByLabelText(/organization name/i), 'Test Org')
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)
    
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  it('navigates to login page', () => {
    render(<SignupPage />)
    
    const loginLink = screen.getByText(/already have an account/i).closest('a')
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })

  it('validates password strength', async () => {
    render(<SignupPage />)
    
    const passwordInput = screen.getByLabelText(/^password/i)
    
    // Too short
    await userEvent.type(passwordInput, 'short')
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    
    // No uppercase
    await userEvent.clear(passwordInput)
    await userEvent.type(passwordInput, 'lowercase123!')
    expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
    
    // Valid password
    await userEvent.clear(passwordInput)
    await userEvent.type(passwordInput, 'ValidPass123!')
    expect(screen.queryByText(/at least 8 characters/i)).not.toBeInTheDocument()
  })
})