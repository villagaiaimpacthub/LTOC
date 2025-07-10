import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'

export interface CollaborationUser {
  id: string
  display_name: string
}

export interface CollaborationOptions {
  roomId: string
  user: CollaborationUser
  signaling?: string[]
  password?: string
}

export class CollaborationManager {
  private doc: Y.Doc
  private provider: WebrtcProvider | null = null
  private persistence: IndexeddbPersistence | null = null
  private awareness: any

  constructor(private options: CollaborationOptions) {
    this.doc = new Y.Doc()
    
    // Set up local persistence
    this.persistence = new IndexeddbPersistence(options.roomId, this.doc)
    
    // Initialize WebRTC provider for real-time collaboration
    this.initializeProvider()
  }

  private initializeProvider() {
    const { roomId, user, signaling, password } = this.options
    
    this.provider = new WebrtcProvider(roomId, this.doc, {
      signaling: signaling || [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com'
      ],
      password: password || undefined
    })
    
    // Set user awareness after provider is created
    this.provider.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.display_name,
      color: this.generateUserColor(user.id),
      cursor: null
    })

    this.awareness = this.provider.awareness
    
    // Set initial awareness state
    this.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.display_name,
      color: this.generateUserColor(user.id)
    })
  }

  private generateUserColor(userId: string): string {
    // Generate a consistent color based on user ID
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#48DBFB', '#FF9FF3', '#54A0FF'
    ]
    
    const index = userId.split('').reduce((acc, char) => 
      acc + char.charCodeAt(0), 0
    ) % colors.length
    
    return colors[index]
  }

  getDoc(): Y.Doc {
    return this.doc
  }

  getAwareness() {
    return this.awareness
  }

  updateCursor(cursor: any) {
    if (this.awareness) {
      this.awareness.setLocalStateField('cursor', cursor)
    }
  }

  getConnectedUsers() {
    if (!this.awareness) return []
    
    const states = this.awareness.getStates()
    const users: any[] = []
    
    states.forEach((state: any, clientId: number) => {
      if (state.user && clientId !== this.awareness.clientID) {
        users.push({
          clientId,
          ...state.user,
          cursor: state.cursor
        })
      }
    })
    
    return users
  }

  destroy() {
    if (this.provider) {
      this.provider.destroy()
    }
    if (this.persistence) {
      this.persistence.destroy()
    }
    this.doc.destroy()
  }

  // Helper method to get text from Y.Text
  static getText(yText: Y.Text): string {
    return yText.toString()
  }

  // Helper method to set text in Y.Text
  static setText(yText: Y.Text, content: string) {
    yText.delete(0, yText.length)
    yText.insert(0, content)
  }

  // Helper method for transactional updates
  static transact(doc: Y.Doc, fn: () => void) {
    doc.transact(fn)
  }
}