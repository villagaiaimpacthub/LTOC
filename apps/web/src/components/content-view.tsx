'use client'

import { useMemo } from 'react'
import { generateHTML } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface ContentViewProps {
  content: any // JSON content from Tiptap
}

export function ContentView({ content }: ContentViewProps) {
  const htmlContent = useMemo(() => {
    if (!content) return ''
    
    try {
      // If content is a string, parse it
      const jsonContent = typeof content === 'string' ? JSON.parse(content) : content
      
      return generateHTML(jsonContent, [
        StarterKit.configure({
          heading: {
            levels: [2, 3]
          }
        })
      ])
    } catch (error) {
      console.error('Error parsing content:', error)
      return '<p>Error displaying content</p>'
    }
  }, [content])

  return (
    <div 
      className="prose prose-sm sm:prose lg:prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}