'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@ltoc/ui'
import { useUser } from '@/hooks/use-user'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Eye, 
  Brain, 
  MessageSquare, 
  Search, 
  Settings, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react'

export function MainNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/content',
      label: 'Browse Content',
      icon: FileText,
      show: true,
    },
    {
      href: '/content/create',
      label: 'Create',
      icon: PlusCircle,
      show: user?.role === 'contributor' || user?.role === 'admin',
    },
    {
      href: '/reviews',
      label: 'Reviews',
      icon: Eye,
      show: user?.role === 'contributor' || user?.role === 'admin',
    },
    {
      href: '/synthesis',
      label: 'AI Synthesis',
      icon: Brain,
      show: true,
    },
    {
      href: '/chat',
      label: 'AI Chat',
      icon: MessageSquare,
      show: true,
    },
    {
      href: '/search',
      label: 'Search',
      icon: Search,
      show: true,
    },
    {
      href: '/admin',
      label: 'Admin',
      icon: Settings,
      show: user?.role === 'admin',
    },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="flex items-center">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center space-x-2 mr-6"
      >
        <Sparkles className="h-6 w-6 text-blue-600" />
        <span className="font-bold text-xl">LTOC</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => {
          if (!item.show) return null
          
          const Icon = item.icon
          const isActive = pathname?.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={toggleMobileMenu} />
          <div className="fixed top-0 left-0 w-3/4 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={toggleMobileMenu}
              >
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-xl">LTOC</span>
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                if (!item.show) return null
                
                const Icon = item.icon
                const isActive = pathname?.startsWith(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}