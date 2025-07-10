'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, User, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
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
              <Sparkles className="w-8 h-8 text-primary mr-2" />
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
                        ? 'border-primary text-gray-900'
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
            {user ? (
              <>
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 hover:text-primary">
                  <User className="w-5 h-5" />
                  <span className="hidden md:block">{user.display_name}</span>
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary px-4 py-2 rounded-md text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
