#!/bin/bash

echo "🚀 LTOC Polished Demo Deployment"
echo "================================"
echo ""

# Create deployment directory
echo "Creating polished demo with full UI..."
mkdir -p deploy-polished
cd deploy-polished

# Create package.json with all needed dependencies
cat > package.json << 'EOF'
{
  "name": "ltoc-platform-polished",
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
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0"
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
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
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

# Create directory structure
mkdir -p app/{theories,collaborate,synthesis,review,search,profile,organizations} components lib

# Create globals.css with better styling
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2;
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow;
  }
}
EOF

# Create layout with better structure
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../components/AuthContext'

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
      <body className="bg-gray-50">
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
EOF

# Create mock auth context
cat > components/AuthContext.tsx << 'EOF'
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState({
    id: '1',
    name: 'Demo User',
    email: 'demo@ltoc.org',
    role: 'admin',
    organization: 'Demo Organization'
  })

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# Create enhanced navigation
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, FileText, Users, Brain, Search, Bell, 
  Settings, LogOut, ChevronDown, Sparkles, Eye
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications] = useState(3)
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/theories', label: 'Theories', icon: FileText },
    { href: '/collaborate', label: 'Collaborate', icon: Users },
    { href: '/synthesis', label: 'AI Synthesis', icon: Brain },
    { href: '/review', label: 'Review Queue', icon: Eye },
    { href: '/search', label: 'Search', icon: Search },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Sparkles className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">LTOC Platform</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
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
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0)}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-slide-in">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      {user?.email}
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="inline w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <Link href="/organizations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Users className="inline w-4 h-4 mr-2" />
                      Organizations
                    </Link>
                    <hr className="my-1" />
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut className="inline w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
EOF

