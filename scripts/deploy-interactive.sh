#!/bin/bash

echo "🚀 LTOC Interactive Demo Deployment"
echo "==================================="
echo ""

# Create a standalone Next.js app with interactive features
echo "Creating interactive demo..."

# Create deployment directory
mkdir -p deploy-interactive
cd deploy-interactive

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ltoc-platform-interactive",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "typescript": "^5.3.3",
    "@types/react": "^18.2.45",
    "@types/node": "^20.10.5",
    "lucide-react": "^0.294.0"
  }
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create app directory structure
mkdir -p app/demo app/content app/chat app/admin components

# Create layout
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
import Navigation from '../components/Navigation'

export const metadata: Metadata = {
  title: 'LTOC Platform - Living Theory of Change',
  description: 'Collaborative knowledge platform for systems change',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
EOF

# Create globals.css
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
EOF

# Create Navigation component
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, MessageSquare, Shield, Users, Settings } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/demo', label: 'Demo', icon: FileText },
    { href: '/content', label: 'Content', icon: FileText },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    { href: '/admin', label: 'Admin', icon: Shield },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LTOC Platform</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
EOF

# Create home page
cat > app/page.tsx << 'EOF'
import Link from 'next/link'
import { ArrowRight, Sparkles, Users, FileText, Brain } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Living Theory of Change Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Interactive demo showcasing collaborative knowledge management for systems change
        </p>
        <Link
          href="/demo"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Explore Interactive Demo
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/content" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <FileText className="w-10 h-10 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Content Management</h3>
          <p className="text-gray-600">Create and manage theories of change</p>
        </Link>

        <Link href="/chat" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <Brain className="w-10 h-10 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
          <p className="text-gray-600">Chat with AI about your theories</p>
        </Link>

        <Link href="/demo" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <Sparkles className="w-10 h-10 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Live Editor</h3>
          <p className="text-gray-600">Try the collaborative editor</p>
        </Link>

        <Link href="/admin" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <Users className="w-10 h-10 text-orange-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin Dashboard</h3>
          <p className="text-gray-600">Manage users and content</p>
        </Link>
      </div>
    </div>
  )
}
EOF

# Create interactive demo page
cat > app/demo/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { Save, Download, Share2, Eye, Edit, Users } from 'lucide-react'

