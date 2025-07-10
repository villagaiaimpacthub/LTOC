import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SynthesisGenerator } from '../synthesis-generator'

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
vi.mock('@/hooks/use-user', () => ({
  useUser: () => ({
    user: {
      id: 'user-id',
      organization_id: 'org-id'
    }
  })
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  toast: (props: any) => mockToast(props)
}))

// Mock AI service
vi.mock('@ltoc/utils', () => ({
  createAIService: () => ({
    generateSynthesis: vi.fn().mockResolvedValue({
      synthesis: 'This is a synthesized summary of the selected content.'
    })
  })
}))

describe('SynthesisGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock content query
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            title: 'Content 1',
            description: 'First content'
          },
          {
            id: '2',
            title: 'Content 2',
            description: 'Second content'
          },
          {
            id: '3',
            title: 'Content 3',
            description: 'Third content'
          }
        ],
        error: null
      })
    })
  })

  it('renders synthesis generator interface', async () => {
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Generate AI Synthesis')).toBeInTheDocument()
      expect(screen.getByText('Select content to synthesize')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Describe what kind of synthesis/i)).toBeInTheDocument()
    })
  })

  it('loads and displays available content', async () => {
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.getByText('Content 3')).toBeInTheDocument()
    })
  })

  it('allows selecting multiple content items', async () => {
    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Select content items
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    const checkbox2 = screen.getByRole('checkbox', { name: /Content 2/i })
    
    await user.click(checkbox1)
    await user.click(checkbox2)

    expect(checkbox1).toBeChecked()
    expect(checkbox2).toBeChecked()
    expect(screen.getByText('2 items selected')).toBeInTheDocument()
  })

  it('requires at least 2 content items to generate', async () => {
    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Select only one item
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    await user.click(checkbox1)

    const generateButton = screen.getByRole('button', { name: /Generate Synthesis/i })
    expect(generateButton).toBeDisabled()
  })

  it('generates synthesis successfully', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { id: 'synthesis-1' },
      error: null
    })

    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Select content
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    const checkbox2 = screen.getByRole('checkbox', { name: /Content 2/i })
    await user.click(checkbox1)
    await user.click(checkbox2)

    // Add prompt
    const promptInput = screen.getByPlaceholderText(/Describe what kind of synthesis/i)
    await user.type(promptInput, 'Create a summary focusing on key themes')

    // Generate
    const generateButton = screen.getByRole('button', { name: /Generate Synthesis/i })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Generating synthesis...')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('create_synthesis', {
        p_content_ids: ['1', '2'],
        p_prompt: 'Create a summary focusing on key themes',
        p_user_id: 'user-id',
        p_organization_id: 'org-id'
      })
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Synthesis generated successfully'
      })
    })
  })

  it('displays generated synthesis', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { 
        id: 'synthesis-1',
        content: 'This is a synthesized summary of the selected content.'
      },
      error: null
    })

    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Select and generate
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    const checkbox2 = screen.getByRole('checkbox', { name: /Content 2/i })
    await user.click(checkbox1)
    await user.click(checkbox2)

    const generateButton = screen.getByRole('button', { name: /Generate Synthesis/i })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Generated Synthesis')).toBeInTheDocument()
      expect(screen.getByText('This is a synthesized summary of the selected content.')).toBeInTheDocument()
    })
  })

  it('handles generation errors', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to generate synthesis' }
    })

    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Select and try to generate
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    const checkbox2 = screen.getByRole('checkbox', { name: /Content 2/i })
    await user.click(checkbox1)
    await user.click(checkbox2)

    const generateButton = screen.getByRole('button', { name: /Generate Synthesis/i })
    await user.click(generateButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to generate synthesis',
        variant: 'destructive'
      })
    })
  })

  it('allows saving synthesis as new content', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { 
        id: 'synthesis-1',
        content: 'This is a synthesized summary.'
      },
      error: null
    })

    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: { id: 'new-content-1' },
        error: null
      })
    })

    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Generate synthesis first
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    const checkbox2 = screen.getByRole('checkbox', { name: /Content 2/i })
    await user.click(checkbox1)
    await user.click(checkbox2)

    const generateButton = screen.getByRole('button', { name: /Generate Synthesis/i })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('Generated Synthesis')).toBeInTheDocument()
    })

    // Save as content
    const saveButton = screen.getByRole('button', { name: /Save as Content/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Synthesis saved as new content'
      })
    })
  })

  it('allows regenerating synthesis', async () => {
    mockRpc
      .mockResolvedValueOnce({
        data: { 
          id: 'synthesis-1',
          content: 'First synthesis'
        },
        error: null
      })
      .mockResolvedValueOnce({
        data: { 
          id: 'synthesis-2',
          content: 'Regenerated synthesis'
        },
        error: null
      })

    const user = userEvent.setup()
    render(<SynthesisGenerator contentCount={10} />)

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    // Generate first
    const checkbox1 = screen.getByRole('checkbox', { name: /Content 1/i })
    const checkbox2 = screen.getByRole('checkbox', { name: /Content 2/i })
    await user.click(checkbox1)
    await user.click(checkbox2)

    const generateButton = screen.getByRole('button', { name: /Generate Synthesis/i })
    await user.click(generateButton)

    await waitFor(() => {
      expect(screen.getByText('First synthesis')).toBeInTheDocument()
    })

    // Regenerate
    const regenerateButton = screen.getByRole('button', { name: /Regenerate/i })
    await user.click(regenerateButton)

    await waitFor(() => {
      expect(screen.getByText('Regenerated synthesis')).toBeInTheDocument()
    })
  })
})