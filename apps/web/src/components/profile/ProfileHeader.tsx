'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  MapPin, Globe, Linkedin, Twitter, Github,
  Mail, UserPlus, UserMinus, Edit, MessageSquare
} from 'lucide-react'
import { Button } from '@ltoc/ui'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-client'

interface ProfileHeaderProps {
  profile: {
    id: string
    display_name: string
    email: string
    avatar_url?: string
    bio?: string
    location?: string
    website?: string
    linkedin_url?: string
    twitter_handle?: string
    github_url?: string
    role: string
    is_public?: boolean
  }
  stats: {
    theories_count: number
    collaborations_count: number
    contributions_count: number
    followers_count: number
    following_count: number
  }
  isOwnProfile: boolean
  isFollowing: boolean
  currentUserId?: string
}

export function ProfileHeader({ 
  profile, 
  stats, 
  isOwnProfile, 
  isFollowing: initialIsFollowing,
  currentUserId 
}: ProfileHeaderProps) {
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(stats.followers_count)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleFollow = async () => {
    if (!currentUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to follow users',
        variant: 'destructive'
      })
      return
    }

    setIsUpdating(true)
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .match({ follower_id: currentUserId, following_id: profile.id })

        if (error) throw error
        
        setIsFollowing(false)
        setFollowersCount(prev => Math.max(0, prev - 1))
        toast({
          title: 'Unfollowed',
          description: `You've unfollowed ${profile.display_name}`
        })
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({ follower_id: currentUserId, following_id: profile.id })

        if (error) throw error
        
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
        toast({
          title: 'Followed',
          description: `You're now following ${profile.display_name}`
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="profile-card">
      <div className="profile-header profile-section pb-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 pb-6">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={128}
                height={128}
                className="profile-avatar object-cover"
              />
            ) : (
              <div className="profile-avatar bg-gradient-to-br from-[var(--profile-primary)] to-[var(--profile-secondary)] flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {profile.display_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="profile-name">{profile.display_name}</h1>
            <p className="profile-title">{profile.role}</p>
            {profile.location && (
              <div className="flex items-center gap-1 text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {isOwnProfile ? (
              <Link href="/settings/profile">
                <Button className="profile-button profile-button-primary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            ) : currentUserId && (
              <>
                <Button 
                  onClick={handleFollow}
                  disabled={isUpdating}
                  className={`profile-button ${
                    isFollowing 
                      ? 'profile-button-outline' 
                      : 'profile-button-primary'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button className="profile-button profile-button-secondary">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 lg:px-8">
        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-number">{stats.theories_count}</div>
            <div className="profile-stat-label">Theories</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-number">{stats.collaborations_count}</div>
            <div className="profile-stat-label">Collaborations</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-number">{stats.contributions_count}</div>
            <div className="profile-stat-label">Contributions</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-number">{followersCount}</div>
            <div className="profile-stat-label">Followers</div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="profile-section pt-4">
        <div className="flex flex-wrap gap-4">
          {profile.website && (
            <a 
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-social-link"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">Website</span>
            </a>
          )}
          {profile.linkedin_url && (
            <a 
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-social-link"
            >
              <Linkedin className="w-4 h-4" />
              <span className="text-sm">LinkedIn</span>
            </a>
          )}
          {profile.twitter_handle && (
            <a 
              href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-social-link"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm">{profile.twitter_handle}</span>
            </a>
          )}
          {profile.github_url && (
            <a 
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-social-link"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">GitHub</span>
            </a>
          )}
          {profile.is_public && profile.email && (
            <a 
              href={`mailto:${profile.email}`}
              className="profile-social-link"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">Email</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}