# Create enhanced dashboard
cat > app/page.tsx << 'EOF'
'use client'
import Link from 'next/link'
import { 
  TrendingUp, Users, FileText, Clock, 
  ArrowRight, Activity, Sparkles, Eye,
  MessageSquare, Calendar, Brain
} from 'lucide-react'
import { useAuth } from '../components/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  
  const stats = [
    { label: 'Active Theories', value: '24', change: '+3', icon: FileText, color: 'blue' },
    { label: 'Collaborators', value: '156', change: '+12', icon: Users, color: 'green' },
    { label: 'Reviews Pending', value: '8', change: '-2', icon: Eye, color: 'yellow' },
    { label: 'AI Insights', value: '47', change: '+15', icon: Sparkles, color: 'purple' },
  ]
  
  const recentActivities = [
    { type: 'theory', action: 'updated', item: 'Climate Action Framework', user: 'Sarah Chen', time: '2 hours ago' },
    { type: 'review', action: 'approved', item: 'Education Innovation Model', user: 'John Doe', time: '5 hours ago' },
    { type: 'ai', action: 'generated', item: 'Synthesis Report Q4', user: 'AI Assistant', time: '1 day ago' },
    { type: 'collab', action: 'joined', item: 'Healthcare Access Project', user: 'Maria Garcia', time: '2 days ago' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your theories of change
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                Recent Activity
                <Activity className="w-5 h-5 text-gray-400" />
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'theory' ? 'bg-blue-500' :
                      activity.type === 'review' ? 'bg-green-500' :
                      activity.type === 'ai' ? 'bg-purple-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/theories" className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all activity
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              Quick Actions
              <Sparkles className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/theories/new" className="btn-primary justify-center">
                <FileText className="w-4 h-4" />
                New Theory
              </Link>
              <Link href="/synthesis" className="btn-secondary justify-center">
                <Brain className="w-4 h-4" />
                AI Synthesis
              </Link>
              <Link href="/collaborate" className="btn-secondary justify-center">
                <Users className="w-4 h-4" />
                Collaborate
              </Link>
              <Link href="/review" className="btn-secondary justify-center">
                <Eye className="w-4 h-4" />
                Review Queue
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              Upcoming Events
              <Calendar className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium text-sm">Theory Review Meeting</p>
                <p className="text-xs text-gray-500">Today at 2:00 PM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-sm">AI Workshop</p>
                <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3">
                <p className="font-medium text-sm">Quarterly Synthesis</p>
                <p className="text-xs text-gray-500">Friday at 3:00 PM</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              AI Assistant
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get instant help with your theories
            </p>
            <Link href="/chat" className="btn-primary w-full justify-center">
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create theories page with full CRUD mockup
cat > app/theories/page.tsx << 'EOF'
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
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    ? 'bg-blue-600 text-white'
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
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600"
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
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
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
EOF

# Create collaborative editor page
cat > app/collaborate/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { 
  Users, MessageSquare, Video, Share2, Save, 
  Clock, Circle, CheckCircle, Edit3, Eye
} from 'lucide-react'

export default function CollaboratePage() {
  const [activeUsers] = useState([
    { id: 1, name: 'Sarah Chen', color: 'bg-blue-500', cursor: { x: 150, y: 200 } },
    { id: 2, name: 'John Doe', color: 'bg-green-500', cursor: { x: 300, y: 350 } },
    { id: 3, name: 'You', color: 'bg-purple-500', cursor: null },
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
                <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">
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
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-700">
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
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-700">
              View all versions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create AI synthesis page
cat > app/synthesis/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { 
  Brain, FileText, Sparkles, Download, 
  RefreshCw, Settings, ChevronRight
} from 'lucide-react'

export default function SynthesisPage() {
  const [selectedTheories, setSelectedTheories] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [synthesis, setSynthesis] = useState('')
  
  const availableTheories = [
    { id: 1, title: 'Education Innovation Framework', category: 'Education' },
    { id: 2, title: 'Climate Action Roadmap 2030', category: 'Environment' },
    { id: 3, title: 'Healthcare Access Equity Model', category: 'Health' },
    { id: 4, title: 'Economic Empowerment Strategy', category: 'Economy' },
    { id: 5, title: 'Digital Inclusion Initiative', category: 'Technology' },
  ]

  const generateSynthesis = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setSynthesis(`# AI-Generated Synthesis Report

## Executive Summary
Based on the analysis of ${selectedTheories.length} theories of change, several cross-cutting themes emerge that highlight the interconnected nature of systems change initiatives.

## Common Patterns Identified

### 1. Community-Centered Approaches
All selected theories emphasize the importance of community engagement and local ownership. This pattern suggests that sustainable change requires:
- Active participation from beneficiaries
- Local capacity building
- Cultural sensitivity and adaptation

### 2. Technology as an Enabler
Technology appears as a recurring enabler across theories:
- Digital platforms for education access
- Data systems for healthcare delivery
- Mobile solutions for financial inclusion

### 3. Multi-Stakeholder Collaboration
Success factors consistently include:
- Public-private partnerships
- Cross-sector collaboration
- Coordinated funding strategies

## Synthesis of Strategies

### Integrated Intervention Framework
By combining insights from the selected theories, an integrated approach emerges:

1. **Foundation Layer**: Community engagement and trust building
2. **Infrastructure Layer**: Technology and physical systems
3. **Service Layer**: Delivery of interventions
4. **Sustainability Layer**: Local capacity and funding models

## Recommended Actions

1. **Create Cross-Theory Working Groups**
   - Share learnings and best practices
   - Identify collaboration opportunities
   - Develop integrated metrics

2. **Develop Unified Impact Measurement**
   - Common indicators across theories
   - Shared data collection methods
   - Regular synthesis reports

3. **Resource Optimization**
   - Identify shared infrastructure needs
   - Pool funding for common elements
   - Coordinate implementation timelines

## Conclusion
The synthesis reveals significant opportunities for leveraging synergies across different theories of change. By adopting an integrated systems approach, organizations can amplify their impact and create more sustainable outcomes.`)
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Synthesis Generator</h1>
        <p className="text-gray-600">Generate insights by synthesizing multiple theories of change</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Select Theories</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose theories to include in the synthesis
            </p>
            
            <div className="space-y-2">
              {availableTheories.map((theory) => (
                <label
                  key={theory.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTheories.includes(theory.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTheories([...selectedTheories, theory.id])
                      } else {
                        setSelectedTheories(selectedTheories.filter(id => id !== theory.id))
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{theory.title}</p>
                    <p className="text-xs text-gray-500">{theory.category}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={generateSynthesis}
                disabled={selectedTheories.length < 2 || isGenerating}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Synthesis
                  </>
                )}
              </button>
              
              <button className="w-full btn-secondary justify-center">
                <Settings className="w-4 h-4" />
                Advanced Options
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Synthesis Result</h2>
              {synthesis && (
                <button className="btn-secondary">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
            
            <div className="p-6">
              {synthesis ? (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: synthesis
                      .split('\n')
                      .map(line => {
                        if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold mb-4">${line.slice(2)}</h1>`
                        if (line.startsWith('## ')) return `<h2 class="text-xl font-semibold mt-6 mb-3">${line.slice(3)}</h2>`
                        if (line.startsWith('### ')) return `<h3 class="text-lg font-medium mt-4 mb-2">${line.slice(4)}</h3>`
                        if (line.startsWith('- ')) return `<li class="ml-6">${line.slice(2)}</li>`
                        if (line.startsWith('1. ')) return `<li class="ml-6 list-decimal"><strong>${line.slice(3).split(':')[0]}</strong>:${line.slice(3).split(':').slice(1).join(':')}</li>`
                        if (line.trim() === '') return '<br/>'
                        return `<p class="mb-3">${line}</p>`
                      })
                      .join('\n')
                  }} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No synthesis generated yet</h3>
                  <p className="text-gray-600">
                    Select at least 2 theories and click "Generate Synthesis" to create an AI-powered analysis
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {synthesis && (
            <div className="mt-6 card p-6">
              <h3 className="font-semibold mb-4">Synthesis Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600">Strategy Overlap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-gray-600">Common Themes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-gray-600">Action Items</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
EOF

# Create review queue page
cat > app/review/page.tsx << 'EOF'
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
                    ? 'border-blue-500 text-blue-600'
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
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
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
                      <button className="ml-auto text-blue-600 hover:text-blue-700">
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
EOF

# Create search page
cat > app/search/page.tsx << 'EOF'
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
            className="pl-12 pr-4 py-4 w-full text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <FileText className="w-5 h-5 text-blue-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    )}
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {result.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{result.date}</span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 text-blue-600 hover:text-blue-700 cursor-pointer">
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
EOF

# Deploy
echo ""
echo "Deploying polished demo to Vercel..."
npx vercel --prod --yes

cd ..
rm -rf deploy-polished

echo ""
echo "🎉 Polished demo deployment complete!"