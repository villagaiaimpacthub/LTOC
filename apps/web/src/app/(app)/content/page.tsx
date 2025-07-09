import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ltoc/ui'
import { Database } from '@ltoc/database'
import { Clock, User, Tag } from 'lucide-react'

export default async function ContentPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get published content with author information
  const { data: contents } = await supabase
    .from('content')
    .select(`
      *,
      author:users!author_id(
        id,
        display_name,
        email
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Content</h1>
        <p className="text-muted-foreground">
          Explore knowledge shared by our community
        </p>
      </div>

      {contents && contents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => (
            <Link key={content.id} href={`/content/${content.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{content.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {content.summary || 'No summary available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    {content.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{content.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{content.author?.display_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{content.reading_time_minutes || 5} min read</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No published content yet</p>
            <p className="text-sm text-muted-foreground">
              Check back soon or contribute your own knowledge!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}