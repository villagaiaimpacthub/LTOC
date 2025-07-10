'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Home, FileText, Users, Brain, Search, Bell, 
  Settings, LogOut, ChevronDown, Sparkles, Eye
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications] = useState(3)
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/theories', label: 'Theories', icon: FileText },
    { href: '/collaborate', label: 'Collaborate', icon: Users },
    { href: '/synthesis', label: 'AI Synthesis', icon: Brain },
    { href: '/review', label: 'Review Queue', icon: Eye },
    { href: '/search', label: 'Search', icon: Search },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Sparkles className="w-8 h-8 text-accent mr-2" />
              <h1 className="text-xl font-bold">LTOC Platform</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-accent text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                      alt={user.display_name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden md:block font-medium mr-1">{user.display_name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-slide-in">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500">
                        {user.email}
                      </div>
                      <Link 
                        href={`/profile/${user.id}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        View Profile
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="inline w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary px-4 py-2 text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
