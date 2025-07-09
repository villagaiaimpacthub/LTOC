import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUser } from '../use-user'
import { SupabaseProvider } from '@/components/supabase-provider'
import { ReactNode } from 'react'

// Mock the supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}

vi.mock('@ltoc/database', () => ({
  supabase: mockSupabase,
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <SupabaseProvider>{children}</SupabaseProvider>
)

describe('useUser Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null user when not authenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    const { result } = renderHook(() => useUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('fetches user data when authenticated', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    }
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'contributor',
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValue({
      data: mockUser,
      error: null,
    })

    const { result } = renderHook(() => useUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles errors gracefully', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })

    mockSupabase.from().single.mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    })

    const { result } = renderHook(() => useUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
  })
})