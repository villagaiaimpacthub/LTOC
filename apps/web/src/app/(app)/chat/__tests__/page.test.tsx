import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatPage from '../page'

// Mock Supabase
const mockFrom = vi.fn()
const mockRpc = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: mockFrom,
      rpc: mockRpc
    }
  })
}))

// Mock user hook
const mockUser = vi.fn()
vi.mock('@/hooks/use-user', () => ({
  useUser: () => mockUser()
}))

// Mock AI service
vi.mock('@ltoc/utils', () => ({
  createAIService: () => ({
    chat: vi.fn().mockResolvedValue({
      content: 'AI response to your question'
    })
  }),
  validationSchemas: {
    synthesisPrompt: { parse: (v: string) => v }
  }
}))

describe('ChatPage', () => {
  const mockConversations = [
    {
      id: 'conv-1',
      title: 'Systems Thinking Discussion',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date('2024-01-01').toISOString()
    },
    {
      id: 'conv-2',
      title: 'Climate Action Strategies',
      created_at: new Date('2024-01-02').toISOString(),
      updated_at: new Date('2024-01-02').toISOString()
    }
  ]

  const mockMessages = [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'user',
      content: 'What is systems thinking?',
      created_at: new Date('2024-01-01T10:00:00').toISOString()
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      role: 'assistant',
      content: 'Systems thinking is an approach to problem solving...',
      created_at: new Date('2024-01-01T10:00:30').toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUser.mockReturnValue({
      user: {
        id: 'user-1',
        organization_id: 'org-1'
      }
    })

    // Mock conversations query
    mockFrom.mockImplementation((table) => {
      if (table === 'ai_conversations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockConversations,
            error: null
          }),
          insert: vi.fn().mockResolvedValue({
            data: { id: 'new-conv-id' },
            error: null
          })
        }
      }
      if (table === 'ai_messages') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockMessages,
            error: null
          }),
          insert: vi.fn().mockResolvedValue({
            data: { id: 'new-msg-id' },
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      }
    })
  })

  it('displays chat interface', async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Ask a question/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument()
    })
  })

  it('displays conversation history', async () => {
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('Systems Thinking Discussion')).toBeInTheDocument()
      expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
    })
  })

  it('loads messages for selected conversation', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('Systems Thinking Discussion')).toBeInTheDocument()
    })

    // Click on a conversation
    const conversation = screen.getByText('Systems Thinking Discussion')
    await user.click(conversation)

    await waitFor(() => {
      expect(screen.getByText('What is systems thinking?')).toBeInTheDocument()
      expect(screen.getByText('Systems thinking is an approach to problem solving...')).toBeInTheDocument()
    })
  })

  it('sends a new message', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'How does systems thinking apply to climate change?')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await user.click(sendButton)

    await waitFor(() => {
      // Should create conversation if none selected
      expect(mockFrom('ai_conversations').insert).toHaveBeenCalled()
      
      // Should insert user message
      expect(mockFrom('ai_messages').insert).toHaveBeenCalledWith({
        conversation_id: expect.any(String),
        role: 'user',
        content: 'How does systems thinking apply to climate change?',
        user_id: 'user-1'
      })
    })

    // Should display AI response
    await waitFor(() => {
      expect(screen.getByText('AI response to your question')).toBeInTheDocument()
    })
  })

  it('creates new conversation', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const newChatButton = screen.getByRole('button', { name: /New Chat/i })
    await user.click(newChatButton)

    // Should clear current conversation
    await waitFor(() => {
      expect(screen.queryByText('What is systems thinking?')).not.toBeInTheDocument()
    })
  })

  it('deletes conversation', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'ai_conversations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: mockConversations,
            error: null
          }),
          delete: vi.fn().mockReturnThis()
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      }
    })

    const user = userEvent.setup()
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('Systems Thinking Discussion')).toBeInTheDocument()
    })

    // Find delete button for a conversation
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
    await user.click(deleteButtons[0])

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /Confirm/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockFrom('ai_conversations').delete).toHaveBeenCalled()
    })
  })

  it('handles message errors gracefully', async () => {
    vi.mocked(require('@ltoc/utils').createAIService).mockReturnValue({
      chat: vi.fn().mockRejectedValue(new Error('AI service unavailable'))
    })

    const user = userEvent.setup()
    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to get response/i)).toBeInTheDocument()
    })
  })

  it('shows typing indicator while AI responds', async () => {
    vi.mocked(require('@ltoc/utils').createAIService).mockReturnValue({
      chat: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ content: 'Response' }), 1000))
      )
    })

    const user = userEvent.setup()
    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/Ask a question/i)
    await user.type(input, 'Test question')

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await user.click(sendButton)

    // Should show typing indicator
    expect(screen.getByText(/AI is typing/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText(/AI is typing/i)).not.toBeInTheDocument()
    })
  })

  it('supports context from content', async () => {
    // Mock content for context
    mockFrom.mockImplementation((table) => {
      if (table === 'content') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'content-1',
              title: 'Climate Change Guide',
              content: 'Detailed content about climate change...'
            },
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      }
    })

    const user = userEvent.setup()
    render(<ChatPage />)

    // Add content context button should be visible
    const addContextButton = screen.getByRole('button', { name: /Add Content Context/i })
    await user.click(addContextButton)

    await waitFor(() => {
      expect(screen.getByText('Select content for context')).toBeInTheDocument()
    })
  })

  it('exports conversation', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('Systems Thinking Discussion')).toBeInTheDocument()
    })

    // Select a conversation
    await user.click(screen.getByText('Systems Thinking Discussion'))

    await waitFor(() => {
      expect(screen.getByText('What is systems thinking?')).toBeInTheDocument()
    })

    // Export conversation
    const exportButton = screen.getByRole('button', { name: /Export/i })
    await user.click(exportButton)

    // Should trigger download
    expect(screen.getByText(/Conversation exported/i)).toBeInTheDocument()
  })

  it('searches conversations', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    await waitFor(() => {
      expect(screen.getByText('Systems Thinking Discussion')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search conversations/i)
    await user.type(searchInput, 'climate')

    // Should filter conversations
    expect(screen.queryByText('Systems Thinking Discussion')).not.toBeInTheDocument()
    expect(screen.getByText('Climate Action Strategies')).toBeInTheDocument()
  })

  it('handles empty message submission', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const sendButton = screen.getByRole('button', { name: /Send/i })
    await user.click(sendButton)

    // Should not send message
    expect(mockFrom('ai_messages').insert).not.toHaveBeenCalled()
  })

  it('limits message length', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/Ask a question/i)
    const longMessage = 'a'.repeat(5001) // Over 5000 char limit

    await user.type(input, longMessage)

    expect(screen.getByText(/Message too long/i)).toBeInTheDocument()
  })
})