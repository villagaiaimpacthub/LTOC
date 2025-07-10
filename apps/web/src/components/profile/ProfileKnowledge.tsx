import Link from 'next/link'
import { FileText, ExternalLink, BookOpen, Award } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description?: string
  date_achieved?: string
  category: 'certification' | 'award' | 'publication' | 'project' | 'other'
  url?: string
}

interface Theory {
  id: string
  title: string
  created_at: string
  views_count?: number
  status?: string
}

interface ProfileKnowledgeProps {
  achievements?: Achievement[]
  recentTheories?: Theory[]
  userId: string
}

export function ProfileKnowledge({ achievements, recentTheories, userId }: ProfileKnowledgeProps) {
  if ((!achievements || achievements.length === 0) && (!recentTheories || recentTheories.length === 0)) {
    return null
  }

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'publication':
        return <BookOpen className="w-4 h-4" />
      case 'award':
        return <Award className="w-4 h-4" />
      case 'certification':
        return <Award className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'publication':
        return 'text-blue-600 bg-blue-50'
      case 'award':
        return 'text-yellow-600 bg-yellow-50'
      case 'certification':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="profile-card">
      <div className="profile-section">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--profile-primary)]" />
          Knowledge Hub
        </h2>

        {/* Recent Theories */}
        {recentTheories && recentTheories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Theories</h3>
            <div className="grid gap-3">
              {recentTheories.map((theory) => (
                <Link 
                  key={theory.id}
                  href={`/content/${theory.id}`}
                  className="profile-knowledge-card group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-[var(--profile-primary)] transition-colors">
                        {theory.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(theory.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[var(--profile-primary)] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <Link 
              href={`/content?author=${userId}`}
              className="profile-knowledge-link text-sm mt-4 inline-block"
            >
              View all theories →
            </Link>
          </div>
        )}

        {/* Achievements & Publications */}
        {achievements && achievements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Achievements & Publications
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="profile-knowledge-card">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}>
                      {getCategoryIcon(achievement.category)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {achievement.title}
                      </h4>
                      {achievement.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {achievement.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {achievement.date_achieved && (
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.date_achieved).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                        {achievement.url && (
                          <a 
                            href={achievement.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="profile-knowledge-link text-xs flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}