'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label } from '@ltoc/ui'
import { SearchBar } from '@/components/search/search-bar'
import { ContentCard } from '@/components/content-card'
import { Search, Filter, X, Loader2, FileText } from 'lucide-react'
import type { Content, User } from '@ltoc/database'

interface SearchResult extends Omit<Content, 'author_id'> {
  author_name: string
  author_id: string
  rank: number
  highlight_title: string
  highlight_summary: string
}

interface Filters {
  tags: string[]
  contentType?: 'article' | 'guide' | 'case_study' | 'framework'
  dateFrom?: string
  dateTo?: string
  author?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { user } = useUser()
  
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>({ tags: [] })
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  
  const resultsPerPage = 20

  // Fetch available tags for filter
  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase
        .from('content')
        .select('tags')
        .eq('status', 'published')
        .not('tags', 'is', null)

      if (data) {
        const allTags = new Set<string>()
        data.forEach(item => {
          item.tags?.forEach(tag => allTags.add(tag))
        })
        setAvailableTags(Array.from(allTags).sort())
      }
    }
    fetchTags()
  }, [supabase])

  const performSearch = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim() && filters.tags.length === 0 && !filters.author) {
      setResults([])
      setTotalResults(0)
      return
    }

    setLoading(true)
    try {
      // Perform search
      const { data: searchResults, error } = await supabase.rpc('search_content', {
        search_query: searchQuery,
        tag_filter: filters.tags.length > 0 ? filters.tags : null,
        content_type_filter: filters.contentType || null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
        status_filter: 'published',
        limit_count: resultsPerPage,
        offset_count: (page - 1) * resultsPerPage
      })

      if (error) throw error

      setResults(searchResults || [])
      
      // Get total count
      const { count } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .textSearch('search_vector', searchQuery || '')

      setTotalResults(count || 0)

      // Log search to history
      if (user && searchQuery) {
        await supabase.from('search_history').insert({
          user_id: user.id,
          organization_id: user.organization_id,
          query: searchQuery,
          filters: filters,
          results_count: searchResults?.length || 0
        })
      }

    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, supabase, user, resultsPerPage])

  // Perform search when query or filters change
  useEffect(() => {
    performSearch(query, currentPage)
  }, [query, filters, currentPage, performSearch])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setCurrentPage(1)
  }

  const toggleTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ tags: [] })
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalResults / resultsPerPage)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Search</h1>
        </div>
        <p className="text-muted-foreground">
          Search through our knowledge base to find relevant content
        </p>
      </div>

      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters {filters.tags.length > 0 && `(${filters.tags.length})`}
          </Button>
          
          {(filters.tags.length > 0 || filters.contentType || filters.author) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
        
        {!loading && query && (
          <p className="text-sm text-muted-foreground">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Content Type</Label>
                <div className="mt-2 flex gap-2">
                  {(['article', 'guide', 'case_study', 'framework'] as const).map(type => (
                    <Button
                      key={type}
                      variant={filters.contentType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        contentType: prev.contentType === type ? undefined : type
                      }))}
                    >
                      {type.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          </CardContent>
        </Card>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <ContentCard
              key={result.id}
              content={{
                ...result,
                title: result.highlight_title || result.title,
                summary: result.highlight_summary || result.summary,
                author: { display_name: result.author_name }
              }}
              showHighlight
            />
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : query || filters.tags.length > 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Search className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Start searching</p>
              <p className="text-sm text-muted-foreground">
                Enter a search term or select filters to find content
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}