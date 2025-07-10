'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { Button } from '@ltoc/ui'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, CheckCircle, XCircle, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Review, Content, User } from '@ltoc/database'

interface ReviewManagementTableProps {
  reviews: (Review & { 
    content?: Pick<Content, 'title'> & {
      author?: Pick<User, 'display_name'> | null
    } | null
    reviewer?: Pick<User, 'display_name' | 'email'> | null
  })[]
}

export function ReviewManagementTable({ reviews: initialReviews }: ReviewManagementTableProps) {
  const { supabase } = useSupabase()
  const [reviews, setReviews] = useState(initialReviews)
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusChange = async (reviewId: string, newStatus: Review['status'], contentId?: string) => {
    setLoading(reviewId)
    
    try {
      const updates: Partial<Review> = { 
        status: newStatus,
        reviewed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)

      if (error) throw error

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, ...updates } 
          : review
      ))

      // If approved, check if content should be published
      if (newStatus === 'approved' && contentId) {
        // Check if we have enough approvals
        const { data: allReviews } = await supabase
          .from('reviews')
          .select('status')
          .eq('content_id', contentId)

        const approvedCount = allReviews?.filter(r => r.status === 'approved').length || 0
        
        if (approvedCount >= 2) {
          // Auto-publish content
          await supabase
            .from('content')
            .update({ 
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', contentId)
        }
      }

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'review_status_changed',
        p_metadata: { review_id: reviewId, new_status: newStatus }
      })

    } catch (err) {
      console.error('Error updating review:', err)
      alert('Failed to update review status')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    setLoading(reviewId)
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      // Update local state
      setReviews(prev => prev.filter(review => review.id !== reviewId))

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'review_deleted',
        p_metadata: { review_id: reviewId }
      })

    } catch (err) {
      console.error('Error deleting review:', err)
      alert('Failed to delete review')
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status: Review['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'changes_requested':
        return 'bg-yellow-100 text-yellow-700'
      case 'pending':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTimeSince = (date: string) => {
    const now = new Date().getTime()
    const then = new Date(date).getTime()
    const diff = now - then
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left text-sm font-medium">Content</th>
            <th className="p-2 text-left text-sm font-medium">Reviewer</th>
            <th className="p-2 text-left text-sm font-medium">Status</th>
            <th className="p-2 text-left text-sm font-medium">Comments</th>
            <th className="p-2 text-left text-sm font-medium">Time</th>
            <th className="p-2 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="border-b">
              <td className="p-2">
                <div>
                  <p className="font-medium line-clamp-1">
                    {review.content?.title || 'Unknown Content'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {review.content?.author?.display_name || 'Unknown'}
                  </p>
                </div>
              </td>
              <td className="p-2">
                <div>
                  <p className="text-sm">{review.reviewer?.display_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{review.reviewer?.email}</p>
                </div>
              </td>
              <td className="p-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(review.status)}`}>
                  {review.status.replace('_', ' ')}
                </span>
              </td>
              <td className="p-2">
                <p className="text-sm line-clamp-2">
                  {review.comments || <span className="text-muted-foreground">No comments</span>}
                </p>
              </td>
              <td className="p-2 text-sm text-muted-foreground">
                {review.status === 'pending' 
                  ? getTimeSince(review.created_at)
                  : getTimeSince(review.reviewed_at || review.created_at)
                }
              </td>
              <td className="p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={loading === review.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href={`/content/${review.content_id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Content
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href={`/reviews/${review.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Review
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {review.status === 'pending' && (
                      <>
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(review.id, 'approved', review.content_id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(review.id, 'changes_requested')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Request Changes
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem
                      onClick={() => handleDelete(review.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}