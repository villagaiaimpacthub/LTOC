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
      
      const rawHtml = generateHTML(jsonContent, [
        StarterKit.configure({
          heading: {
            levels: [2, 3]
          }
        })
      ])
      
      // Sanitize HTML to prevent XSS attacks
      // Use dynamic import for browser-only code
      if (typeof window !== 'undefined') {
        const DOMPurify = require('dompurify')
        return DOMPurify.sanitize(rawHtml, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
          ALLOW_DATA_ATTR: false
        })
      }
      return rawHtml
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