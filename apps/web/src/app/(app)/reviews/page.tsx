import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@ltoc/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { ReviewCard } from '@/components/review-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function ReviewsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  // Redirect if user can't review
  if (!profile || (profile.role !== 'contributor' && profile.role !== 'admin')) {
    redirect('/dashboard')
  }

  // Get content pending review
  const { data: pendingReviews } = await supabase
    .from('content')
    .select(`
      *,
      author:users!author_id(
        id,
        display_name,
        email
      ),
      reviews!left(
        id,
        reviewer_id,
        decision,
        created_at
      )
    `)
    .eq('status', 'in_review')
    .order('created_at', { ascending: true })

  // Get user's completed reviews
  const { data: myReviews } = await supabase
    .from('reviews')
    .select(`
      *,
      content(
        id,
        title,
        author:users!author_id(
          display_name
        )
      )
    `)
    .eq('reviewer_id', user?.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  // Filter out content already reviewed by this user
  const availableForReview = pendingReviews?.filter(content => 
    !content.reviews?.some(review => review.reviewer_id === user?.id)
  ) || []

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <p className="text-muted-foreground">
          Help maintain quality by reviewing community contributions
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Reviews ({availableForReview.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            My Reviews ({myReviews?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {availableForReview.length > 0 ? (
            <div className="grid gap-4">
              {availableForReview.map((content) => (
                <ReviewCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-2">No content pending review</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for new submissions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {myReviews && myReviews.length > 0 ? (
            <div className="grid gap-4">
              {myReviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {review.content?.title}
                    </CardTitle>
                    <CardDescription>
                      By {review.content?.author?.display_name} • Reviewed {new Date(review.completed_at!).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your decision:</span>
                      <span className={`text-sm font-medium ${
                        review.decision === 'approve' ? 'text-green-600' :
                        review.decision === 'reject' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {review.decision?.replace('_', ' ') || 'No decision'}
                      </span>
                    </div>
                    {review.comments && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.comments}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">You haven't reviewed any content yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}