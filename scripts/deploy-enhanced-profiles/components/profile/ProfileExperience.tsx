'use client'
import { Briefcase, PlusCircle, Heart } from 'lucide-react'
import Image from 'next/image'

interface ProfileExperienceProps {
  experiences: any[]
}

export default function ProfileExperience({ experiences }: ProfileExperienceProps) {
  return (
    <div className="profile-card p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Experience
        </h2>
        <button className="text-muted-foreground hover:text-accent">
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        {experiences.map((exp, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
              {exp.logo ? (
                <Image 
                  src={exp.logo} 
                  alt={exp.organization_name}
                  fill
                  className="object-cover"
                />
              ) : exp.type === 'personal' ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {exp.organization_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">{exp.role}</h3>
              <p className="text-primary font-medium">{exp.organization_name}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
              </p>
              {exp.description && <p className="mb-4">{exp.description}</p>}
              {exp.skills && (
                <div className="flex gap-2 flex-wrap">
                  {exp.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
