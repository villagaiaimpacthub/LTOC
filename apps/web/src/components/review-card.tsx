'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from '@ltoc/ui'
import { Clock, User, FileText } from 'lucide-react'

interface ReviewCardProps {
  content: {
    id: string
    title: string
    summary: string | null
    created_at: string
    word_count: number | null
    author?: {
      display_name: string | null
    }
    reviews?: Array<{
      id: string
      reviewer_id: string
    }>
  }
}

export function ReviewCard({ content }: ReviewCardProps) {
  const [loading, setLoading] = useState(false)

  const timeAgo = (date: string) => {
    const now = new Date()
    const created = new Date(date)
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{content.title}</CardTitle>
            <CardDescription>
              {content.summary || 'No summary provided'}
            </CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">
            {content.reviews?.length || 0} reviews
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{content.author?.display_name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Submitted {timeAgo(content.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{content.word_count || 0} words</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={loading}>
          <Link href={`/reviews/${content.id}`}>
            Review this content
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}