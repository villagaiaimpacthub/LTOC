'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, MapPin, Globe, Linkedin, Twitter, 
  Camera, Save, Plus, X, Briefcase, Award 
} from 'lucide-react'
import { Button } from '@ltoc/ui'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-client'

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter_handle: z.string().regex(/^@?[\w]{1,15}$/, 'Invalid Twitter handle').optional().or(z.literal('')),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills'),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests'),
  is_public: z.boolean(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: any
  onUpdate?: () => void
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [skills, setSkills] = useState<string[]>(user?.skills || [])
  const [interests, setInterests] = useState<string[]>(user?.interests || [])
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      linkedin_url: user?.linkedin_url || '',
      twitter_handle: user?.twitter_handle || '',
      skills: user?.skills || [],
      interests: user?.interests || [],
      is_public: user?.is_public ?? true,
    },
  })

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          skills,
          interests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const addSkill = () => {
    if (newSkill && skills.length < 10) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const addInterest = () => {
    if (newInterest && interests.length < 10) {
      setInterests([...interests, newInterest])
      setNewInterest('')
    }
  }

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <p className="text-sm text-gray-500">Upload a photo to personalize your profile</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            {...register('display_name')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.display_name && (
            <p className="text-red-500 text-sm mt-1">{errors.display_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...register('location')}
              placeholder="City, Country"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          placeholder="Tell us about yourself..."
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Social Links</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...register('website')}
              type="url"
              placeholder="https://yourwebsite.com"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.website && (
            <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                {...register('linkedin_url')}
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Twitter</label>
            <div className="relative">
              <Twitter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                {...register('twitter_handle')}
                placeholder="@username"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium mb-2">Skills</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill"
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Button type="button" onClick={addSkill} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium mb-2">Interests</label>
        <div className="flex gap-2 mb-2">
          <input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            placeholder="Add an interest"
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Button type="button" onClick={addInterest} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(index)}
                className="hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="border-t pt-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('is_public')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm">
            Make my profile public (visible to non-registered users)
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}