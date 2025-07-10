'use client'
import { TrendingUp, Users, FileText, Clock, ArrowRight, Activity, Award, Sparkles, Eye, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data-context'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()
  const { theories } = useData()

  const stats = [
    { label: 'Active Theories', value: theories.length.toString(), icon: FileText, trend: '+3 this month' },
    { label: 'Collaborators', value: '48', icon: Users, trend: '+8 this month' },
    { label: 'Impact Score', value: '9.2', icon: TrendingUp, trend: '+0.5 this month' },
    { label: 'Recognition', value: '24', icon: Award, trend: '+5 this month' },
  ]

  const recentActivity = [
    { icon: Eye, title: 'Theory reviewed', desc: 'Climate Action Framework approved', time: '2h ago' },
    { icon: Users, title: 'New collaborator', desc: 'Dr. Emily Chen joined your theory', time: '4h ago' },
    { icon: MessageSquare, title: 'New comment', desc: 'Feedback on Education Reform theory', time: '6h ago' },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with Profile */}
        {user && (
          <div className="mb-8">
            <Link href={`/profile/${user.id}`} className="inline-flex items-center gap-4 hover:opacity-80">
              <div className="w-16 h-16 rounded-full overflow-hidden relative">
                <Image 
                  src={user.avatar_url || ''} 
                  alt={user.display_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user.display_name}!</h1>
                <p className="text-muted">Here's what's happening with your theories today.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="profile-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-accent" />
                  <span className="text-sm text-accent font-medium">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Recent Theories & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Theories */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Theories
            </h2>
            <div className="space-y-4">
              {theories.slice(0, 3).map((theory) => (
                <div key={theory.id} className="border-b pb-3 last:border-0">
                  <Link href={`/theories/${theory.id}`} className="hover:text-accent">
                    <h3 className="font-medium">{theory.title}</h3>
                    <p className="text-sm text-muted">
                      Updated {format(new Date(theory.updated), 'MMM d, yyyy')}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/theories" className="flex items-center gap-2 text-accent mt-4 hover:opacity-80">
              View all theories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted">{activity.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 profile-card p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/theories/new" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-1">Create New Theory</h3>
              <p className="text-sm text-muted">Start documenting your theory of change</p>
            </Link>
            <Link href="/collaborate" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-1">Join Collaboration</h3>
              <p className="text-sm text-muted">Work with others on shared theories</p>
            </Link>
            {user && (
              <Link href={`/profile/${user.id}`} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Update Profile</h3>
                <p className="text-sm text-muted">Add new experiences or achievements</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
