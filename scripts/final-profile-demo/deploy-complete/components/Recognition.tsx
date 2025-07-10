'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Send, Trash2, Eye, EyeOff, MessageCircle, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { mockRecognitions } from '../lib/mockData'

interface RecognitionProps {
  profileId: string
  isOwnProfile: boolean
  currentUserId?: string
}

export default function Recognition({ profileId, isOwnProfile, currentUserId }: RecognitionProps) {
  const [recognitions, setRecognitions] = useState(mockRecognitions)
  const [newMessage, setNewMessage] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const approvedRecognitions = recognitions.filter(r => r.status === 'approved')
  const pendingRecognitions = recognitions.filter(r => r.status === 'pending')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    const newRecognition = {
      id: Date.now().toString(),
      from: {
        id: currentUserId,
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      message: newMessage,
      date: new Date().toISOString(),
      status: 'pending' as const,
      response: null
    }

    setRecognitions([...recognitions, newRecognition])
    setNewMessage('')
    setShowAddForm(false)
  }

  const handleApprove = (id: string) => {
    setRecognitions(recognitions.map(r => 
      r.id === id ? { ...r, status: 'approved' as const } : r
    ))
  }

  const handleDelete = (id: string) => {
    setRecognitions(recognitions.filter(r => r.id !== id))
  }

  const handleHide = (id: string) => {
    setRecognitions(recognitions.map(r => 
      r.id === id ? { ...r, status: 'hidden' as const } : r
    ))
  }

  const handleResponse = (id: string, response: string) => {
    setRecognitions(recognitions.map(r => 
      r.id === id ? { ...r, response } : r
    ))
  }

  return (
    <div>
      {/* Pending Recognitions (only visible to profile owner) */}
      {isOwnProfile && pendingRecognitions.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-3">Pending Approval</h3>
          <div className="space-y-3">
            {pendingRecognitions.map((rec) => (
              <div key={rec.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <Image 
                      src={rec.from.avatar} 
                      alt={rec.from.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{rec.from.name}</p>
                      <p className="text-sm text-muted">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(rec.id)}
                      className="p-1 text-accent hover:bg-accent/10 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="ml-[52px]">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Recognitions */}
      <div className="space-y-4 mb-6">
        {approvedRecognitions.length > 0 ? (
          approvedRecognitions.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                  <Image 
                    src={rec.from.avatar} 
                    alt={rec.from.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-grow">
                    <p className="font-medium">{rec.from.name}</p>
                    <p className="text-sm text-muted">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                    <p className="mt-2">{rec.message}</p>
                    
                    {/* Response */}
                    {rec.response && (
                      <div className="mt-3 pl-4 border-l-2 border-primary">
                        <p className="text-sm font-medium mb-1">Response:</p>
                        <p className="text-sm">{rec.response}</p>
                      </div>
                    )}
                    
                    {/* Response Form */}
                    {isOwnProfile && !rec.response && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            const response = prompt('Write a response:')
                            if (response) handleResponse(rec.id, response)
                          }}
                          className="text-sm text-accent hover:opacity-80 flex items-center gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Respond
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleHide(rec.id)}
                      className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      title="Hide"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted py-8">No recognition yet</p>
        )}
      </div>

      {/* Add Recognition Button/Form */}
      {!isOwnProfile && currentUserId && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-accent hover:border-accent transition-colors"
            >
              Leave a note of recognition
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your recognition for this person's work..."
                className="w-full p-3 border rounded-lg resize-none h-24"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewMessage('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
