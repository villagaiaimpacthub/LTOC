'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label } from '@ltoc/ui'
import { Bell, Mail, Smartphone, Moon, Save, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/toast'

interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
  preferences: {
    [key: string]: {
      email: boolean
      push: boolean
    }
  }
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
}

const notificationTypes = [
  { 
    key: 'content_published', 
    label: 'Content Published',
    description: 'When your content is published'
  },
  { 
    key: 'content_reviewed', 
    label: 'Content Reviewed',
    description: 'When your content receives a review'
  },
  { 
    key: 'review_assigned', 
    label: 'Review Assigned',
    description: 'When you are assigned to review content'
  },
  { 
    key: 'review_decision', 
    label: 'Review Decision',
    description: 'When a review decision is made on your content'
  },
  { 
    key: 'mention', 
    label: 'Mentions',
    description: 'When someone mentions you'
  },
  { 
    key: 'comment', 
    label: 'Comments',
    description: 'When someone comments on your content'
  },
  { 
    key: 'collaboration_invite', 
    label: 'Collaboration Invites',
    description: 'When you receive collaboration invitations'
  },
  { 
    key: 'achievement', 
    label: 'Achievements',
    description: 'When you unlock achievements'
  },
  { 
    key: 'system_announcement', 
    label: 'System Announcements',
    description: 'Important platform updates'
  }
]

export default function NotificationSettingsPage() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    preferences: {},
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'UTC'
  })

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setPreferences(data)
        } else {
          // Create default preferences
          const defaultPrefs = {
            user_id: user.id,
            email_enabled: true,
            push_enabled: true,
            preferences: notificationTypes.reduce((acc, type) => ({
              ...acc,
              [type.key]: { email: true, push: true }
            }), {}),
            quiet_hours_enabled: false,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }

          const { data: newData } = await supabase
            .from('notification_preferences')
            .insert(defaultPrefs)
            .select()
            .single()

          if (newData) setPreferences(newData)
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user, supabase])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: preferences.email_enabled,
          push_enabled: preferences.push_enabled,
          preferences: preferences.preferences,
          quiet_hours_enabled: preferences.quiet_hours_enabled,
          quiet_hours_start: preferences.quiet_hours_start,
          quiet_hours_end: preferences.quiet_hours_end,
          timezone: preferences.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated'
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Error',
        description: 'Failed to save preferences'
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleTypePreference = (type: string, channel: 'email' | 'push') => {
    setPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: {
          ...prev.preferences[type],
          [channel]: !prev.preferences[type]?.[channel]
        }
      }
    }))
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Notification Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Master switches */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Enable or disable notification channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_enabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, email_enabled: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive in-app notifications
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.push_enabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, push_enabled: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationTypes.map(type => (
                <div key={type.key} className="border-b pb-4 last:border-0">
                  <div className="mb-2">
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferences[type.key]?.email ?? true}
                        onChange={() => toggleTypePreference(type.key, 'email')}
                        disabled={!preferences.email_enabled}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.preferences[type.key]?.push ?? true}
                        onChange={() => toggleTypePreference(type.key, 'push')}
                        disabled={!preferences.push_enabled}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiet hours */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>
              Pause notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    No notifications during quiet hours
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.quiet_hours_enabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_enabled: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pl-8">
                <div>
                  <Label>Start Time</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}