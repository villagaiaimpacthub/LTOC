import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchPage from '../page'

// Mock Next.js
const mockSearchParams = vi.fn()
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams()
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

// Mock components
vi.mock('@/components/search/search-bar', () => ({
  SearchBar: ({ onSearch, initialQuery }: any) => (
    <div>
      <input
        data-testid="search-input"
        placeholder="Search..."
        defaultValue={initialQuery}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}))

vi.mock('@/components/content-card', () => ({
  ContentCard: ({ content, showHighlight }: any) => (
    <div data-testid={`content-${content.id}`}>
      <h3>{content.title}</h3>
      {showHighlight && <span>highlighted</span>}
    </div>
  )
}))

describe('SearchPage', () => {
  const mockSearchResults = {
    contents: [
      {
        id: '1',
        title: 'Climate <mark>Change</mark> Strategies',
        summary: 'Addressing climate <mark>change</mark>',
        tags: ['climate', 'change'],
        created_at: new Date().toISOString(),
        author: { display_name: 'John Doe' }
      },
      {
        id: '2',
        title: 'Systems <mark>Change</mark> Theory',
        summary: 'Understanding systems <mark>change</mark>',
        tags: ['systems', 'theory'],
        created_at: new Date().toISOString(),
        author: { display_name: 'Jane Smith' }
      }
    ],
    total_count: 2,
    facets: {
      tags: [
        { value: 'climate', count: 5 },
        { value: 'systems', count: 3 },
        { value: 'theory', count: 2 }
      ],
      authors: [
        { value: 'John Doe', count: 4 },
        { value: 'Jane Smith', count: 3 }
      ],
      organizations: [
        { value: 'Org A', count: 6 },
        { value: 'Org B', count: 1 }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSearchParams.mockReturnValue({
      get: (key: string) => {
        if (key === 'q') return 'change'
        return null
      }
    })

    mockRpc.mockResolvedValue({
      data: mockSearchResults,
      error: null
    })
  })

  it('performs search with query parameter', async () => {
    render(<SearchPage />)

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('search_content', {
        search_query: 'change',
        limit_count: 20,
        offset_count: 0
      })
    })
  })

  it('displays search results', async () => {
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('Climate Change Strategies')).toBeInTheDocument()
      expect(screen.getByText('Systems Change Theory')).toBeInTheDocument()
      expect(screen.getByText('2 results for "change"')).toBeInTheDocument()
    })
  })

  it('shows search highlights', async () => {
    render(<SearchPage />)

    await waitFor(() => {
      const content1 = screen.getByTestId('content-1')
      const content2 = screen.getByTestId('content-2')
      
      expect(content1.querySelector('span')?.textContent).toBe('highlighted')
      expect(content2.querySelector('span')?.textContent).toBe('highlighted')
    })
  })

  it('displays search facets', async () => {
    render(<SearchPage />)

    await waitFor(() => {
      // Tag facets
      expect(screen.getByText('Tags')).toBeInTheDocument()
      expect(screen.getByText('climate (5)')).toBeInTheDocument()
      expect(screen.getByText('systems (3)')).toBeInTheDocument()
      
      // Author facets
      expect(screen.getByText('Authors')).toBeInTheDocument()
      expect(screen.getByText('John Doe (4)')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith (3)')).toBeInTheDocument()
      
      // Organization facets
      expect(screen.getByText('Organizations')).toBeInTheDocument()
      expect(screen.getByText('Org A (6)')).toBeInTheDocument()
    })
  })

  it('filters results by facet', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('climate (5)')).toBeInTheDocument()
    })

    // Click on a tag facet
    const climateFacet = screen.getByText('climate (5)')
    await user.click(climateFacet)

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('search_content', {
        search_query: 'change',
        limit_count: 20,
        offset_count: 0,
        filter_tags: ['climate']
      })
    })
  })

  it('handles multiple facet filters', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('climate (5)')).toBeInTheDocument()
    })

    // Select multiple filters
    await user.click(screen.getByText('climate (5)'))
    await user.click(screen.getByText('John Doe (4)'))

    await waitFor(() => {
      expect(mockRpc).toHaveBeenLastCalledWith('search_content', {
        search_query: 'change',
        limit_count: 20,
        offset_count: 0,
        filter_tags: ['climate'],
        filter_authors: ['John Doe']
      })
    })
  })

  it('handles new search from search bar', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument()
    })

    const searchInput = screen.getByTestId('search-input')
    await user.clear(searchInput)
    await user.type(searchInput, 'systems thinking')

    await waitFor(() => {
      expect(mockRpc).toHaveBeenLastCalledWith('search_content', {
        search_query: 'systems thinking',
        limit_count: 20,
        offset_count: 0
      })
    })
  })

  it('shows no results message', async () => {
    mockRpc.mockResolvedValue({
      data: {
        contents: [],
        total_count: 0,
        facets: { tags: [], authors: [], organizations: [] }
      },
      error: null
    })

    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('No results found for "change"')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument()
    })
  })

  it('handles search errors', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error('Search failed')
    })

    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText(/Error performing search/i)).toBeInTheDocument()
    })
  })

  it('paginates search results', async () => {
    // Mock results with many items
    mockRpc.mockResolvedValue({
      data: {
        ...mockSearchResults,
        total_count: 50
      },
      error: null
    })

    const user = userEvent.setup()
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('2 results for "change"')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    })

    // Go to next page
    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(mockRpc).toHaveBeenLastCalledWith('search_content', {
        search_query: 'change',
        limit_count: 20,
        offset_count: 20
      })
    })
  })

  it('shows search suggestions', async () => {
    mockRpc.mockImplementation((method) => {
      if (method === 'get_search_suggestions') {
        return Promise.resolve({
          data: [
            { suggestion: 'change management', usage_count: 10 },
            { suggestion: 'change theory', usage_count: 5 }
          ],
          error: null
        })
      }
      return Promise.resolve({ data: mockSearchResults, error: null })
    })

    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('Popular searches:')).toBeInTheDocument()
      expect(screen.getByText('change management')).toBeInTheDocument()
      expect(screen.getByText('change theory')).toBeInTheDocument()
    })
  })

  it('sorts search results', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Sort by/i })).toBeInTheDocument()
    })

    const sortSelect = screen.getByRole('combobox', { name: /Sort by/i })
    await user.selectOptions(sortSelect, 'newest')

    await waitFor(() => {
      expect(mockRpc).toHaveBeenLastCalledWith('search_content', {
        search_query: 'change',
        limit_count: 20,
        offset_count: 0,
        sort_by: 'newest'
      })
    })
  })

  it('clears all filters', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('climate (5)')).toBeInTheDocument()
    })

    // Apply some filters
    await user.click(screen.getByText('climate (5)'))
    await user.click(screen.getByText('John Doe (4)'))

    // Clear filters
    const clearButton = screen.getByRole('button', { name: /Clear filters/i })
    await user.click(clearButton)

    await waitFor(() => {
      expect(mockRpc).toHaveBeenLastCalledWith('search_content', {
        search_query: 'change',
        limit_count: 20,
        offset_count: 0
      })
    })
  })

  it('shows loading state during search', async () => {
    mockRpc.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<SearchPage />)

    expect(screen.getByText(/Searching/i)).toBeInTheDocument()
  })
})