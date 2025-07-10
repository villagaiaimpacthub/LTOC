'use client'
import { TrendingUp, Users, FileText, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Active Theories', value: '24', icon: FileText, trend: '+12%' },
    { label: 'Collaborators', value: '156', icon: Users, trend: '+8%' },
    { label: 'Impact Score', value: '8.9', icon: TrendingUp, trend: '+15%' },
    { label: 'Hours Saved', value: '320', icon: Clock, trend: '+23%' },
  ]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{user ? `, ${user.display_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your theories today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="profile-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New collaboration request</p>
                  <p className="text-sm text-muted-foreground">From Dr. Emily Chen</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theory approved</p>
                  <p className="text-sm text-muted-foreground">Climate Action Framework</p>
                </div>
                <span className="text-xs text-muted-foreground">5h ago</span>
              </div>
            </div>
            <Link href="/theories" className="flex items-center gap-2 text-primary mt-4 hover:opacity-80">
              View all activity <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/theories/new" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Create New Theory</h3>
                <p className="text-sm text-muted-foreground">Start documenting your theory of change</p>
              </Link>
              <Link href={user ? `/profile/${user.id}` : '/login'} className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Update Profile</h3>
                <p className="text-sm text-muted-foreground">Add your latest achievements and experience</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
