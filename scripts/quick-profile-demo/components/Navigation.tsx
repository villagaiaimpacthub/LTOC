'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Home, FileText, Users, Brain, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  user?: {
    id: string
    display_name: string
    avatar_url: string
  }
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/theories', label: 'Theories', icon: FileText },
    { href: '/collaborate', label: 'Collaborate', icon: Users },
    { href: '/insights', label: 'Insights', icon: Brain },
  ]
  
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Sparkles className="w-8 h-8 text-[var(--accent)] mr-2" />
              <h1 className="text-xl font-bold">LTOC Platform</h1>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 transition-colors ${
                    isActive 
                      ? 'text-[var(--accent)] font-medium' 
                      : 'text-gray-600 hover:text-[var(--accent)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {user && (
              <Link 
                href={`/profile/${user.id}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-[var(--accent)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <Image 
                    src={user.avatar_url} 
                    alt={user.display_name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <span className="font-medium">{user.display_name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}