'use client'

import { useState, useRef, useEffect } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { useUser } from '@/hooks/use-user'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ltoc/ui'
import { AIServiceManager } from '@ltoc/utils'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import type { ChatMessage } from '@ltoc/utils'

export default function ChatPage() {
  const { supabase } = useSupabase()
  const { user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help you understand systems change theory and explore our knowledge base. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // Initialize AI service
      const aiService = AIServiceManager.initFromEnv()
      
      // Get relevant content for context
      const { data: relevantContent } = await supabase
        .from('content')
        .select('id, title, summary')
        .eq('status', 'published')
        .textSearch('title', input, { type: 'websearch' })
        .limit(3)

      // Generate response
      const response = await aiService.chat({
        message: input,
        context: {
          contentIds: relevantContent?.map(c => c.id) || [],
          userRole: user?.role || 'reader',
          preferredDepth: 'detailed'
        },
        history: messages.slice(-10) // Last 10 messages for context
      })

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Log chat usage
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'content_updated',
        p_metadata: { 
          action: 'ai_chat',
          tokens_used: response.metadata.tokensUsed,
          response_time: response.metadata.responseTime
        }
      })

    } catch (err: any) {
      console.error('Error in chat:', err)
      setError(err.message || 'Failed to get response')
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about systems change theory and our knowledge base
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1 min-h-[40px] max-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <p className="text-xs text-destructive mt-2">{error}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Be specific in your questions</p>
              <p>• Ask about particular theories or frameworks</p>
              <p>• Request examples or case studies</p>
              <p>• Ask for connections between concepts</p>
              <p>• Inquire about practical applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Questions</CardTitle>
              <CardDescription>
                Click to try these questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'What are Donella Meadows\' leverage points?',
                'How does systems thinking apply to climate action?',
                'What is the difference between theory of change and logic models?',
                'Can you explain emergence in complex systems?'
              ].map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => setInput(question)}
                  disabled={loading}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}