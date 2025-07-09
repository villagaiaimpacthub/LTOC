import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { Database } from '@ltoc/database'

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Get user's content
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('author_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get reviews if user is contributor/admin
  const canReview = profile?.role === 'contributor' || profile?.role === 'admin'
  const { data: reviews } = canReview
    ? await supabase
        .from('reviews')
        .select('*, content(*)')
        .eq('reviewer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.display_name}</h1>
        <p className="text-muted-foreground">
          Your role: <span className="capitalize">{profile?.role}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
            <CardDescription>Recent contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {content && content.length > 0 ? (
              <ul className="space-y-2">
                {content.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`/content/${item.id}`}
                      className="text-sm hover:underline"
                    >
                      {item.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {item.status} • {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No content yet</p>
            )}
          </CardContent>
        </Card>

        {canReview && (
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>Recent review activity</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? (
                <ul className="space-y-2">
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <p className="text-sm">
                        {review.content?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.decision || 'In progress'} • {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="/content"
                className="block rounded-md border p-2 text-sm hover:bg-accent"
              >
                Browse Content
              </a>
              {canReview && (
                <>
                  <a
                    href="/content/create"
                    className="block rounded-md border p-2 text-sm hover:bg-accent"
                  >
                    Create New Content
                  </a>
                  <a
                    href="/reviews"
                    className="block rounded-md border p-2 text-sm hover:bg-accent"
                  >
                    Review Queue
                  </a>
                </>
              )}
              <a
                href="/profile"
                className="block rounded-md border p-2 text-sm hover:bg-accent"
              >
                Edit Profile
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}