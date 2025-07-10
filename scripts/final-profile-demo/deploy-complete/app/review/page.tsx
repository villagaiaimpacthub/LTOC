'use client'
import { useState } from 'react'
import { 
  Eye, CheckCircle, XCircle, MessageSquare, 
  Clock, AlertCircle, FileText, User
} from 'lucide-react'

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState('pending')
  
  const reviews = [
    {
      id: 1,
      title: 'Updated Climate Action Framework',
      author: 'John Doe',
      type: 'Major Update',
      priority: 'high',
      submitted: '2 hours ago',
      changes: 15,
      comments: 3,
      status: 'pending'
    },
    {
      id: 2,
      title: 'New Education Technology Strategy',
      author: 'Emily Watson',
      type: 'New Theory',
      priority: 'medium',
      submitted: '1 day ago',
      changes: 42,
      comments: 7,
      status: 'pending'
    },
    {
      id: 3,
      title: 'Healthcare Metrics Update',
      author: 'Maria Garcia',
      type: 'Minor Update',
      priority: 'low',
      submitted: '3 days ago',
      changes: 8,
      comments: 2,
      status: 'approved'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Queue</h1>
        <p className="text-gray-600">Review and approve changes to theories</p>
      </div>

      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab} ({tab === 'pending' ? 2 : tab === 'approved' ? 1 : 0})
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-4">
        {reviews
          .filter(r => r.status === activeTab || (activeTab === 'pending' && r.status === 'pending'))
          .map((review) => (
            <div key={review.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{review.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      review.priority === 'high' ? 'bg-red-100 text-red-700' :
                      review.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {review.priority} priority
                    </span>
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      {review.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {review.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {review.submitted}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {review.changes} changes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {review.comments} comments
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Summary of Changes</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Updated intervention strategies section</li>
                      <li>• Added new impact metrics</li>
                      <li>• Revised timeline based on pilot results</li>
                    </ul>
                  </div>
                  
                  {review.status === 'pending' && (
                    <div className="flex items-center gap-3">
                      <button className="btn-primary">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button className="btn-secondary">
                        <MessageSquare className="w-4 h-4" />
                        Request Changes
                      </button>
                      <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button className="ml-auto text-accent hover:opacity-80">
                        View Details →
                      </button>
                    </div>
                  )}
                  
                  {review.status === 'approved' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approved by Sarah Chen
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
