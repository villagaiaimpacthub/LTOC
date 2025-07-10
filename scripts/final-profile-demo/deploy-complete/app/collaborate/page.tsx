'use client'
import { useState } from 'react'
import { 
  Users, MessageSquare, Video, Share2, Save, 
  Clock, Circle, CheckCircle, Edit3, Eye
} from 'lucide-react'

export default function CollaboratePage() {
  const [activeUsers] = useState([
    { id: 1, name: 'Sarah Chen', color: 'bg-primary', cursor: { x: 150, y: 200 } },
    { id: 2, name: 'John Doe', color: 'bg-secondary', cursor: { x: 300, y: 350 } },
    { id: 3, name: 'You', color: 'bg-accent', cursor: null },
  ])
  
  const [content, setContent] = useState(`# Healthcare Access Theory of Change

## Problem Statement
Many rural communities lack access to basic healthcare services, leading to preventable diseases and poor health outcomes.

## Root Causes
- Geographic isolation and transportation barriers
- Shortage of healthcare professionals in rural areas
- Limited infrastructure and medical facilities
- Economic constraints and lack of insurance coverage

## Theory of Change
If we deploy mobile health clinics with telemedicine capabilities and train local community health workers, then rural communities will have improved access to preventive and basic healthcare services, resulting in better health outcomes and reduced healthcare disparities.

## Key Interventions
1. **Mobile Health Units**
   - Deploy equipped vans to visit communities weekly
   - Provide basic diagnostics and treatments
   - Connect to specialists via telemedicine

2. **Community Health Workers**
   - Train local residents in basic healthcare
   - Provide health education and prevention
   - Act as liaisons with healthcare system

## Expected Outcomes
- 50% increase in healthcare access within 2 years
- 30% reduction in preventable disease rates
- Improved health literacy in target communities
- Sustainable local healthcare capacity`)

  const [comments] = useState([
    { id: 1, user: 'Sarah Chen', text: 'Should we add metrics for measuring health literacy improvement?', line: 15 },
    { id: 2, user: 'John Doe', text: 'Great framework! Consider adding partnership with local schools.', line: 8 },
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaborative Editor</h1>
          <p className="text-gray-600">Real-time collaboration on Healthcare Access Theory</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-medium ring-2 ring-white`}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
          </div>
          <button className="btn-secondary">
            <Video className="w-4 h-4" />
            Start Call
          </button>
          <button className="btn-primary">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card">
            <div className="border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded">
                  <Edit3 className="w-4 h-4" />
                  Editing
                </button>
                <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Auto-saved 1 minute ago</span>
              </div>
            </div>
            
            <div className="p-6 relative">
              {/* Simulated cursors */}
              {activeUsers.filter(u => u.cursor).map((user) => (
                <div
                  key={user.id}
                  className={`absolute w-4 h-4 ${user.color} transform rotate-45 pointer-events-none animate-pulse`}
                  style={{ left: user.cursor!.x, top: user.cursor!.y }}
                >
                  <span className="absolute -top-6 left-2 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap transform -rotate-45">
                    {user.name}
                  </span>
                </div>
              ))}
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border-0 focus:outline-none resize-none"
                placeholder="Start typing..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </h3>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{comment.user}</span>
                    <span className="text-xs text-gray-500">Line {comment.line}</span>
                  </div>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded">{comment.text}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 text-sm text-accent hover:opacity-80">
              Add comment
            </button>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-3">Document Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Problem Statement</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Root Causes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Theory of Change</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="w-4 h-4 text-yellow-500" />
                <span>Interventions (In Progress)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="w-4 h-4 text-gray-400" />
                <span>Impact Metrics</span>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-3">Version History</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>v12 (current)</span>
                <span className="text-gray-500">Just now</span>
              </div>
              <div className="flex justify-between">
                <span>v11</span>
                <span className="text-gray-500">10 min ago</span>
              </div>
              <div className="flex justify-between">
                <span>v10</span>
                <span className="text-gray-500">1 hour ago</span>
              </div>
            </div>
            <button className="mt-3 text-sm text-accent hover:opacity-80">
              View all versions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
