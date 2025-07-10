'use client'
import { User, Edit3 } from 'lucide-react'

interface ProfileAboutProps {
  profile: any
  isOwner: boolean
}

export default function ProfileAbout({ profile, isOwner }: ProfileAboutProps) {
  return (
    <div className="profile-card p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" />
          About
        </h2>
        {isOwner && (
          <button className="text-muted-foreground hover:text-accent">
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        <p>{profile.bio}</p>
        {profile.long_bio && <p>{profile.long_bio}</p>}
        
        {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
          <div className="pt-4 space-y-4">
            {profile.skills?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.interests?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
