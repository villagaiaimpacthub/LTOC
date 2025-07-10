'use client'
import Image from 'next/image'
import { 
  UserPlus, Link, Linkedin, Twitter, Github, User, Edit3, 
  Briefcase, PlusCircle, Heart, BookOpen, ExternalLink,
  Home, FileText, Users, Brain, Eye, Search, Sparkles
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Recognition from '@/components/Recognition'
import { currentUser, profiles } from '@/lib/mockData'
import { useParams } from 'next/navigation'

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.id as string
  const profile = profiles[profileId] || profiles['sarah-anderson']
  const isOwner = currentUser.id === profileId

  return (
    <>
      <Navigation user={currentUser} />

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="profile-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 relative">
                <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" />
              </div>
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.display_name}</h1>
                    <p className="text-lg text-[var(--muted)]">{profile.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </button>
                    <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                      <Link className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  </div>
                </div>
                <p className="mb-6">{profile.bio}</p>
                <div className="flex gap-4 flex-wrap">
                  <a href={profile.linkedin_url} className="social-link flex items-center gap-2">
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                  <a href="#" className="social-link flex items-center gap-2">
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                  <a href={profile.github_url} className="social-link flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="profile-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              About
            </h2>
            <div className="space-y-4">
              <p>{profile.long_bio}</p>
              <div className="pt-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="profile-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience
            </h2>
            <div className="space-y-8">
              {profile.experiences.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
                    {exp.type === 'personal' ? (
                      <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                    ) : exp.logo ? (
                      <Image src={exp.logo} alt={exp.organization_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{exp.role}</h3>
                    <p className="text-[var(--primary)] font-medium">{exp.organization_name}</p>
                    <p className="text-sm text-[var(--muted)] mb-2">
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                    </p>
                    <p className="mb-4">{exp.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {exp.skills.map((skill, j) => (
                        <span key={j} className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Hub Section */}
          <div className="profile-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Knowledge Hub
            </h2>
            <div className="space-y-6">
              {/* Publications */}
              <div>
                <h3 className="font-semibold mb-3">Publications</h3>
                <div className="space-y-2">
                  {profile.knowledge_hub.publications.map((pub, i) => (
                    <a key={i} href={pub.link} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium">{pub.title}</p>
                        <p className="text-sm text-[var(--muted)]">{pub.type} • {pub.year}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Presentations */}
              <div>
                <h3 className="font-semibold mb-3">Presentations</h3>
                <div className="space-y-2">
                  {profile.knowledge_hub.presentations.map((pres, i) => (
                    <a key={i} href={pres.link} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium">{pres.title}</p>
                        <p className="text-sm text-[var(--muted)]">{pres.event}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-3">Resources</h3>
                <div className="space-y-2">
                  {profile.knowledge_hub.resources.map((resource, i) => (
                    <a key={i} href={resource.link} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-[var(--muted)]">{resource.description}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--accent)]" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recognition Section */}
          <Recognition 
            recognitions={profile.recognitions} 
            isOwner={isOwner}
            profileId={profileId}
          />
        </div>
      </div>
    </>
  )
}
