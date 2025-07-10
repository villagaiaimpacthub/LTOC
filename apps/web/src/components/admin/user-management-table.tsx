'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { Button } from '@ltoc/ui'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, UserX, Mail, Key } from 'lucide-react'
import type { User } from '@ltoc/database'

interface UserManagementTableProps {
  users: (User & { organization?: { name: string } | null })[]
}

export function UserManagementTable({ users: initialUsers }: UserManagementTableProps) {
  const { supabase } = useSupabase()
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setLoading(userId)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'user_role_changed',
        p_metadata: { user_id: userId, new_role: newRole }
      })

    } catch (err) {
      console.error('Error updating role:', err)
      alert('Failed to update user role')
    } finally {
      setLoading(null)
    }
  }

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return
    
    setLoading(userId)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: false } : user
      ))

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'user_deactivated',
        p_metadata: { user_id: userId }
      })

    } catch (err) {
      console.error('Error deactivating user:', err)
      alert('Failed to deactivate user')
    } finally {
      setLoading(null)
    }
  }

  const handleReactivate = async (userId: string) => {
    setLoading(userId)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: true } : user
      ))

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'user_reactivated',
        p_metadata: { user_id: userId }
      })

    } catch (err) {
      console.error('Error reactivating user:', err)
      alert('Failed to reactivate user')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left text-sm font-medium">User</th>
            <th className="p-2 text-left text-sm font-medium">Organization</th>
            <th className="p-2 text-left text-sm font-medium">Role</th>
            <th className="p-2 text-left text-sm font-medium">Status</th>
            <th className="p-2 text-left text-sm font-medium">Joined</th>
            <th className="p-2 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-2">
                <div>
                  <p className="font-medium">{user.display_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </td>
              <td className="p-2 text-sm">
                {user.organization?.name || '-'}
              </td>
              <td className="p-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : user.role === 'contributor'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="p-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  user.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-2 text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={loading === user.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => window.location.href = `mailto:${user.email}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                    {(['admin', 'contributor', 'reader'] as const).map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleRoleChange(user.id, role)}
                        disabled={user.role === role}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Make {role}
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    
                    {user.is_active ? (
                      <DropdownMenuItem
                        onClick={() => handleDeactivate(user.id)}
                        className="text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleReactivate(user.id)}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Reactivate User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}