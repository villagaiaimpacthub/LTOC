'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, Sparkles, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/theories', label: 'Theories', icon: FileText },
    { href: '/collaborate', label: 'Collaborate', icon: Users },
    { href: '/synthesis', label: 'AI Synthesis', icon: Brain },
    { href: '/review', label: 'Review', icon: Eye },
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
                        : 'border-transparent nav-link hover:border-gray-300'
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
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:opacity-80 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image 
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} 
                      alt={user.display_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden md:block font-medium">{user.display_name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link 
                      href={`/profile/${user.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
