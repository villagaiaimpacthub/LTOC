import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserManagementTable } from '../user-management-table'

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

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  toast: (props: any) => mockToast(props)
}))

describe('UserManagementTable', () => {
  const mockUsers = [
    {
      id: 'user-1',
      display_name: 'John Doe',
      email: 'john@example.com',
      role: 'contributor',
      status: 'active',
      organization: {
        name: 'Org A'
      },
      created_at: new Date('2024-01-01').toISOString()
    },
    {
      id: 'user-2',
      display_name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'reader',
      status: 'active',
      organization: {
        name: 'Org B'
      },
      created_at: new Date('2024-01-02').toISOString()
    },
    {
      id: 'user-3',
      display_name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'admin',
      status: 'suspended',
      organization: {
        name: 'Org A'
      },
      created_at: new Date('2024-01-03').toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock setup
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockUsers,
        error: null
      })
    })
  })

  it('renders user table with all users', async () => {
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    })
  })

  it('displays user roles and statuses', async () => {
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('Contributor')).toBeInTheDocument()
      expect(screen.getByText('Reader')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getAllByText('Active')).toHaveLength(2)
      expect(screen.getByText('Suspended')).toBeInTheDocument()
    })
  })

  it('filters users by search query', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search users/i)
    await user.type(searchInput, 'jane')

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument()
  })

  it('filters users by role', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const roleFilter = screen.getByRole('combobox', { name: /Filter by role/i })
    await user.click(roleFilter)
    await user.click(screen.getByText('Admin'))

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
  })

  it('filters users by status', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const statusFilter = screen.getByRole('combobox', { name: /Filter by status/i })
    await user.click(statusFilter)
    await user.click(screen.getByText('Suspended'))

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
  })

  it('opens edit modal when clicking edit', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Edit/i })
    await user.click(editButtons[0])

    expect(screen.getByText('Edit User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
  })

  it('updates user role successfully', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Open edit modal
    const editButtons = screen.getAllByRole('button', { name: /Edit/i })
    await user.click(editButtons[0])

    // Change role
    const roleSelect = screen.getByLabelText('Role')
    await user.selectOptions(roleSelect, 'admin')

    // Save changes
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockFrom().update).toHaveBeenCalledWith({
        role: 'admin'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'User updated successfully'
      })
    })
  })

  it('suspends user account', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Find the user row with John Doe
    const johnRow = screen.getByText('John Doe').closest('tr')
    const suspendButton = johnRow?.querySelector('button[title="Suspend user"]')
    
    if (suspendButton) {
      await user.click(suspendButton)
    }

    // Confirm suspension
    await waitFor(() => {
      expect(screen.getByText('Confirm Suspension')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockFrom().update).toHaveBeenCalledWith({
        status: 'suspended'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'User suspended successfully'
      })
    })
  })

  it('reactivates suspended user', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })

    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    })

    // Find the suspended user row
    const bobRow = screen.getByText('Bob Wilson').closest('tr')
    const reactivateButton = bobRow?.querySelector('button[title="Reactivate user"]')
    
    if (reactivateButton) {
      await user.click(reactivateButton)
    }

    await waitFor(() => {
      expect(mockFrom().update).toHaveBeenCalledWith({
        status: 'active'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'User reactivated successfully'
      })
    })
  })

  it('handles errors when updating users', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        error: { message: 'Permission denied' }
      })
    })

    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /Edit/i })
    await user.click(editButtons[0])

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Permission denied',
        variant: 'destructive'
      })
    })
  })

  it('exports user data', async () => {
    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const exportButton = screen.getByRole('button', { name: /Export/i })
    await user.click(exportButton)

    // Check that download was triggered
    expect(screen.getByText(/Exported \d+ users/i)).toBeInTheDocument()
  })

  it('paginates users correctly', async () => {
    // Create many users for pagination
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      id: `user-${i}`,
      display_name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'reader',
      status: 'active',
      organization: { name: 'Test Org' },
      created_at: new Date().toISOString()
    }))

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: manyUsers,
        error: null
      })
    })

    const user = userEvent.setup()
    render(<UserManagementTable users={mockUsers} />)

    await waitFor(() => {
      expect(screen.getByText('User 0')).toBeInTheDocument()
      expect(screen.queryByText('User 20')).not.toBeInTheDocument()
    })

    // Navigate to next page
    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    expect(screen.queryByText('User 0')).not.toBeInTheDocument()
    expect(screen.getByText('User 20')).toBeInTheDocument()
  })
})