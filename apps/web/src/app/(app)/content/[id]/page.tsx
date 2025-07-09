import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Database } from '@ltoc/database'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { ContentView } from '@/components/content-view'
import { Clock, User, Tag, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get content with author and review information
  const { data: content } = await supabase
    .from('content')
    .select(`
      *,
      author:users!author_id(
        id,
        display_name,
        email,
        profile
      ),
      reviews(
        id,
        decision,
        created_at,
        reviewer:users!reviewer_id(
          display_name
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!content) {
    notFound()
  }

  // Get current user to check if they can edit
  const { data: { user } } = await supabase.auth.getUser()
  const canEdit = user?.id === content.author_id

  const publishedDate = content.published_at 
    ? new Date(content.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{content.title}</h1>
            {content.summary && (
              <p className="text-lg text-muted-foreground">{content.summary}</p>
            )}
          </div>
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/content/${content.id}/edit`}>Edit</Link>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{content.author?.display_name || 'Anonymous'}</span>
          </div>
          {publishedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{publishedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{content.reading_time_minutes || 5} min read</span>
          </div>
        </div>

        {content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <ContentView content={content.body} />
        </CardContent>
      </Card>

      {content.status === 'in_review' && content.reviews && content.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Status</CardTitle>
            <CardDescription>
              This content is currently under review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {content.reviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between">
                  <span className="text-sm">
                    {review.reviewer?.display_name || 'Reviewer'}
                  </span>
                  <span className={`text-sm font-medium ${
                    review.decision === 'approve' ? 'text-green-600' :
                    review.decision === 'reject' ? 'text-red-600' :
                    review.decision === 'request_changes' ? 'text-yellow-600' :
                    'text-muted-foreground'
                  }`}>
                    {review.decision ? review.decision.replace('_', ' ') : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}