export default function DemoPage() {
  const [content, setContent] = useState(`# Theory of Change: Education Innovation

## Problem Statement
Many students lack access to personalized learning experiences that adapt to their individual needs and learning styles.

## Vision
A world where every student has access to adaptive, personalized education that maximizes their potential.

## Key Strategies
1. **AI-Powered Learning Platforms**
   - Develop adaptive learning algorithms
   - Create personalized content recommendations
   - Track and analyze learning patterns

2. **Teacher Empowerment**
   - Provide AI tools for educators
   - Offer professional development
   - Support data-driven instruction

3. **Community Engagement**
   - Involve parents in the learning process
   - Build peer learning networks
   - Foster collaborative problem-solving

## Expected Outcomes
- Improved student engagement and retention
- Better learning outcomes across diverse populations
- More efficient use of educational resources
- Empowered educators with better tools

## Impact Metrics
- Student performance improvements
- Engagement rates
- Teacher satisfaction scores
- Cost per student outcome`)

  const [isEditing, setIsEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Theory Editor</h1>
        <p className="text-gray-600">Try editing the theory of change below. Click any button to see interactions!</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b px-6 py-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition ${
                isEditing 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Editing' : 'Edit'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 bg-white border rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Saving theory... (In real app, this would save to database)')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button
              onClick={() => alert('Sharing theory... (In real app, this would generate a share link)')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button
              onClick={() => alert('Downloading as PDF... (In real app, this would export the document)')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="p-6">
          {showPreview ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: content
                  .split('\n')
                  .map(line => {
                    if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold mb-4">${line.slice(2)}</h1>`
                    if (line.startsWith('## ')) return `<h2 class="text-2xl font-bold mt-6 mb-3">${line.slice(3)}</h2>`
                    if (line.startsWith('### ')) return `<h3 class="text-xl font-semibold mt-4 mb-2">${line.slice(4)}</h3>`
                    if (line.startsWith('- ')) return `<li class="ml-6">${line.slice(2)}</li>`
                    if (line.startsWith('1. ')) return `<li class="ml-6 list-decimal">${line.slice(3)}</li>`
                    if (line.trim() === '') return '<br/>'
                    return `<p class="mb-2">${line}</p>`
                  })
                  .join('\n')
              }} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              readOnly={!isEditing}
              className={`w-full h-96 p-4 font-mono text-sm border rounded-lg ${
                isEditing 
                  ? 'border-blue-500 focus:ring-2 focus:ring-blue-200' 
                  : 'border-gray-300 bg-gray-50'
              }`}
              placeholder="Start typing your theory of change..."
            />
          )}
        </div>

        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>3 collaborators active</span>
          </div>
          <div>
            Last saved: Just now
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Version History</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Current version</span>
              <span className="text-gray-500">Just now</span>
            </li>
            <li className="flex justify-between">
              <span>Added outcomes</span>
              <span className="text-gray-500">2 hours ago</span>
            </li>
            <li className="flex justify-between">
              <span>Initial draft</span>
              <span className="text-gray-500">Yesterday</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">AI Suggestions</h3>
          <ul className="space-y-2 text-sm">
            <li className="p-2 bg-blue-50 rounded">Consider adding timeline</li>
            <li className="p-2 bg-green-50 rounded">Metrics look comprehensive</li>
            <li className="p-2 bg-yellow-50 rounded">Link strategies to outcomes</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Tags & Categories</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Education</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">AI/ML</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Innovation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create content page
cat > app/content/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'

export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const theories = [
    { id: 1, title: 'Education Innovation Theory', author: 'Sarah Chen', updated: '2 hours ago', status: 'Published' },
    { id: 2, title: 'Climate Action Framework', author: 'John Doe', updated: '1 day ago', status: 'Draft' },
    { id: 3, title: 'Healthcare Access Model', author: 'Maria Garcia', updated: '3 days ago', status: 'Review' },
    { id: 4, title: 'Community Development Strategy', author: 'Alex Kumar', updated: '1 week ago', status: 'Published' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
        <p className="text-gray-600">Manage your theories of change</p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search theories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
        <Link
          href="/demo"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Theory
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {theories.map((theory) => (
              <tr key={theory.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href="/demo" className="text-blue-600 hover:text-blue-800 font-medium">
                    {theory.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {theory.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    theory.status === 'Published' ? 'bg-green-100 text-green-800' :
                    theory.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {theory.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {theory.updated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-600 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link href="/demo" className="text-gray-600 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => alert('Delete functionality would be here')}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
EOF

# Create AI chat page
cat > app/chat/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I\'m your AI assistant. I can help you analyze theories of change, suggest improvements, or answer questions about systems thinking.' }
  ])

  const sendMessage = () => {
    if (!message.trim()) return
    
    setMessages([...messages, { role: 'user', content: message }])
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: `I understand you're asking about "${message}". In a real implementation, I would analyze your theory of change and provide relevant insights, suggestions, or answer your questions using AI. For now, try asking about strategies, outcomes, or metrics!`
      }])
    }, 1000)
    
    setMessage('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
        <p className="text-gray-600">Chat with AI about your theories of change</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-md ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about theories of change, strategies, outcomes..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <button className="p-4 bg-white rounded-lg shadow hover:shadow-lg text-left">
          <h3 className="font-semibold mb-1">Analyze Theory</h3>
          <p className="text-sm text-gray-600">Get AI insights on your theory</p>
        </button>
        <button className="p-4 bg-white rounded-lg shadow hover:shadow-lg text-left">
          <h3 className="font-semibold mb-1">Suggest Improvements</h3>
          <p className="text-sm text-gray-600">Improve your strategies</p>
        </button>
        <button className="p-4 bg-white rounded-lg shadow hover:shadow-lg text-left">
          <h3 className="font-semibold mb-1">Generate Metrics</h3>
          <p className="text-sm text-gray-600">Create impact measurements</p>
        </button>
      </div>
    </div>
  )
}
EOF

# Create admin page
cat > app/admin/page.tsx << 'EOF'
'use client'
import { Users, FileText, Activity, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your platform</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold">248</span>
          </div>
          <h3 className="text-gray-600">Total Users</h3>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-10 h-10 text-green-600" />
            <span className="text-2xl font-bold">64</span>
          </div>
          <h3 className="text-gray-600">Theories Created</h3>
          <p className="text-sm text-green-600 mt-1">+8 this week</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-10 h-10 text-purple-600" />
            <span className="text-2xl font-bold">89%</span>
          </div>
          <h3 className="text-gray-600">Engagement Rate</h3>
          <p className="text-sm text-green-600 mt-1">+5% improvement</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-orange-600" />
            <span className="text-2xl font-bold">4.8</span>
          </div>
          <h3 className="text-gray-600">User Satisfaction</h3>
          <p className="text-sm text-gray-600 mt-1">Out of 5.0</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3">Name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-3">Sarah Chen</td>
                <td className="py-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">Admin</span></td>
                <td className="py-3 text-gray-600">2 hours ago</td>
              </tr>
              <tr className="border-t">
                <td className="py-3">John Doe</td>
                <td className="py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">Contributor</span></td>
                <td className="py-3 text-gray-600">5 hours ago</td>
              </tr>
              <tr className="border-t">
                <td className="py-3">Maria Garcia</td>
                <td className="py-3"><span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">Reader</span></td>
                <td className="py-3 text-gray-600">1 day ago</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-gray-800">New theory published: "Education Innovation"</p>
                <p className="text-sm text-gray-600">by Sarah Chen • 2 hours ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-gray-800">User registered: John Doe</p>
                <p className="text-sm text-gray-600">New contributor • 5 hours ago</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-gray-800">AI synthesis generated</p>
                <p className="text-sm text-gray-600">For Climate Action Framework • 1 day ago</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
EOF

echo ""
echo "Deploying interactive demo to Vercel..."
npx vercel --prod --yes

cd ..
rm -rf deploy-interactive

echo ""
echo "🎉 Interactive deployment complete!"