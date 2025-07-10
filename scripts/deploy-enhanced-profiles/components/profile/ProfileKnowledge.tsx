'use client'
import { BookOpen, ExternalLink, Link } from 'lucide-react'

interface ProfileKnowledgeProps {
  theories: any[]
  achievements: any[]
}

export default function ProfileKnowledge({ theories, achievements }: ProfileKnowledgeProps) {
  return (
    <div className="profile-card p-6 md:p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Knowledge Hub
      </h2>
      
      {/* Theories */}
      {theories?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Theories</h3>
          <div className="space-y-4">
            {theories.map((theory, index) => (
              <div key={index} className="knowledge-item p-4 rounded-lg">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{theory.title}</h4>
                    <p className="text-sm text-muted-foreground">{theory.description}</p>
                  </div>
                  <a href={`/theories/${theory.id}`} className="flex-shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Achievements & Publications</h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="knowledge-item p-4 rounded-lg">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.link && (
                    <a href={achievement.link} className="flex-shrink-0">
                      <Link className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
