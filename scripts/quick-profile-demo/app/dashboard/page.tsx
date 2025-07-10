'use client'
import Navigation from '@/components/Navigation'
import { currentUser, profiles } from '@/lib/mockData'
import { Calendar, FileText, Users, TrendingUp, Clock, Award } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function DashboardPage() {
  const userProfile = profiles[currentUser.id]
  
  const stats = [
    { label: 'Theories Created', value: '12', icon: FileText, color: 'text-[var(--primary)]' },
    { label: 'Collaborations', value: '28', icon: Users, color: 'text-[var(--secondary)]' },
    { label: 'Impact Score', value: '92', icon: TrendingUp, color: 'text-[var(--accent)]' },
    { label: 'Recognition', value: userProfile.recognitions.length.toString(), icon: Award, color: 'text-[var(--primary)]' },
  ]
  
  const recentActivities = [
    { id: 1, action: 'Updated theory', item: 'Ethical AI Framework v2.0', time: '2 hours ago', icon: FileText },
    { id: 2, action: 'Joined collaboration', item: 'Climate Tech Initiative', time: '1 day ago', icon: Users },
    { id: 3, action: 'Received recognition from', item: 'John Doe', time: '3 days ago', icon: Award },
    { id: 4, action: 'Published resource', item: 'AI Ethics Toolkit', time: '1 week ago', icon: FileText },
  ]
  
  return (
    <>
      <Navigation user={currentUser} />
      
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="profile-card p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href={`/profile/${currentUser.id}`} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden relative hover:ring-4 hover:ring-[var(--accent)]/20 transition-all">
                  <Image 
                    src={userProfile.avatar_url} 
                    alt={userProfile.display_name} 
                    fill 
                    className="object-cover"
                  />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  Welcome back, {userProfile.display_name}!
                </h1>
                <p className="text-[var(--muted)]">{userProfile.title}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="profile-card p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>{' '}
                          <span className="text-[var(--primary)]">{activity.item}</span>
                        </p>
                        <p className="text-xs text-[var(--muted)]">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="profile-card p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link href="/theories/new" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold mb-1">Create New Theory</h3>
                  <p className="text-sm text-[var(--muted)]">Start documenting your theory of change</p>
                </Link>
                <Link href="/collaborate" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold mb-1">Find Collaborators</h3>
                  <p className="text-sm text-[var(--muted)]">Connect with others working on similar challenges</p>
                </Link>
                <Link href={`/profile/${currentUser.id}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold mb-1">Update Profile</h3>
                  <p className="text-sm text-[var(--muted)]">Keep your experience and skills up to date</p>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Recognitions */}
          {userProfile.recognitions.length > 0 && (
            <div className="profile-card p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Recognition
              </h2>
              <div className="space-y-4">
                {userProfile.recognitions.slice(0, 2).map((recognition) => (
                  <div key={recognition.id} className="border-l-4 border-[var(--accent)] pl-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                        <Image 
                          src={recognition.from_user.avatar} 
                          alt={recognition.from_user.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{recognition.from_user.name}</p>
                        <p className="text-sm text-[var(--muted)]">{recognition.from_user.title}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{recognition.message}</p>
                    <p className="text-xs text-[var(--muted)]">{recognition.date}</p>
                  </div>
                ))}
              </div>
              <Link 
                href={`/profile/${currentUser.id}#recognition`} 
                className="text-[var(--accent)] hover:text-[var(--primary)] text-sm font-medium mt-4 inline-block"
              >
                View all recognition →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}