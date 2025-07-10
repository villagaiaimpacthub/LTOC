import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@ltoc/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { ContentManagementTable } from '@/components/admin/content-management-table'
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react'

export default async function AdminContentPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get content with authors
  const { data: contents, error } = await supabase
    .from('content')
    .select(`
      *,
      author:users!author_id(display_name, email),
      reviews:reviews(count)
    `)
    .order('created_at', { ascending: false })

  // Get status distribution
  const statusStats = contents?.reduce((acc, content) => {
    acc[content.status] = (acc[content.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Content Management</h1>
        </div>
        <p className="text-muted-foreground">
          Review and moderate all platform content
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Content
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All content pieces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.published || 0}</div>
            <p className="text-xs text-muted-foreground">
              Live content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.review || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Drafts
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.draft || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unpublished
            </p>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-2">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-muted-foreground">Failed to load content</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Content</CardTitle>
            <CardDescription>
              View and manage all content pieces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentManagementTable contents={contents || []} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}