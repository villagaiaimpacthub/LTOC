'use client'

import { Avatar, AvatarFallback } from '@ltoc/ui'
import { Button } from '@ltoc/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { NotificationsDropdown } from '@/components/notifications-dropdown'
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronDown,
  Circle
} from 'lucide-react'

export function UserNav() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900" asChild>
          <a href="/auth/login">Sign in</a>
        </Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
          <a href="/auth/signup">Sign up</a>
        </Button>
      </div>
    )
  }

  const initials = user.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user.email[0].toUpperCase()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600'
      case 'contributor':
        return 'text-blue-600'
      case 'reviewer':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'contributor':
        return 'Contributor'
      case 'reviewer':
        return 'Reviewer'
      default:
        return 'Member'
    }
  }

  return (
    <div className="flex items-center gap-3">
      <NotificationsDropdown />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-600 text-white font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">{user.display_name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Circle className={`h-2 w-2 fill-current ${getRoleColor(user.role)}`} />
                <span className={`text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </a>
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <DropdownMenuItem asChild>
              <a href="/admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}