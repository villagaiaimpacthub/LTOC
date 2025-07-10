import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { Calendar, Clock, Tag, User } from 'lucide-react'
import type { Content } from '@ltoc/database'

interface ContentCardProps {
  content: Partial<Content> & {
    id: string
    title: string
    summary?: string | null
    tags: string[]
    created_at: string
    reading_time_minutes?: number | null
    author?: { display_name: string } | null
  }
  showHighlight?: boolean
}

export function ContentCard({ content, showHighlight = false }: ContentCardProps) {
  const createMarkup = (html: string) => {
    return { __html: html }
  }

  return (
    <Link href={`/content/${content.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="line-clamp-2">
            {showHighlight && content.title.includes('<mark>') ? (
              <span dangerouslySetInnerHTML={createMarkup(content.title)} />
            ) : (
              content.title
            )}
          </CardTitle>
          {content.summary && (
            <CardDescription className="line-clamp-3">
              {showHighlight && content.summary.includes('<mark>') ? (
                <span dangerouslySetInnerHTML={createMarkup(content.summary)} />
              ) : (
                content.summary
              )}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {content.author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{content.author.display_name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(content.created_at).toLocaleDateString()}</span>
            </div>
            
            {content.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{content.reading_time_minutes} min read</span>
              </div>
            )}
          </div>
          
          {content.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {content.tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}