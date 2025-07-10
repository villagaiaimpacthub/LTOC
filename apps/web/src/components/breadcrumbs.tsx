'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@ltoc/ui'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()
  
  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      icon: Home,
    })
    
    // Build breadcrumbs from path segments
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Map segments to readable labels
      const label = getSegmentLabel(segment, segments, index)
      
      if (label) {
        breadcrumbs.push({
          label,
          href: currentPath,
        })
      }
    })
    
    return breadcrumbs
  }
  
  const getSegmentLabel = (segment: string, segments: string[], index: number): string => {
    // Handle special routes
    const routeMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'content': 'Content',
      'create': 'Create',
      'reviews': 'Reviews',
      'synthesis': 'AI Synthesis',
      'chat': 'AI Chat',
      'search': 'Search',
      'admin': 'Admin',
      'profile': 'Profile',
      'settings': 'Settings',
      'notifications': 'Notifications',
      'collaborate': 'Collaborate',
      'auth': 'Authentication',
      'login': 'Sign In',
      'signup': 'Sign Up',
    }
    
    // If it's a known route, return the mapped label
    if (routeMap[segment]) {
      return routeMap[segment]
    }
    
    // For dynamic routes like [id], we might want to fetch the actual name
    // For now, we'll just capitalize and replace dashes with spaces
    if (segment.match(/^[a-f0-9-]+$/)) {
      // Looks like an ID, show as "Details" or similar
      return 'Details'
    }
    
    // Default: capitalize first letter and replace dashes with spaces
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  // Don't show breadcrumbs for home page
  if (pathname === '/') {
    return null
  }
  
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-gray-500', className)}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = crumb.icon
        
        return (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            )}
            {isLast ? (
              <span className="flex items-center font-medium text-gray-900">
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="flex items-center hover:text-gray-900 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {crumb.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
} 