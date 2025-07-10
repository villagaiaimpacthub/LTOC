'use client'

import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { CollaborationManager } from '@ltoc/utils/collaboration'
import { useUser } from '@/hooks/use-user'
import { Card } from '@ltoc/ui'
import { Users, Circle } from 'lucide-react'

interface CollaborativeEditorProps {
  roomId: string
  initialContent?: string
  onContentChange?: (content: string) => void
  placeholder?: string
}

export function CollaborativeEditor({ 
  roomId, 
  initialContent = '', 
  onContentChange,
  placeholder = 'Start typing...'
}: CollaborativeEditorProps) {
  const { user } = useUser()
  const [connectedUsers, setConnectedUsers] = useState<any[]>([])
  const collaborationRef = useRef<CollaborationManager | null>(null)
  const ydocRef = useRef<Y.Doc | null>(null)

  // Initialize collaboration
  useEffect(() => {
    if (!user) return

    const collaboration = new CollaborationManager({
      roomId,
      user: {
        id: user.id,
        display_name: user.display_name || 'Anonymous'
      }
    })

    collaborationRef.current = collaboration
    ydocRef.current = collaboration.getDoc()

    // Set initial content if provided
    const yText = ydocRef.current.getText('content')
    if (initialContent && yText.length === 0) {
      CollaborationManager.setText(yText, initialContent)
    }

    // Listen for awareness updates
    const awareness = collaboration.getAwareness()
    
    const updateUsers = () => {
      setConnectedUsers(collaboration.getConnectedUsers())
    }

    awareness.on('change', updateUsers)
    updateUsers()

    return () => {
      awareness.off('change', updateUsers)
      collaboration.destroy()
    }
  }, [roomId, user, initialContent])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydocRef.current,
        field: 'content',
      }),
      CollaborationCursor.configure({
        provider: collaborationRef.current?.getAwareness(),
        user: {
          name: user?.display_name || 'Anonymous',
          color: user ? generateUserColor(user.id) : '#000000',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      onContentChange?.(content)
    },
  }, [ydocRef.current])

  // Update cursor position
  useEffect(() => {
    if (!editor || !collaborationRef.current) return

    const updateCursorPosition = () => {
      const { from, to } = editor.state.selection
      collaborationRef.current?.updateCursor({ from, to })
    }

    editor.on('selectionUpdate', updateCursorPosition)
    return () => {
      editor.off('selectionUpdate', updateCursorPosition)
    }
  }, [editor])

  return (
    <div className="space-y-4">
      {/* Connected Users */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {connectedUsers.length + 1} {connectedUsers.length === 0 ? 'user' : 'users'} editing
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Current user */}
            <div className="flex items-center gap-1.5">
              <Circle 
                className="h-3 w-3 fill-current" 
                style={{ color: user ? generateUserColor(user.id) : '#000' }}
              />
              <span className="text-xs text-muted-foreground">
                You
              </span>
            </div>
            
            {/* Other users */}
            {connectedUsers.map((connectedUser) => (
              <div key={connectedUser.clientId} className="flex items-center gap-1.5">
                <Circle 
                  className="h-3 w-3 fill-current" 
                  style={{ color: connectedUser.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {connectedUser.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Editor */}
      <Card>
        <EditorContent 
          editor={editor} 
          className="min-h-[400px]"
        />
      </Card>
    </div>
  )
}

function generateUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#48DBFB', '#FF9FF3', '#54A0FF'
  ]
  
  const index = userId.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  ) % colors.length
  
  return colors[index]
}