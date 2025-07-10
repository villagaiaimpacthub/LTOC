import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from '../editor'

// Mock Tiptap
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: {
      setContent: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleHeading: vi.fn(),
      toggleBulletList: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBlockquote: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn()
    },
    getHTML: vi.fn(() => '<p>Test content</p>'),
    getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
    isActive: vi.fn(() => false)
  })),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content">{editor ? 'Editor loaded' : 'Loading...'}</div>
  )
}))

// Mock Tiptap extensions
vi.mock('@tiptap/starter-kit', () => ({
  default: vi.fn()
}))

describe('Editor', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    value: '<p>Initial content</p>',
    onChange: mockOnChange
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders editor with toolbar', () => {
    render(<Editor {...defaultProps} />)

    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Italic')).toBeInTheDocument()
    expect(screen.getByTitle('Heading 1')).toBeInTheDocument()
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument()
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument()
    expect(screen.getByTitle('Ordered List')).toBeInTheDocument()
    expect(screen.getByTitle('Quote')).toBeInTheDocument()
  })

  it('handles placeholder text', () => {
    render(<Editor {...defaultProps} placeholder="Write something..." />)
    
    // Placeholder is passed through editor configuration
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('handles readonly mode', () => {
    render(<Editor {...defaultProps} readonly />)

    const toolbar = screen.queryByRole('toolbar')
    expect(toolbar).not.toBeInTheDocument()
  })

  it('calls onChange when content changes', async () => {
    const { useEditor } = await import('@tiptap/react')
    const mockEditor = {
      commands: {
        setContent: vi.fn(),
        toggleBold: vi.fn()
      },
      getHTML: vi.fn(() => '<p><strong>Bold text</strong></p>'),
      on: vi.fn((event, callback) => {
        if (event === 'update') {
          // Simulate content update
          setTimeout(() => callback({ editor: mockEditor }), 100)
        }
      }),
      off: vi.fn(),
      destroy: vi.fn(),
      isActive: vi.fn(() => false)
    }
    
    vi.mocked(useEditor).mockReturnValue(mockEditor as any)

    render(<Editor {...defaultProps} />)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('<p><strong>Bold text</strong></p>')
    })
  })

  it('handles toolbar actions', async () => {
    const { useEditor } = await import('@tiptap/react')
    const mockCommands = {
      setContent: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleHeading: vi.fn(),
      toggleBulletList: vi.fn(),
      toggleOrderedList: vi.fn(),
      toggleBlockquote: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn()
    }
    
    const mockEditor = {
      commands: mockCommands,
      getHTML: vi.fn(() => '<p>Test</p>'),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      isActive: vi.fn(() => false)
    }
    
    vi.mocked(useEditor).mockReturnValue(mockEditor as any)

    const user = userEvent.setup()
    render(<Editor {...defaultProps} />)

    // Test bold button
    const boldButton = screen.getByTitle('Bold')
    await user.click(boldButton)
    expect(mockCommands.toggleBold).toHaveBeenCalled()

    // Test italic button
    const italicButton = screen.getByTitle('Italic')
    await user.click(italicButton)
    expect(mockCommands.toggleItalic).toHaveBeenCalled()

    // Test heading button
    const headingButton = screen.getByTitle('Heading 1')
    await user.click(headingButton)
    expect(mockCommands.toggleHeading).toHaveBeenCalledWith({ level: 1 })
  })

  it('shows active states for formatting', async () => {
    const { useEditor } = await import('@tiptap/react')
    const mockEditor = {
      commands: {
        setContent: vi.fn(),
        toggleBold: vi.fn()
      },
      getHTML: vi.fn(() => '<p>Test</p>'),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      isActive: vi.fn((type: string) => type === 'bold')
    }
    
    vi.mocked(useEditor).mockReturnValue(mockEditor as any)

    render(<Editor {...defaultProps} />)

    const boldButton = screen.getByTitle('Bold')
    expect(boldButton).toHaveClass('bg-muted')
  })

  it('handles undo and redo', async () => {
    const { useEditor } = await import('@tiptap/react')
    const mockCommands = {
      setContent: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn()
    }
    
    const mockEditor = {
      commands: mockCommands,
      getHTML: vi.fn(() => '<p>Test</p>'),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      isActive: vi.fn(() => false)
    }
    
    vi.mocked(useEditor).mockReturnValue(mockEditor as any)

    const user = userEvent.setup()
    render(<Editor {...defaultProps} />)

    const undoButton = screen.getByTitle('Undo')
    await user.click(undoButton)
    expect(mockCommands.undo).toHaveBeenCalled()

    const redoButton = screen.getByTitle('Redo')
    await user.click(redoButton)
    expect(mockCommands.redo).toHaveBeenCalled()
  })

  it('cleans up editor on unmount', () => {
    const { useEditor } = await import('@tiptap/react')
    const mockDestroy = vi.fn()
    const mockEditor = {
      commands: { setContent: vi.fn() },
      getHTML: vi.fn(() => '<p>Test</p>'),
      on: vi.fn(),
      off: vi.fn(),
      destroy: mockDestroy,
      isActive: vi.fn(() => false)
    }
    
    vi.mocked(useEditor).mockReturnValue(mockEditor as any)

    const { unmount } = render(<Editor {...defaultProps} />)
    
    unmount()
    
    expect(mockDestroy).toHaveBeenCalled()
  })
})