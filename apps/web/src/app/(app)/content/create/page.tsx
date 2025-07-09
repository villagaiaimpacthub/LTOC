'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { Editor } from '@/components/editor/editor'
import { Loader2 } from 'lucide-react'

export default function CreateContentPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useUser()
  
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user can create content
  if (user && user.role !== 'contributor' && user.role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  const handleSave = async (status: 'draft' | 'in_review') => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!content.trim() || content === '{}') {
      setError('Content is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Parse content to calculate word count
      const parsedContent = JSON.parse(content)
      const textContent = JSON.stringify(parsedContent).replace(/<[^>]*>/g, '')
      const wordCount = textContent.split(/\s+/).filter(Boolean).length
      const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const { data, error: saveError } = await supabase
        .from('content')
        .insert({
          title,
          slug,
          summary,
          body: parsedContent,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          status,
          author_id: user!.id,
          organization_id: user!.organization_id,
          word_count: wordCount,
          reading_time_minutes: readingTime,
        })
        .select()
        .single()

      if (saveError) throw saveError

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'content_created',
        p_metadata: { content_id: data.id, status }
      })

      router.push(`/content/${data.id}`)
    } catch (err: any) {
      console.error('Error saving content:', err)
      setError(err.message || 'Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Content</CardTitle>
          <CardDescription>
            Share your knowledge with the community. You can save as draft or submit for review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              e.g., systems thinking, climate change, organizational transformation
            </p>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Editor
              content={content}
              onChange={setContent}
              placeholder="Start writing your content..."
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