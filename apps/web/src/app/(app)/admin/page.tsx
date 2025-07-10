import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@ltoc/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { Users, FileText, Activity, TrendingUp, Shield, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get stats
  const [
    { count: userCount },
    { count: contentCount },
    { count: publishedCount },
    { count: reviewCount },
    { data: recentActivity }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('activity_logs')
      .select('*, user:users(display_name)')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  // Get user growth (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data: userGrowth } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const stats = [
    {
      title: 'Total Users',
      value: userCount || 0,
      icon: Users,
      change: `+${userGrowth?.length || 0} this week`,
      href: '/admin/users'
    },
    {
      title: 'Total Content',
      value: contentCount || 0,
      icon: FileText,
      change: `${publishedCount || 0} published`,
      href: '/admin/content'
    },
    {
      title: 'Pending Reviews',
      value: reviewCount || 0,
      icon: Activity,
      change: 'Awaiting approval',
      href: '/admin/reviews'
    },
    {
      title: 'Active Sessions',
      value: '23',
      icon: TrendingUp,
      change: 'Live users',
      href: '/admin/analytics'
    }
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage users, content, and monitor platform activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest user actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.user?.display_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.activity_type.replace(/_/g, ' ')}
                        {activity.metadata && ' • ' + JSON.stringify(activity.metadata).slice(0, 50) + '...'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link href="/admin/users">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Manage Users</p>
                      <p className="text-xs text-muted-foreground">
                        View and edit user accounts and permissions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/admin/content">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 p-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Content Moderation</p>
                      <p className="text-xs text-muted-foreground">
                        Review and manage all platform content
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/admin/analytics">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 p-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        View detailed platform usage and performance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}