'use client'
import Link from 'next/link'
import Image from 'next/image'
import { 
  TrendingUp, Users, FileText, Clock, 
  ArrowRight, Activity, Sparkles, Eye,
  MessageSquare, Calendar, Brain, Award
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  
  const stats = [
    { label: 'Active Theories', value: '24', change: '+3', icon: FileText, color: 'text-primary' },
    { label: 'Collaborators', value: '156', change: '+12', icon: Users, color: 'text-secondary' },
    { label: 'Reviews Pending', value: '8', change: '-2', icon: Eye, color: 'text-yellow-600' },
    { label: 'Recognition', value: '47', change: '+15', icon: Award, color: 'text-accent' },
  ]
  
  const recentActivities = [
    { type: 'theory', action: 'updated', item: 'Climate Action Framework', user: 'Sarah Chen', time: '2 hours ago' },
    { type: 'review', action: 'approved', item: 'Education Innovation Model', user: 'John Doe', time: '5 hours ago' },
    { type: 'ai', action: 'generated', item: 'Synthesis Report Q4', user: 'AI Assistant', time: '1 day ago' },
    { type: 'recognition', action: 'received', item: 'Recognition from Maria Garcia', user: 'Maria Garcia', time: '2 days ago' },
  ]

  const recentRecognitions = [
    { from: 'Dr. Emily Chen', message: 'Outstanding work on the AI Ethics framework!', date: '2024-01-15' },
    { from: 'Maria Rodriguez', message: 'Your insights on bias mitigation are game-changing.', date: '2024-01-14' },
  ]

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.display_name}!</h1>
            <p className="text-gray-600">Here's what's happening with your theories today.</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="profile-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gray-100`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="profile-card">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                Recent Activity
                <Activity className="w-5 h-5 text-gray-400" />
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'theory' ? 'bg-primary' :
                      activity.type === 'review' ? 'bg-green-500' :
                      activity.type === 'ai' ? 'bg-purple-500' : 
                      activity.type === 'recognition' ? 'bg-accent' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/theories" className="mt-4 text-sm text-accent hover:opacity-80 flex items-center">
                View all activity
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="profile-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              Quick Actions
              <Sparkles className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/theories/new" className="btn-primary justify-center">
                <FileText className="w-4 h-4" />
                New Theory
              </Link>
              <Link href="/synthesis" className="btn-secondary justify-center">
                <Brain className="w-4 h-4" />
                AI Synthesis
              </Link>
              <Link href="/collaborate" className="btn-secondary justify-center">
                <Users className="w-4 h-4" />
                Collaborate
              </Link>
              <Link href={`/profile/${user.id}`} className="btn-secondary justify-center">
                <Award className="w-4 h-4" />
                View Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="profile-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              Upcoming Events
              <Calendar className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-3">
                <p className="font-medium text-sm">Theory Review Meeting</p>
                <p className="text-xs text-gray-500">Today at 2:00 PM</p>
              </div>
              <div className="border-l-4 border-secondary pl-3">
                <p className="font-medium text-sm">AI Workshop</p>
                <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
              </div>
              <div className="border-l-4 border-accent pl-3">
                <p className="font-medium text-sm">Quarterly Synthesis</p>
                <p className="text-xs text-gray-500">Friday at 3:00 PM</p>
              </div>
            </div>
          </div>

          <div className="profile-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Recognition</h2>
              <Link href={`/profile/${user.id}#recognition`} className="text-accent hover:opacity-80 text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentRecognitions.map((rec, i) => (
                <div key={i} className="pb-3 border-b last:border-0">
                  <p className="text-sm font-medium">{rec.from}</p>
                  <p className="text-sm text-gray-600">{rec.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              AI Assistant
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get instant help with your theories
            </p>
            <Link href="/synthesis" className="btn-primary w-full justify-center">
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
