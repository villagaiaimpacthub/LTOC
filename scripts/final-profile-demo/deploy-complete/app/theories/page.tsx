'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, Search, Filter, MoreVertical, Eye, Edit, 
  Trash2, Share2, Download, Tag, Calendar, User,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react'

export default function TheoriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const theories = [
    {
      id: 1,
      title: 'Education Innovation Framework',
      description: 'Transforming learning through adaptive AI-powered education systems',
      author: 'Sarah Chen',
      organization: 'EduTech Foundation',
      status: 'published',
      lastUpdated: '2 hours ago',
      tags: ['Education', 'AI/ML', 'Innovation'],
      metrics: { views: 1234, edits: 45, shares: 23 },
      completeness: 85
    },
    {
      id: 2,
      title: 'Climate Action Roadmap 2030',
      description: 'Community-driven approach to carbon neutrality',
      author: 'John Doe',
      organization: 'Green Future Initiative',
      status: 'in-review',
      lastUpdated: '1 day ago',
      tags: ['Climate', 'Sustainability', 'Community'],
      metrics: { views: 892, edits: 31, shares: 19 },
      completeness: 92
    },
    {
      id: 3,
      title: 'Healthcare Access Equity Model',
      description: 'Bridging gaps in underserved communities through mobile health',
      author: 'Maria Garcia',
      organization: 'Health for All',
      status: 'draft',
      lastUpdated: '3 days ago',
      tags: ['Healthcare', 'Equity', 'Technology'],
      metrics: { views: 567, edits: 28, shares: 12 },
      completeness: 67
    },
  ]

  const allTags = ['Education', 'AI/ML', 'Innovation', 'Climate', 'Sustainability', 'Community', 'Healthcare', 'Equity', 'Technology']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Theories of Change</h1>
          <p className="text-gray-600">Manage and collaborate on your theories</p>
        </div>
        <Link href="/theories/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Theory
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search theories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <button 
          onClick={() => setFilterOpen(!filterOpen)}
          className="btn-secondary"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {filterOpen && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg animate-slide-in">
          <h3 className="font-medium mb-3">Filter by tags:</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(
                  selectedTags.includes(tag) 
                    ? selectedTags.filter(t => t !== tag)
                    : [...selectedTags, tag]
                )}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-accent text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {theories.map((theory) => (
          <div key={theory.id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link 
                      href={`/theories/${theory.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-accent"
                    >
                      {theory.title}
                    </Link>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      theory.status === 'published' ? 'bg-green-100 text-green-700' :
                      theory.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {theory.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{theory.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {theory.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {theory.lastUpdated}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {theory.metrics.views} views
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    {theory.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full border-4 ${
                      theory.completeness >= 80 ? 'border-green-500' :
                      theory.completeness >= 60 ? 'border-yellow-500' :
                      'border-red-500'
                    }`}>
                      <div className="flex items-center justify-center h-full text-sm font-medium">
                        {theory.completeness}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <Link href={`/theories/${theory.id}/edit`} className="p-2 hover:bg-gray-100 rounded">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Link>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
