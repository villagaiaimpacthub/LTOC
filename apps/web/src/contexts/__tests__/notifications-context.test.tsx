import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { NotificationsProvider, useNotifications } from '../notifications-context'
import { ReactNode } from 'react'

// Mock Supabase
const mockFrom = vi.fn()
const mockChannel = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: mockFrom,
      channel: mockChannel,
      rpc: vi.fn()
    }
  })
}))

// Mock user hook
vi.mock('@/hooks/use-user', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      display_name: 'Test User',
      role: 'contributor'
    }
  })
}))

// Mock toast
vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn()
}))

// Test component that uses the hook
function TestComponent() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notification-count">{notifications.length}</div>
      {notifications.map(n => (
        <div key={n.id} data-testid={`notification-${n.id}`}>
          <span>{n.title}</span>
          <span>{n.read_at ? 'read' : 'unread'}</span>
          <button onClick={() => markAsRead(n.id)}>Mark Read</button>
        </div>
      ))}
      <button onClick={markAllAsRead}>Mark All Read</button>
    </div>
  )
}

describe('NotificationsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            user_id: 'test-user-id',
            type: 'content_published',
            title: 'Content Published',
            message: 'Your content was published',
            read_at: null,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: 'test-user-id',
            type: 'review_assigned',
            title: 'Review Assigned',
            message: 'You have a new review',
            read_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        ],
        error: null
      })
    })

    mockChannel.mockReturnValue({
      on: mockOn.mockReturnThis(),
      subscribe: mockSubscribe.mockReturnThis(),
      unsubscribe: mockUnsubscribe
    })
  })

  it('provides notifications context', () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('fetches notifications on mount', async () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('notification-count').textContent).toBe('2')
      expect(screen.getByTestId('unread-count').textContent).toBe('1')
    })
  })

  it('subscribes to real-time updates', async () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(mockChannel).toHaveBeenCalledWith('notifications:test-user-id')
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        }),
        expect.any(Function)
      )
    })
  })

  it('handles new notification via real-time', async () => {
    let insertCallback: any
    mockOn.mockImplementation((event, config, callback) => {
      if (config.event === 'INSERT') {
        insertCallback = callback
      }
      return mockChannel()
    })
    
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-count').textContent).toBe('2')
    })
    
    // Simulate new notification
    act(() => {
      insertCallback({
        new: {
          id: '3',
          user_id: 'test-user-id',
          type: 'mention',
          title: 'New Mention',
          message: 'Someone mentioned you',
          read_at: null,
          created_at: new Date().toISOString()
        }
      })
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-count').textContent).toBe('3')
      expect(screen.getByTestId('unread-count').textContent).toBe('2')
    })
  })

  it('marks notification as read', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [{
          id: '1',
          user_id: 'test-user-id',
          type: 'content_published',
          title: 'Content Published',
          message: 'Your content was published',
          read_at: null,
          created_at: new Date().toISOString()
        }],
        error: null
      })
    }))
    
    // Re-mock supabase with rpc
    vi.mocked(require('@/components/supabase-provider').useSupabase).mockReturnValue({
      supabase: {
        from: mockFrom,
        channel: mockChannel,
        rpc: mockRpc
      }
    })
    
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('1')
    })
    
    const markReadButton = screen.getByText('Mark Read')
    fireEvent.click(markReadButton)
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('mark_notification_read', {
        p_notification_id: '1',
        p_user_id: 'test-user-id'
      })
      expect(screen.getByTestId('unread-count').textContent).toBe('0')
    })
  })

  it('marks all notifications as read', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(require('@/components/supabase-provider').useSupabase).mockReturnValue({
      supabase: {
        from: mockFrom,
        channel: mockChannel,
        rpc: mockRpc
      }
    })
    
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('1')
    })
    
    const markAllButton = screen.getByText('Mark All Read')
    fireEvent.click(markAllButton)
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('mark_all_notifications_read', {
        p_user_id: 'test-user-id'
      })
      expect(screen.getByTestId('unread-count').textContent).toBe('0')
    })
  })

  it('cleans up subscriptions on unmount', async () => {
    const { unmount } = render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled()
    })
    
    unmount()
    
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('handles fetch error gracefully', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Failed to fetch')
      })
    })
    
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('notification-count').textContent).toBe('0')
    })
  })

  it('filters expired notifications', async () => {
    const past = new Date()
    past.setDate(past.getDate() - 1)
    
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            user_id: 'test-user-id',
            type: 'content_published',
            title: 'Active',
            message: 'Active notification',
            read_at: null,
            created_at: new Date().toISOString(),
            expires_at: null
          },
          {
            id: '2',
            user_id: 'test-user-id',
            type: 'system_announcement',
            title: 'Expired',
            message: 'Expired notification',
            read_at: null,
            created_at: new Date().toISOString(),
            expires_at: past.toISOString()
          }
        ],
        error: null
      })
    })
    
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('notification-count').textContent).toBe('1')
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.queryByText('Expired')).not.toBeInTheDocument()
    })
  })
})