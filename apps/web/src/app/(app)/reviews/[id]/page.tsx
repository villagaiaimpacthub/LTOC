'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label } from '@ltoc/ui'
import { ContentView } from '@/components/content-view'
import { Loader2, Check, X, AlertCircle } from 'lucide-react'
import type { Content, ReviewDecision } from '@ltoc/database'

export default function ReviewContentPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useUser()
  
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [decision, setDecision] = useState<ReviewDecision | null>(null)
  const [comments, setComments] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('content')
          .select(`
            *,
            author:users!author_id(
              display_name,
              email
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        
        // Check if user already reviewed this
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('*')
          .eq('content_id', params.id)
          .eq('reviewer_id', user.id)
          .single()

        if (existingReview) {
          router.push('/reviews')
          return
        }

        setContent(data)
      } catch (err: any) {
        console.error('Error fetching content:', err)
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [params.id, user, supabase, router])

  const handleSubmitReview = async () => {
    if (!user || !content || !decision) return

    setSubmitting(true)
    setError(null)

    try {
      // Create review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          content_id: content.id,
          reviewer_id: user.id,
          decision,
          comments: comments.trim() || null,
          completed_at: new Date().toISOString(),
        })

      if (reviewError) throw reviewError

      // Check if content should be published (2+ approvals)
      if (decision === 'approve') {
        const { data: approvals } = await supabase
          .from('reviews')
          .select('id')
          .eq('content_id', content.id)
          .eq('decision', 'approve')

        if (approvals && approvals.length >= 2) {
          // Update content status to published
          await supabase
            .from('content')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
            })
            .eq('id', content.id)
        }
      }

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'review_submitted',
        p_metadata: { 
          content_id: content.id, 
          decision,
          review_type: 'peer_review'
        }
      })

      router.push('/reviews')
    } catch (err: any) {
      console.error('Error submitting review:', err)
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Content not found or already reviewed</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Review Content</h1>
        <p className="text-muted-foreground">
          Please review this content carefully and provide your feedback
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>
            By {content.author?.display_name} • {content.word_count || 0} words
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentView content={content.body} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
          <CardDescription>
            Provide your decision and any feedback for the author
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Decision</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={decision === 'approve' ? 'default' : 'outline'}
                onClick={() => setDecision('approve')}
                disabled={submitting}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant={decision === 'request_changes' ? 'default' : 'outline'}
                onClick={() => setDecision('request_changes')}
                disabled={submitting}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Request Changes
              </Button>
              <Button
                type="button"
                variant={decision === 'reject' ? 'destructive' : 'outline'}
                onClick={() => setDecision('reject')}
                disabled={submitting}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments (optional)</Label>
            <textarea
              id="comments"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide constructive feedback for the author..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitReview}
              disabled={!decision || submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/reviews')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}