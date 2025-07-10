'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { CollaborativeEditor } from '@/components/editor/collaborative-editor'
import { Loader2, Users, Share2, Copy, Check } from 'lucide-react'

export default function CollaborateContentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { user } = useUser()
  
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  // Get or generate room ID
  const roomId = searchParams.get('room') || generateRoomId()
  const shareUrl = `${window.location.origin}/content/collaborate?room=${roomId}`

  // Check if user can create content
  if (user && user.role !== 'contributor' && user.role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  // Load existing content if room ID matches a draft
  useEffect(() => {
    async function loadDraft() {
      if (!roomId || !user) return

      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('collaboration_room_id', roomId)
        .eq('status', 'draft')
        .single()

      if (data && !error) {
        setTitle(data.title)
        setSummary(data.summary || '')
        setContent(JSON.stringify(data.body))
        setTags(data.tags.join(', '))
      }
    }

    loadDraft()
  }, [roomId, user, supabase])

  const handleSave = async (status: 'draft' | 'in_review') => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Parse HTML content to calculate word count
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      const wordCount = textContent.split(/\s+/).filter(Boolean).length
      const readingTime = Math.ceil(wordCount / 200)

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // Check if content with this room ID already exists
      const { data: existing } = await supabase
        .from('content')
        .select('id')
        .eq('collaboration_room_id', roomId)
        .single()

      let contentId: string

      if (existing) {
        // Update existing content
        const { data, error: updateError } = await supabase
          .from('content')
          .update({
            title,
            slug,
            summary,
            body: { html: content },
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            status,
            word_count: wordCount,
            reading_time_minutes: readingTime,
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw updateError
        contentId = data.id
      } else {
        // Create new content
        const { data, error: insertError } = await supabase
          .from('content')
          .insert({
            title,
            slug,
            summary,
            body: { html: content },
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            status,
            author_id: user!.id,
            organization_id: user!.organization_id,
            collaboration_room_id: roomId,
            word_count: wordCount,
            reading_time_minutes: readingTime,
          })
          .select()
          .single()

        if (insertError) throw insertError
        contentId = data.id
      }

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: existing ? 'content_updated' : 'content_created',
        p_metadata: { content_id: contentId, status, collaborative: true }
      })

      router.push(`/content/${contentId}`)
    } catch (err: any) {
      console.error('Error saving content:', err)
      setError(err.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborative Content Creation
              </CardTitle>
              <CardDescription>
                Work together in real-time. Share the link below to invite collaborators.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="w-96"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <textarea
              id="summary"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief summary of your content (optional)"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <CollaborativeEditor
              roomId={roomId}
              initialContent={content}
              onContentChange={setContent}
              placeholder="Start writing your content collaboratively..."
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave('in_review')}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateRoomId(): string {
  return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}