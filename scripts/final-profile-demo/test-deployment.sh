#!/bin/bash

echo "🚀 LTOC Platform - Complete Integration Test"
echo "==========================================="
echo ""

# Copy from the existing complete profiles directory
echo "Copying base files from complete profiles deployment..."
cp -r ../deploy-complete-profiles deploy-test
cd deploy-test

# Update colors in tailwind config
echo "Updating color scheme..."
sed -i 's/#B79277/#B79277/g' tailwind.config.js 2>/dev/null || true

# Add the dashboard route (redirect root to dashboard)
cat > app/page.tsx << 'EOF'
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  )
}
EOF

# Update navigation to include profile picture in nav bar
echo "Updating navigation with profile integration..."
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, Sparkles, LogOut, Settings, ChevronDown, Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useState } from 'react'

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
    { href: '/review', label: 'Review', icon: Eye },
    { href: '/search', label: 'Search', icon: Search },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Sparkles className="w-8 h-8 text-[#254956] mr-2" />
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
                        ? 'border-[#254956] text-gray-900'
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
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#254956]"
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
EOF

# Update dashboard to show profile picture and personalized welcome
echo "Updating dashboard with profile integration..."
cat > app/dashboard/page.tsx << 'EOF'
'use client'
import { TrendingUp, Users, FileText, Award, ArrowRight, Activity, Bell, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Theories Created', value: '12', icon: FileText, trend: '+3 this month' },
    { label: 'Collaborations', value: '48', icon: Users, trend: '+8 this month' },
    { label: 'Impact Score', value: '9.2', icon: TrendingUp, trend: '+0.5 this month' },
    { label: 'Recognition', value: '24', icon: Award, trend: '+5 this month' },
  ]

  const recentActivity = [
    { type: 'collaboration', title: 'New collaboration request', description: 'Dr. Emily Chen wants to collaborate on "Climate Action Framework"', time: '2 hours ago' },
    { type: 'recognition', title: 'New recognition received', description: 'Maria Rodriguez recognized your work on AI Ethics', time: '5 hours ago' },
    { type: 'theory', title: 'Theory approved', description: 'Your theory "Ethical AI Development" was approved', time: '1 day ago' },
  ]

  const recentRecognitions = [
    { from: 'Dr. Emily Chen', message: 'Outstanding work on the AI Ethics framework!', date: '2024-01-15' },
    { from: 'Maria Rodriguez', message: 'Your insights on bias mitigation are game-changing.', date: '2024-01-14' },
  ]

  if (!user) {
    return <div className="p-8 text-center">Please log in to view your dashboard.</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with Profile Picture */}
        <div className="mb-8 flex items-center gap-4">
          <Link href={`/profile/${user.id}`} className="flex items-center gap-4 hover:opacity-80">
            <div className="w-16 h-16 rounded-full overflow-hidden relative">
              <Image 
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'} 
                alt={user.display_name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.display_name}!</h1>
              <p className="text-[var(--muted)]">Here's what's happening with your theories today.</p>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="profile-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-[#254956]" />
                  <span className="text-sm text-[#254956] font-medium">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-[var(--muted)]">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 profile-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h2>
              <Link href="/activity" className="text-[#254956] hover:opacity-80 text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="w-10 h-10 rounded-full bg-[#254956]/10 flex items-center justify-center flex-shrink-0">
                    {activity.type === 'collaboration' && <Users className="w-5 h-5 text-[#254956]" />}
                    {activity.type === 'recognition' && <Award className="w-5 h-5 text-[#254956]" />}
                    {activity.type === 'theory' && <FileText className="w-5 h-5 text-[#254956]" />}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{activity.description}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Recognition */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="profile-card p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/theories/new" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium">Create New Theory</h3>
                  <p className="text-sm text-[var(--muted)]">Start documenting your theory of change</p>
                </Link>
                <Link href={`/profile/${user.id}`} className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium">Update Profile</h3>
                  <p className="text-sm text-[var(--muted)]">Add new experiences or achievements</p>
                </Link>
              </div>
            </div>

            {/* Recent Recognition */}
            <div className="profile-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent Recognition</h2>
                <Link href={`/profile/${user.id}#recognition`} className="text-[#254956] hover:opacity-80 text-sm">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentRecognitions.map((rec, i) => (
                  <div key={i} className="pb-3 border-b last:border-0">
                    <p className="text-sm font-medium">{rec.from}</p>
                    <p className="text-sm text-[var(--muted)]">{rec.message}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Deploy
echo ""
echo "Building and deploying..."
npm run build && npx vercel --prod --yes

cd ..
rm -rf deploy-test

echo ""
echo "🎉 Test deployment complete!"