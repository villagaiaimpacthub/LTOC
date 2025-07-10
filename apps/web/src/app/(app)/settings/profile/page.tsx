'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Bell, Shield, Palette, 
  ChevronLeft, Plus, Trash2 
} from 'lucide-react'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Button } from '@ltoc/ui'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [experiences, setExperiences] = useState([])
  const [achievements, setAchievements] = useState([])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  const handleExperienceSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('user_experiences')
        .insert({ ...data, user_id: user.id })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Experience added successfully',
      })
      
      // Refresh experiences
      fetchExperiences()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from('user_experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
    
    setExperiences(data || [])
  }

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
                      ? 'bg-blue-50 text-blue-700'
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
                <h2 className="text-xl font-semibold mb-6">Work Experience</h2>
                <ExperienceForm onSubmit={handleExperienceSubmit} />
                <div className="mt-8 space-y-4">
                  {experiences.map((exp: any) => (
                    <div key={exp.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{exp.role}</h4>
                          <p className="text-sm text-gray-600">{exp.organization_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(exp.start_date).toLocaleDateString()} - 
                            {exp.is_current ? ' Present' : ` ${new Date(exp.end_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Achievements</h2>
                <AchievementForm onSubmit={handleAchievementSubmit} />
                {/* Achievement list similar to experience */}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                <NotificationSettings user={user} />
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                <PrivacySettings user={user} />
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                <AppearanceSettings user={user} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Component implementations for forms would go here...
function ExperienceForm({ onSubmit }: any) {
  // Implementation
  return <div>Experience form implementation</div>
}

function AchievementForm({ onSubmit }: any) {
  // Implementation
  return <div>Achievement form implementation</div>
}

function NotificationSettings({ user }: any) {
  // Implementation
  return <div>Notification settings implementation</div>
}

function PrivacySettings({ user }: any) {
  // Implementation
  return <div>Privacy settings implementation</div>
}

function AppearanceSettings({ user }: any) {
  // Implementation
  return <div>Appearance settings implementation</div>
}

// Add missing imports
import { Award, Briefcase } from 'lucide-react'

const handleAchievementSubmit = async (data: any) => {
  // Implementation similar to experience
}