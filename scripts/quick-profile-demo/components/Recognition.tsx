'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, MoreVertical, Trash2, Eye, EyeOff, Check, X } from 'lucide-react'
import { Recognition as RecognitionType } from '@/lib/mockData'

interface RecognitionProps {
  recognitions: RecognitionType[]
  isOwner: boolean
  profileId: string
}

export default function Recognition({ recognitions, isOwner, profileId }: RecognitionProps) {
  const [showNewRecognition, setShowNewRecognition] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [showResponseInput, setShowResponseInput] = useState<string | null>(null)
  
  const handleSubmitRecognition = () => {
    // In a real app, this would send to an API
    console.log('New recognition:', newMessage)
    setNewMessage('')
    setShowNewRecognition(false)
  }
  
  const handleResponse = (recognitionId: string) => {
    // In a real app, this would send to an API
    console.log('Response to', recognitionId, ':', responses[recognitionId])
    setShowResponseInput(null)
    setResponses(prev => ({ ...prev, [recognitionId]: '' }))
  }
  
  const handleAction = (action: string, recognitionId: string) => {
    // In a real app, this would send to an API
    console.log(action, recognitionId)
  }
  
  return (
    <div className="profile-card p-6 md:p-8" id="recognition">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Recognition
        </h2>
        {!isOwner && (
          <button 
            onClick={() => setShowNewRecognition(!showNewRecognition)}
            className="btn-primary px-4 py-2 rounded-lg text-sm"
          >
            Leave Recognition
          </button>
        )}
      </div>
      
      {showNewRecognition && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your experience working with this person..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button 
              onClick={() => setShowNewRecognition(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmitRecognition}
              className="btn-primary px-4 py-2 rounded-lg text-sm"
              disabled={!newMessage.trim()}
            >
              Submit
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {recognitions.map((recognition) => (
          <div key={recognition.id} className="border-b pb-6 last:border-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0">
                  <Image 
                    src={recognition.from_user.avatar} 
                    alt={recognition.from_user.name} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{recognition.from_user.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{recognition.from_user.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{recognition.date}</p>
                </div>
              </div>
              
              {isOwner && (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                    <button 
                      onClick={() => handleAction('approve', recognition.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction('hide', recognition.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </button>
                    <button 
                      onClick={() => handleAction('delete', recognition.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-gray-700 mb-4">{recognition.message}</p>
            
            {recognition.response && (
              <div className="ml-12 p-3 bg-gray-50 rounded-lg mb-3">
                <p className="text-sm font-medium mb-1">Response:</p>
                <p className="text-sm text-gray-700">{recognition.response}</p>
              </div>
            )}
            
            {isOwner && !recognition.response && (
              <div className="ml-12">
                {showResponseInput === recognition.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={responses[recognition.id] || ''}
                      onChange={(e) => setResponses(prev => ({ ...prev, [recognition.id]: e.target.value }))}
                      placeholder="Add a response..."
                      className="flex-grow px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      onKeyPress={(e) => e.key === 'Enter' && handleResponse(recognition.id)}
                    />
                    <button 
                      onClick={() => handleResponse(recognition.id)}
                      className="px-3 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90"
                    >
                      Send
                    </button>
                    <button 
                      onClick={() => setShowResponseInput(null)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowResponseInput(recognition.id)}
                    className="text-[var(--accent)] hover:text-[var(--primary)] text-sm flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Respond
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {recognitions.length === 0 && (
        <p className="text-center text-[var(--muted)] py-8">
          No recognition yet. Be the first to leave one!
        </p>
      )}
    </div>
  )
}