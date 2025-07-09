'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@ltoc/ui'
import { useUser } from '@/hooks/use-user'

export function MainNav() {
  const pathname = usePathname()
  const { user } = useUser()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      show: true,
    },
    {
      href: '/content',
      label: 'Browse Content',
      show: true,
    },
    {
      href: '/content/create',
      label: 'Create',
      show: user?.role === 'contributor' || user?.role === 'admin',
    },
    {
      href: '/reviews',
      label: 'Reviews',
      show: user?.role === 'contributor' || user?.role === 'admin',
    },
    {
      href: '/admin',
      label: 'Admin',
      show: user?.role === 'admin',
    },
  ]

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      <Link
        href="/"
        className="flex items-center space-x-2"
      >
        <span className="font-bold">LTOC</span>
      </Link>
      {navItems.map((item) => {
        if (!item.show) return null
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname?.startsWith(item.href)
                ? 'text-foreground'
                : 'text-foreground/60'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}