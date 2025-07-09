'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { Loader2, Check } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user, loading: userLoading } = useUser()
  
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [expertise, setExpertise] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '')
      setBio(user.profile?.bio || '')
      setExpertise(user.profile?.expertise?.join(', ') || '')
      setAffiliation(user.profile?.affiliation || '')
    }
  }, [user])

  if (userLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const expertiseArray = expertise
        .split(',')
        .map(e => e.trim())
        .filter(Boolean)

      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: displayName,
          profile: {
            bio,
            expertise: expertiseArray,
            affiliation,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Manage your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={user.role}
              disabled
              className="bg-muted capitalize"
            />
            <p className="text-xs text-muted-foreground">
              Contact an admin to change your role
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Areas of Expertise</Label>
            <Input
              id="expertise"
              placeholder="e.g., Systems thinking, Climate adaptation, Social innovation"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple areas with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliation">Affiliation</Label>
            <Input
              id="affiliation"
              placeholder="Your organization or institution"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              disabled={saving}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Profile updated successfully
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>
            Manage your privacy settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">GDPR Consent</h4>
            <p className="text-sm text-muted-foreground">
              You consented to data processing on {user.consent_given_at ? new Date(user.consent_given_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Data Export</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Request a copy of all your data
            </p>
            <Button variant="outline" size="sm">
              Request Data Export
            </Button>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Account Deletion</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Permanently delete your account and all associated data
            </p>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}