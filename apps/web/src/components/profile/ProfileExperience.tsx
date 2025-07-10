import Image from 'next/image'
import { Briefcase, Calendar } from 'lucide-react'

interface Experience {
  id: string
  organization_name: string
  role: string
  description?: string
  start_date: string
  end_date?: string
  is_current: boolean
  logo_url?: string
}

interface ProfileExperienceProps {
  experiences: Experience[]
}

export function ProfileExperience({ experiences }: ProfileExperienceProps) {
  if (!experiences || experiences.length === 0) {
    return null
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const calculateDuration = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth())
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    } else if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`
    } else {
      return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    }
  }

  return (
    <div className="profile-card">
      <div className="profile-section">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[var(--profile-primary)]" />
          Experience
        </h2>
        
        <div className="profile-timeline">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="profile-timeline-item">
              <div className="profile-timeline-dot" />
              
              <div className="flex gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  {exp.logo_url ? (
                    <Image
                      src={exp.logo_url}
                      alt={exp.organization_name}
                      width={48}
                      height={48}
                      className="rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Experience Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{exp.role}</h3>
                  <p className="text-[var(--profile-primary)] font-medium">
                    {exp.organization_name}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDate(exp.start_date)} - {
                        exp.is_current 
                          ? 'Present' 
                          : exp.end_date 
                            ? formatDate(exp.end_date)
                            : 'Present'
                      }
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{calculateDuration(exp.start_date, exp.end_date, exp.is_current)}</span>
                  </div>

                  {exp.description && (
                    <p className="text-gray-600 mt-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}