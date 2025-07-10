import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@ltoc/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { ReviewManagementTable } from '@/components/admin/review-management-table'
import { FileCheck, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function AdminReviewsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get reviews with content and reviewer info
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      content:content_id(title, author:users!author_id(display_name)),
      reviewer:reviewer_id(display_name, email)
    `)
    .order('created_at', { ascending: false })

  // Get status distribution
  const statusStats = reviews?.reduce((acc, review) => {
    acc[review.status] = (acc[review.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Calculate average review time
  const completedReviews = reviews?.filter(r => r.status !== 'pending') || []
  const avgReviewTime = completedReviews.length > 0
    ? completedReviews.reduce((sum, review) => {
        const created = new Date(review.created_at).getTime()
        const reviewed = review.reviewed_at ? new Date(review.reviewed_at).getTime() : created
        return sum + (reviewed - created)
      }, 0) / completedReviews.length / (1000 * 60 * 60) // Convert to hours
    : 0

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Review Management</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor and manage content review processes
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.approved || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Changes Requested
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.changes_requested || 0}</div>
            <p className="text-xs text-muted-foreground">
              Needs revision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Review Time
            </CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgReviewTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Time to decision
            </p>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-2">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-muted-foreground">Failed to load reviews</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>
              View and manage review processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewManagementTable reviews={reviews || []} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}