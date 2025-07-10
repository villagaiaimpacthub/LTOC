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
import { MoreHorizontal, Eye, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Content, User } from '@ltoc/database'

interface ContentManagementTableProps {
  contents: (Content & { 
    author?: Pick<User, 'display_name' | 'email'> | null
    reviews?: { count: number }[]
  })[]
}

export function ContentManagementTable({ contents: initialContents }: ContentManagementTableProps) {
  const { supabase } = useSupabase()
  const [contents, setContents] = useState(initialContents)
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatusChange = async (contentId: string, newStatus: Content['status']) => {
    setLoading(contentId)
    
    try {
      const updates: Partial<Content> = { status: newStatus }
      
      // If publishing, set published_at
      if (newStatus === 'published') {
        updates.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('content')
        .update(updates)
        .eq('id', contentId)

      if (error) throw error

      // Update local state
      setContents(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, ...updates } 
          : content
      ))

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'content_status_changed',
        p_metadata: { content_id: contentId, new_status: newStatus }
      })

    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update content status')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return
    
    setLoading(contentId)
    
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      // Update local state
      setContents(prev => prev.filter(content => content.id !== contentId))

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'content_deleted',
        p_metadata: { content_id: contentId }
      })

    } catch (err) {
      console.error('Error deleting content:', err)
      alert('Failed to delete content')
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status: Content['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700'
      case 'review':
        return 'bg-yellow-100 text-yellow-700'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left text-sm font-medium">Title</th>
            <th className="p-2 text-left text-sm font-medium">Author</th>
            <th className="p-2 text-left text-sm font-medium">Status</th>
            <th className="p-2 text-left text-sm font-medium">Type</th>
            <th className="p-2 text-left text-sm font-medium">Created</th>
            <th className="p-2 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contents.map((content) => (
            <tr key={content.id} className="border-b">
              <td className="p-2">
                <div>
                  <p className="font-medium line-clamp-1">{content.title}</p>
                  {content.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {content.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-1.5 py-0.5 text-xs bg-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-2">
                <div>
                  <p className="text-sm">{content.author?.display_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{content.author?.email}</p>
                </div>
              </td>
              <td className="p-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(content.status)}`}>
                  {content.status}
                </span>
              </td>
              <td className="p-2 text-sm">
                {content.content_type}
              </td>
              <td className="p-2 text-sm text-muted-foreground">
                {new Date(content.created_at).toLocaleDateString()}
              </td>
              <td className="p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={loading === content.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href={`/content/${content.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Content
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    
                    {content.status !== 'published' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(content.id, 'published')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    
                    {content.status !== 'review' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(content.id, 'review')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Send to Review
                      </DropdownMenuItem>
                    )}
                    
                    {content.status !== 'draft' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(content.id, 'draft')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Unpublish
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => handleDelete(content.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Content
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