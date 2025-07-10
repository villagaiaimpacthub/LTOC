'use client'

import { useState } from 'react'
import { useNotifications } from '@/contexts/notifications-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@ltoc/ui'
import { 
  Bell, 
  Check, 
  CheckCheck,
  FileText,
  MessageSquare,
  Users,
  Trophy,
  AlertCircle,
  Settings,
  Trash2,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read_at) return false
    if (typeFilter && n.type !== typeFilter) return false
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'content_published':
      case 'content_reviewed':
        return <FileText className="h-5 w-5" />
      case 'review_assigned':
      case 'review_decision':
        return <Check className="h-5 w-5" />
      case 'mention':
      case 'comment':
        return <MessageSquare className="h-5 w-5" />
      case 'collaboration_invite':
        return <Users className="h-5 w-5" />
      case 'achievement':
        return <Trophy className="h-5 w-5" />
      case 'system_announcement':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationLink = (notification: any) => {
    if (notification.data?.content_id) {
      return `/content/${notification.data.content_id}`
    }
    if (notification.data?.review_id) {
      return `/reviews/${notification.data.review_id}`
    }
    return null
  }

  const notificationTypes = [
    { value: 'content_published', label: 'Published' },
    { value: 'content_reviewed', label: 'Reviews' },
    { value: 'review_assigned', label: 'Assignments' },
    { value: 'review_decision', label: 'Decisions' },
    { value: 'mention', label: 'Mentions' },
    { value: 'comment', label: 'Comments' },
    { value: 'collaboration_invite', label: 'Invites' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'system_announcement', label: 'Announcements' }
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>
            <p className="text-muted-foreground">
              Stay updated with your activities and mentions
            </p>
          </div>
          <Link href="/settings/notifications">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={typeFilter || ''}
            onChange={(e) => setTypeFilter(e.target.value || null)}
            className="text-sm border rounded-md px-3 py-1"
          >
            <option value="">All types</option>
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="ml-auto gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Loading notifications...
            </div>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const link = getNotificationLink(notification)
            const isUnread = !notification.read_at

            return (
              <Card 
                key={notification.id} 
                className={`transition-colors ${isUnread ? 'border-primary/20 bg-accent/5' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {link ? (
                            <Link 
                              href={link}
                              onClick={() => isUnread && markAsRead(notification.id)}
                              className="hover:underline"
                            >
                              <h3 className="font-medium">
                                {notification.title}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="font-medium">
                              {notification.title}
                            </h3>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}