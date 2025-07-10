'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useData } from '@/lib/data-context'
import { useAuth } from '@/lib/auth'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NewTheoryPage() {
  const router = useRouter()
  const { addTheory } = useData()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(`# Theory Title

## Problem Statement

Describe the problem you're addressing...

## Theory of Change

If we... then...

## Implementation Strategy

1. Step 1
2. Step 2
3. Step 3

## Expected Outcomes

- Outcome 1
- Outcome 2
- Outcome 3`)
  const [status, setStatus] = useState<'draft' | 'in-review' | 'published'>('draft')

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    addTheory({
      title,
      content,
      status,
      author: user?.display_name || 'Anonymous',
      collaborators: 1,
      impact: 0
    })

    router.push('/theories')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/theories" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Theories
          </Link>
          <div className="flex gap-3">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="in-review">In Review</option>
              <option value="published">Published</option>
            </select>
            <button 
              onClick={handleSave}
              className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Theory
            </button>
          </div>
        </div>

        <div className="profile-card p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter theory title..."
            className="w-full text-2xl font-bold mb-6 p-2 border-b focus:outline-none focus:border-accent"
          />

          <div className="min-h-[500px]">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview="edit"
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
