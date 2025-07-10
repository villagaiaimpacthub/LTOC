interface ProfileAboutProps {
  bio?: string
  skills?: string[]
  interests?: string[]
}

export function ProfileAbout({ bio, skills, interests }: ProfileAboutProps) {
  if (!bio && (!skills || skills.length === 0) && (!interests || interests.length === 0)) {
    return null
  }

  return (
    <div className="profile-card">
      <div className="profile-section">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
        
        {bio && (
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{bio}</p>
          </div>
        )}

        {skills && skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span 
                  key={index}
                  className="profile-tag profile-skill-tag"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {interests && interests.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span 
                  key={index}
                  className="profile-tag profile-interest-tag"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}