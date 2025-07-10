'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { Input } from '@ltoc/ui'
import { Check, Search } from 'lucide-react'
import type { Content } from '@ltoc/database'

interface ContentSelectorProps {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function ContentSelector({ selectedIds, onSelectionChange }: ContentSelectorProps) {
  const { supabase } = useSupabase()
  const [contents, setContents] = useState<Content[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('content')
          .select(`
            id,
            title,
            tags,
            author:users!author_id(display_name)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        if (error) throw error
        setContents(data || [])
      } catch (err) {
        console.error('Error fetching content:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [supabase])

  const filteredContents = contents.filter(content =>
    content.title.toLowerCase().includes(search.toLowerCase()) ||
    content.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search content by title or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="border rounded-lg max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading content...
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No content found
          </div>
        ) : (
          <div className="divide-y">
            {filteredContents.map((content) => (
              <label
                key={content.id}
                className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex items-center justify-center w-5 h-5 mt-0.5 border rounded">
                  {selectedIds.includes(content.id) && (
                    <Check className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {content.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {content.author?.display_name}
                  </p>
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
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
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedIds.includes(content.id)}
                  onChange={() => toggleSelection(content.id)}
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}