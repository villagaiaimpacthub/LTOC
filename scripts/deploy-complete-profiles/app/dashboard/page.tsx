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
                fill
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
