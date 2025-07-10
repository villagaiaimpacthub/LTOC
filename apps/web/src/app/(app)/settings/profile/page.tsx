'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Bell, Shield, Palette, 
  ChevronLeft, Award, Briefcase 
} from 'lucide-react'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ExperienceForm } from '@/components/profile/ExperienceForm'
import { AchievementsForm } from '@/components/profile/AchievementsForm'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import Link from 'next/link'
import type { UserExperience, UserAchievement } from '@/types/profile'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const { supabase } = useSupabase()
  const [activeTab, setActiveTab] = useState('profile')
  const [experiences, setExperiences] = useState<UserExperience[]>([])
  const [achievements, setAchievements] = useState<UserAchievement[]>([])

  useEffect(() => {
    if (user) {
      fetchExperiences()
      fetchAchievements()
    }
  }, [user])

  const fetchExperiences = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('user_experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
    
    if (data) {
      setExperiences(data)
    }
  }

  const fetchAchievements = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('date_achieved', { ascending: false, nullsFirst: false })
    
    if (data) {
      setAchievements(data)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--profile-primary)]"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href={`/profile/${user.id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--profile-primary)] bg-opacity-10 text-[var(--profile-primary)]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <ProfileForm user={user} onUpdate={() => router.refresh()} />
              </div>
            )}

            {activeTab === 'experience' && (
              <div>
                <ExperienceForm 
                  userId={user.id} 
                  experiences={experiences}
                  onUpdate={fetchExperiences}
                />
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <AchievementsForm 
                  userId={user.id} 
                  achievements={achievements}
                  onUpdate={fetchAchievements}
                />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Notification preferences can be configured here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Privacy settings can be configured here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Appearance settings can be configured here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}