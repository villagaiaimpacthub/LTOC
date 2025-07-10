'use client'
import Image from 'next/image'
import { UserPlus, Link, Linkedin, Twitter, Github } from 'lucide-react'
import { useState } from 'react'

interface ProfileHeaderProps {
  profile: any
  currentUserId?: string
}

export default function ProfileHeader({ profile, currentUserId }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const isOwnProfile = currentUserId === profile.id

  return (
    <div className="profile-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 relative">
          <Image 
            src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'} 
            alt={profile.display_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.display_name}</h1>
              <p className="text-lg text-muted-foreground">{profile.title || 'LTOC Member'}</p>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 self-start mt-2 md:mt-0">
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                  <Link className="w-3.5 h-3.5" />
                  Connect
                </button>
              </div>
            )}
          </div>
          <p className="mb-6">{profile.bio}</p>
          <div className="flex gap-4 flex-wrap mb-4">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} className="social-link flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            )}
            {profile.twitter_handle && (
              <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} className="social-link flex items-center gap-2">
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} className="social-link flex items-center gap-2">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
