import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@ltoc/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { BarChart3, TrendingUp, Activity, Users, FileText, Brain } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get date ranges
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)

  // Get various analytics
  const [
    { data: dailyActivity },
    { data: contentByType },
    { data: usersByRole },
    { data: topContributors },
    { data: aiUsage }
  ] = await Promise.all([
    // Daily activity for the past week
    supabase
      .from('activity_logs')
      .select('created_at, activity_type')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: true }),
    
    // Content by type
    supabase
      .from('content')
      .select('content_type')
      .eq('status', 'published'),
    
    // Users by role
    supabase
      .from('users')
      .select('role'),
    
    // Top contributors
    supabase
      .from('content')
      .select('author_id, author:users!author_id(display_name)')
      .eq('status', 'published'),
    
    // AI usage
    supabase
      .from('ai_syntheses')
      .select('created_at, tokens_used, cost_cents')
      .gte('created_at', monthAgo.toISOString())
  ])

  // Process daily activity data
  const activityByDay = dailyActivity?.reduce((acc, log) => {
    const day = new Date(log.created_at).toLocaleDateString()
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Process content type data
  const contentTypeStats = contentByType?.reduce((acc, content) => {
    acc[content.content_type] = (acc[content.content_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Process user role data
  const roleStats = usersByRole?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Process top contributors
  const contributorStats = topContributors?.reduce((acc, content) => {
    const authorName = content.author?.display_name || 'Unknown'
    acc[authorName] = (acc[authorName] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  const topContributorsList = Object.entries(contributorStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Process AI usage
  const totalTokens = aiUsage?.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0) || 0
  const totalCost = aiUsage?.reduce((sum, usage) => sum + (usage.cost_cents || 0), 0) || 0

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Platform usage and performance metrics
        </p>
      </div>

      <div className="grid gap-6">
        {/* Activity Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(roleStats.admin || 0) + (roleStats.contributor || 0) + (roleStats.reader || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {roleStats.admin || 0} admins, {roleStats.contributor || 0} contributors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Published Content
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contentByType?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all content types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                AI Usage (30d)
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalTokens / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-muted-foreground">
                tokens • ${(totalCost / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weekly Activity
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dailyActivity?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total actions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>
                User actions over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(activityByDay).map(([day, count]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm">{day}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(activityByDay))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content by Type</CardTitle>
              <CardDescription>
                Distribution of published content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(contentTypeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(contentTypeStats))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>
                Most active content creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topContributorsList.map(([name, count], idx) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{idx + 1}</span>
                      <span className="text-sm">{name}</span>
                    </div>
                    <span className="text-sm font-medium">{count} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Synthesis Usage</CardTitle>
              <CardDescription>
                Last 30 days of AI generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total Syntheses</p>
                <p className="text-2xl font-bold">{aiUsage?.length || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Tokens Used</p>
                  <p className="text-lg font-bold">{(totalTokens / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Cost</p>
                  <p className="text-lg font-bold">${(totalCost / 100).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Average per Synthesis</p>
                <p className="text-sm text-muted-foreground">
                  {aiUsage?.length ? (totalTokens / aiUsage.length).toFixed(0) : 0} tokens • 
                  ${aiUsage?.length ? (totalCost / aiUsage.length / 100).toFixed(2) : '0.00'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}