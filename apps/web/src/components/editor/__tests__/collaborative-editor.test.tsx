import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CollaborativeEditor } from '../collaborative-editor'

// Mock the collaboration manager
vi.mock('@ltoc/utils/collaboration', () => ({
  CollaborationManager: vi.fn().mockImplementation(() => ({
    getDoc: vi.fn().mockReturnValue({
      getText: vi.fn().mockReturnValue({
        toString: vi.fn().mockReturnValue(''),
        length: 0
      })
    }),
    getAwareness: vi.fn().mockReturnValue({
      on: vi.fn(),
      off: vi.fn(),
      setLocalStateField: vi.fn()
    }),
    getConnectedUsers: vi.fn().mockReturnValue([]),
    updateCursor: vi.fn(),
    destroy: vi.fn()
  }))
}))

// Mock hooks
vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn().mockReturnValue({
    user: {
      id: 'test-user-id',
      display_name: 'Test User'
    }
  })
}))

// Mock Tiptap
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn().mockReturnValue({
    on: vi.fn(),
    off: vi.fn(),
    state: { selection: { from: 0, to: 0 } },
    getHTML: vi.fn().mockReturnValue('<p>Test content</p>')
  }),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">Editor Content</div>
  )
}))

describe('CollaborativeEditor', () => {
  const defaultProps = {
    roomId: 'test-room',
    initialContent: '<p>Initial content</p>',
    onContentChange: vi.fn(),
    placeholder: 'Start typing...'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the collaborative editor', () => {
    render(<CollaborativeEditor {...defaultProps} />)
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByText(/1 user editing/)).toBeInTheDocument()
  })

  it('displays connected users count', async () => {
    const { CollaborationManager } = await import('@ltoc/utils/collaboration')
    const mockManager = CollaborationManager as any
    
    mockManager.mockImplementation(() => ({
      getDoc: vi.fn().mockReturnValue({
        getText: vi.fn().mockReturnValue({
          toString: vi.fn().mockReturnValue(''),
          length: 0
        })
      }),
      getAwareness: vi.fn().mockReturnValue({
        on: vi.fn(),
        off: vi.fn(),
        setLocalStateField: vi.fn()
      }),
      getConnectedUsers: vi.fn().mockReturnValue([
        { clientId: 1, name: 'User 1', color: '#FF6B6B' },
        { clientId: 2, name: 'User 2', color: '#4ECDC4' }
      ]),
      updateCursor: vi.fn(),
      destroy: vi.fn()
    }))

    render(<CollaborativeEditor {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText(/3 users editing/)).toBeInTheDocument()
    })
  })

  it('calls onContentChange when content is updated', async () => {
    const onContentChange = vi.fn()
    const { useEditor } = await import('@tiptap/react')
    const mockUseEditor = useEditor as any
    
    mockUseEditor.mockImplementation((config: any) => {
      // Simulate content update
      setTimeout(() => {
        config.onUpdate({ editor: { getHTML: () => '<p>Updated content</p>' } })
      }, 100)
      
      return {
        on: vi.fn(),
        off: vi.fn(),
        state: { selection: { from: 0, to: 0 } },
        getHTML: vi.fn().mockReturnValue('<p>Updated content</p>')
      }
    })

    render(<CollaborativeEditor {...defaultProps} onContentChange={onContentChange} />)
    
    await waitFor(() => {
      expect(onContentChange).toHaveBeenCalledWith('<p>Updated content</p>')
    })
  })

  it('initializes with the provided room ID', async () => {
    const { CollaborationManager } = await import('@ltoc/utils/collaboration')
    
    render(<CollaborativeEditor {...defaultProps} roomId="custom-room" />)
    
    expect(CollaborationManager).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: 'custom-room'
      })
    )
  })

  it('cleans up collaboration on unmount', async () => {
    const { CollaborationManager } = await import('@ltoc/utils/collaboration')
    const mockDestroy = vi.fn()
    
    const mockManager = CollaborationManager as any
    mockManager.mockImplementation(() => ({
      getDoc: vi.fn().mockReturnValue({
        getText: vi.fn().mockReturnValue({
          toString: vi.fn().mockReturnValue(''),
          length: 0
        })
      }),
      getAwareness: vi.fn().mockReturnValue({
        on: vi.fn(),
        off: vi.fn(),
        setLocalStateField: vi.fn()
      }),
      getConnectedUsers: vi.fn().mockReturnValue([]),
      updateCursor: vi.fn(),
      destroy: mockDestroy
    }))

    const { unmount } = render(<CollaborativeEditor {...defaultProps} />)
    
    unmount()
    
    expect(mockDestroy).toHaveBeenCalled()
  })
})