'use client'
import { useState } from 'react'
import { Search, Filter, Calendar, Tag, User, FileText, TrendingUp } from 'lucide-react'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults] = useState([
    {
      type: 'theory',
      title: 'Climate Resilience Framework',
      excerpt: 'Building community resilience through adaptive climate strategies...',
      author: 'John Doe',
      date: '2024-01-15',
      tags: ['Climate', 'Resilience', 'Community']
    },
    {
      type: 'insight',
      title: 'Cross-Sector Collaboration Patterns',
      excerpt: 'Analysis of successful collaboration models across different sectors...',
      author: 'AI Assistant',
      date: '2024-01-10',
      tags: ['Collaboration', 'Analysis']
    },
    {
      type: 'theory',
      title: 'Digital Literacy Program Design',
      excerpt: 'Comprehensive approach to improving digital skills in underserved communities...',
      author: 'Emily Watson',
      date: '2024-01-08',
      tags: ['Education', 'Technology', 'Digital']
    }
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600">Find theories, insights, and collaborators</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search theories, topics, authors..."
            className="pl-12 pr-4 py-4 w-full text-lg border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            autoFocus
          />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Popular:</span>
          {['Climate Action', 'Education Innovation', 'Healthcare Access', 'AI Integration'].map(term => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Type</h4>
                <div className="space-y-2">
                  {['Theories', 'Insights', 'Users', 'Organizations'].map(type => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Date Range</h4>
                <select className="w-full text-sm border rounded p-2">
                  <option>Any time</option>
                  <option>Past week</option>
                  <option>Past month</option>
                  <option>Past year</option>
                </select>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {['Climate', 'Education', 'Health', 'Technology', 'Community'].map(tag => (
                    <button
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              Found {searchResults.length} results
            </p>
            <select className="text-sm border rounded px-3 py-1">
              <option>Most Relevant</option>
              <option>Most Recent</option>
              <option>Most Popular</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {searchResults.map((result, idx) => (
              <div key={idx} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.type === 'theory' ? (
                      <FileText className="w-5 h-5 text-primary" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-accent" />
                    )}
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {result.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{result.date}</span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-accent hover:opacity-80 cursor-pointer">
                  {result.title}
                </h3>
                <p className="text-gray-600 mb-3">{result.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <User className="w-4 h-4" />
                      {result.author}
                    </span>
                    <div className="flex gap-2">
                      {result.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
