import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../search-bar'

// Mock the router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

// Mock Supabase
const mockRpc = vi.fn()
vi.mock('@/components/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {
      rpc: mockRpc
    }
  })
}))

// Mock debounce hook
vi.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input with placeholder', () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    expect(input).toBeInTheDocument()
  })

  it('navigates to search page on enter key', async () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'test query{Enter}')
    
    expect(mockPush).toHaveBeenCalledWith('/search?q=test%20query')
  })

  it('calls onSearch callback when provided', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'test query{Enter}')
    
    expect(onSearch).toHaveBeenCalledWith('test query')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('fetches and displays suggestions', async () => {
    const suggestions = [
      { suggestion: 'React Tutorial', type: 'content', usage_count: 10 },
      { suggestion: 'typescript', type: 'tag', usage_count: 5 },
      { suggestion: 'systems thinking', type: 'history', usage_count: 3 }
    ]
    
    mockRpc.mockResolvedValue({ data: suggestions, error: null })
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'Re')
    
    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('get_search_suggestions', {
        partial_query: 'Re',
        limit_count: 8
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument()
      expect(screen.getByText('typescript')).toBeInTheDocument()
      expect(screen.getByText('systems thinking')).toBeInTheDocument()
    })
  })

  it('navigates with suggestion when clicked', async () => {
    const suggestions = [
      { suggestion: 'React Tutorial', type: 'content', usage_count: 10 }
    ]
    
    mockRpc.mockResolvedValue({ data: suggestions, error: null })
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'Re')
    
    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('React Tutorial'))
    
    expect(mockPush).toHaveBeenCalledWith('/search?q=React%20Tutorial')
  })

  it('handles keyboard navigation in suggestions', async () => {
    const suggestions = [
      { suggestion: 'Option 1', type: 'content', usage_count: 10 },
      { suggestion: 'Option 2', type: 'tag', usage_count: 5 }
    ]
    
    mockRpc.mockResolvedValue({ data: suggestions, error: null })
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'Op')
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
    
    // Press arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    
    // Press enter to select first option
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockPush).toHaveBeenCalledWith('/search?q=Option%201')
  })

  it('hides suggestions on escape key', async () => {
    const suggestions = [
      { suggestion: 'Option 1', type: 'content', usage_count: 10 }
    ]
    
    mockRpc.mockResolvedValue({ data: suggestions, error: null })
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'Op')
    
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })
    
    fireEvent.keyDown(input, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
    })
  })

  it('shows loading indicator while fetching suggestions', async () => {
    mockRpc.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'test')
    
    // Should show loader
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles errors gracefully', async () => {
    mockRpc.mockRejectedValue(new Error('Network error'))
    
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText('Search content, tags, or authors...')
    await userEvent.type(input, 'test')
    
    // Should not crash and suggestions should remain empty
    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })
})