#!/bin/bash

echo "🚀 Creating Fully Functional LTOC Platform"
echo "========================================="
echo ""

# Create deployment directory
mkdir -p functional-platform
cd functional-platform

# Create package.json with all dependencies
cat > package.json << 'EOF'
{
  "name": "ltoc-functional-platform",
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
    "lucide-react": "^0.295.0",
    "date-fns": "^3.0.6",
    "@uiw/react-md-editor": "^4.0.3",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0"
  }
}
EOF

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  transpilePackages: ['@uiw/react-md-editor'],
}
module.exports = nextConfig
EOF

# Create TypeScript config
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
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#B79277',
        secondary: '#406B63',
        accent: '#254956',
        background: '#e8e3dd',
        card: '#ffffff',
        muted: '#949FAB',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

# Create directory structure
mkdir -p app/theories/\\[id\\]/edit
mkdir -p app/theories/new
mkdir -p app/profile/\\[id\\]
mkdir -p app/profile/\\[id\\]/edit
mkdir -p components
mkdir -p lib
mkdir -p public

# Create globals.css
cat > app/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #B79277;
  --secondary: #406B63;
  --accent: #254956;
  --background: #e8e3dd;
  --card: #ffffff;
  --muted: #949FAB;
}

body {
  background-color: var(--background);
  color: #2D2928;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.profile-card {
  background: var(--card);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--secondary);
  color: white;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-accent {
  background-color: var(--accent);
  color: white;
  transition: all 0.2s ease;
}

.btn-accent:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Markdown Editor Styles */
.w-md-editor {
  background-color: var(--card) !important;
  color: inherit !important;
}

.w-md-editor.w-md-editor-dark {
  background-color: var(--card) !important;
}

.w-md-editor-toolbar {
  background-color: var(--card) !important;
  border-bottom: 1px solid #e5e7eb !important;
}
EOF

# Create layout
cat > app/layout.tsx << 'EOF'
import './globals.css'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/lib/auth'
import { DataProvider } from '@/lib/data-context'

export const metadata = {
  title: 'LTOC Platform',
  description: 'Living Theory of Change Collaborative Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DataProvider>
            <Navigation />
            <main>{children}</main>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
EOF

# Create Data Context for managing state
cat > lib/data-context.tsx << 'EOF'
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface Theory {
  id: string
  title: string
  content: string
  status: 'draft' | 'in-review' | 'published'
  author: string
  collaborators: number
  impact: number
  created: string
  updated: string
}

interface DataContextType {
  theories: Theory[]
  addTheory: (theory: Omit<Theory, 'id' | 'created' | 'updated'>) => void
  updateTheory: (id: string, updates: Partial<Theory>) => void
  deleteTheory: (id: string) => void
  getTheory: (id: string) => Theory | undefined
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [theories, setTheories] = useState<Theory[]>([
    {
      id: '1',
      title: 'Education Reform Through Technology',
      content: '# Education Reform Through Technology\n\n## Executive Summary\n\nThis theory of change outlines how technology can be leveraged to transform education systems, making them more accessible, personalized, and effective.\n\n## Problem Statement\n\nTraditional education systems are struggling to meet the diverse needs of modern learners. Key challenges include:\n- One-size-fits-all approach\n- Limited access in rural areas\n- Outdated teaching methods\n- Lack of personalization\n\n## Theory of Change\n\nIf we integrate adaptive learning technologies and provide teacher training, then we can create personalized learning experiences that improve outcomes for all students.\n\n## Implementation Strategy\n\n1. **Phase 1**: Pilot program in 10 schools\n2. **Phase 2**: Scale to 100 schools\n3. **Phase 3**: National rollout\n\n## Expected Outcomes\n\n- 30% improvement in student engagement\n- 25% increase in learning outcomes\n- Reduced education inequality',
      status: 'published',
      author: 'Sarah Anderson',
      collaborators: 12,
      impact: 8.5,
      created: '2024-01-01',
      updated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Climate Action Framework',
      content: '# Climate Action Framework\n\n## Overview\n\nA comprehensive approach to address climate change through community-driven initiatives.\n\n## Key Components\n\n1. Renewable energy adoption\n2. Sustainable transportation\n3. Waste reduction programs\n4. Community education',
      status: 'in-review',
      author: 'Sarah Anderson',
      collaborators: 8,
      impact: 9.2,
      created: '2024-01-05',
      updated: '2024-01-18'
    }
  ])

  const addTheory = (theory: Omit<Theory, 'id' | 'created' | 'updated'>) => {
    const newTheory: Theory = {
      ...theory,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
    setTheories([...theories, newTheory])
  }

  const updateTheory = (id: string, updates: Partial<Theory>) => {
    setTheories(theories.map(theory => 
      theory.id === id 
        ? { ...theory, ...updates, updated: new Date().toISOString() }
        : theory
    ))
  }

  const deleteTheory = (id: string) => {
    setTheories(theories.filter(theory => theory.id !== id))
  }

  const getTheory = (id: string) => {
    return theories.find(theory => theory.id === id)
  }

  return (
    <DataContext.Provider value={{ theories, addTheory, updateTheory, deleteTheory, getTheory }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
EOF

# Create enhanced Navigation
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, Sparkles, LogOut, User, ChevronDown, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/theories', label: 'Theories', icon: FileText },
    { href: '/collaborate', label: 'Collaborate', icon: Users },
    { href: '/synthesis', label: 'AI Synthesis', icon: Brain },
    { href: '/review', label: 'Review', icon: Eye },
    { href: '/search', label: 'Search', icon: Search },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Sparkles className="w-8 h-8 text-accent mr-2" />
              <h1 className="text-xl font-bold">LTOC Platform</h1>
            </Link>
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
                        ? 'border-accent text-gray-900'
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
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:opacity-80 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image 
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} 
                      alt={user.display_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden md:block font-medium">{user.display_name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link 
                      href={`/profile/${user.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      View Profile
                    </Link>
                    <Link 
                      href={`/profile/${user.id}/edit`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
EOF

# Create Theories page with full functionality
cat > app/theories/page.tsx << 'EOF'
'use client'
import { Plus, FileText, Clock, Users, TrendingUp, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useData } from '@/lib/data-context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function TheoriesPage() {
  const { theories, deleteTheory } = useData()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this theory?')) {
      deleteTheory(id)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Theories</h1>
          <Link href="/theories/new" className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Theory
          </Link>
        </div>

        <div className="grid gap-6">
          {theories.map((theory) => (
            <div key={theory.id} className="profile-card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{theory.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated {format(new Date(theory.updated), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {theory.collaborators} collaborators
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Impact: {theory.impact}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theory.status === 'published' ? 'bg-green-100 text-green-700' :
                  theory.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {theory.status.replace('-', ' ')}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/theories/${theory.id}`} className="btn-accent px-3 py-1.5 rounded text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link href={`/theories/${theory.id}/edit`} className="btn-secondary px-3 py-1.5 rounded text-sm flex items-center gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(theory.id)}
                  className="px-3 py-1.5 rounded text-sm flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
EOF

# Create New Theory page
cat > app/theories/new/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useData } from '@/lib/data-context'
import { useAuth } from '@/lib/auth'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function NewTheoryPage() {
  const router = useRouter()
  const { addTheory } = useData()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(`# Theory Title

## Problem Statement

Describe the problem you're addressing...

## Theory of Change

If we... then...

## Implementation Strategy

1. Step 1
2. Step 2
3. Step 3

## Expected Outcomes

- Outcome 1
- Outcome 2
- Outcome 3`)
  const [status, setStatus] = useState<'draft' | 'in-review' | 'published'>('draft')

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    addTheory({
      title,
      content,
      status,
      author: user?.display_name || 'Anonymous',
      collaborators: 1,
      impact: 0
    })

    router.push('/theories')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/theories" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Theories
          </Link>
          <div className="flex gap-3">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="in-review">In Review</option>
              <option value="published">Published</option>
            </select>
            <button 
              onClick={handleSave}
              className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Theory
            </button>
          </div>
        </div>

        <div className="profile-card p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter theory title..."
            className="w-full text-2xl font-bold mb-6 p-2 border-b focus:outline-none focus:border-accent"
          />

          <div className="min-h-[500px]">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview="edit"
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create View Theory page
cat > "app/theories/[id]/page.tsx" << 'EOF'
'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Users, Clock, TrendingUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useData } from '@/lib/data-context'
import { format } from 'date-fns'

export default function ViewTheoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getTheory } = useData()
  const theory = getTheory(params.id)

  if (!theory) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <p>Theory not found</p>
          <Link href="/theories" className="text-accent hover:opacity-80">
            Back to theories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/theories" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Theories
          </Link>
          <Link 
            href={`/theories/${theory.id}/edit`}
            className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Theory
          </Link>
        </div>

        <div className="profile-card p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">{theory.title}</h1>
            <div className="flex items-center gap-6 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated {format(new Date(theory.updated), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {theory.collaborators} collaborators
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Impact: {theory.impact}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                theory.status === 'published' ? 'bg-green-100 text-green-700' :
                theory.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {theory.status.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {theory.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create Edit Theory page
cat > "app/theories/[id]/edit/page.tsx" << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useData } from '@/lib/data-context'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditTheoryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getTheory, updateTheory } = useData()
  const theory = getTheory(params.id)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'in-review' | 'published'>('draft')

  useEffect(() => {
    if (theory) {
      setTitle(theory.title)
      setContent(theory.content)
      setStatus(theory.status)
    }
  }, [theory])

  if (!theory) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <p>Theory not found</p>
          <Link href="/theories" className="text-accent hover:opacity-80">
            Back to theories
          </Link>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    updateTheory(params.id, {
      title,
      content,
      status
    })

    router.push(`/theories/${params.id}`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/theories/${params.id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Cancel
          </Link>
          <div className="flex gap-3">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="in-review">In Review</option>
              <option value="published">Published</option>
            </select>
            <button 
              onClick={handleSave}
              className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="profile-card p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter theory title..."
            className="w-full text-2xl font-bold mb-6 p-2 border-b focus:outline-none focus:border-accent"
          />

          <div className="min-h-[500px]">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview="edit"
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create Edit Profile page
cat > "app/profile/[id]/edit/page.tsx" << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Camera } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  
  const [profile, setProfile] = useState({
    display_name: user?.display_name || '',
    title: 'AI Research Scientist | Data Ethics Advocate',
    bio: 'Leading research in ethical AI development with a focus on fairness and transparency.',
    location: 'San Francisco, CA',
    website: 'https://sarahanderson.ai',
    linkedin_url: 'https://linkedin.com/in/sarahanderson',
    twitter_handle: '@sarahai',
    github_url: 'https://github.com/sarahanderson',
    skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research'],
    interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking']
  })

  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const handleSave = () => {
    if (updateUser) {
      updateUser({ display_name: profile.display_name })
    }
    router.push(`/profile/${params.id}`)
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill] })
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setProfile({ 
      ...profile, 
      skills: profile.skills.filter((_, i) => i !== index) 
    })
  }

  const addInterest = () => {
    if (newInterest.trim()) {
      setProfile({ ...profile, interests: [...profile.interests, newInterest] })
      setNewInterest('')
    }
  }

  const removeInterest = (index: number) => {
    setProfile({ 
      ...profile, 
      interests: profile.interests.filter((_, i) => i !== index) 
    })
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/profile/${params.id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Cancel
          </Link>
          <button 
            onClick={handleSave}
            className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 relative overflow-hidden">
                <img 
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <button className="btn-secondary px-4 py-2 rounded-lg">
                Change Photo
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Professional Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-2 border rounded-lg h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Social Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter</label>
                <input
                  type="text"
                  value={profile.twitter_handle}
                  onChange={(e) => setProfile({ ...profile, twitter_handle: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub</label>
                <input
                  type="url"
                  value={profile.github_url}
                  onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills.map((skill, i) => (
                <span key={i} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {skill}
                  <button onClick={() => removeSkill(i)} className="ml-1 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 p-2 border rounded-lg"
              />
              <button onClick={addSkill} className="btn-secondary px-4 py-2 rounded-lg">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.interests.map((interest, i) => (
                <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {interest}
                  <button onClick={() => removeInterest(i)} className="ml-1 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                placeholder="Add an interest..."
                className="flex-1 p-2 border rounded-lg"
              />
              <button onClick={addInterest} className="btn-secondary px-4 py-2 rounded-lg">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Update Auth context to include updateUser
cat > lib/auth.tsx << 'EOF'
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auto-login for demo
    const demoUser = {
      id: 'sarah-anderson',
      email: 'sarah@example.com',
      display_name: 'Sarah Anderson',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'
    }
    setUser(demoUser)
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const mockUser = {
      id: 'sarah-anderson',
      email,
      display_name: 'Sarah Anderson',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'
    }
    setUser(mockUser)
  }

  const logout = () => {
    setUser(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# Update Dashboard to be functional
cat > app/page.tsx << 'EOF'
'use client'
import { TrendingUp, Users, FileText, Clock, ArrowRight, Activity, Award, Sparkles, Eye, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { useData } from '@/lib/data-context'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()
  const { theories } = useData()

  const stats = [
    { label: 'Active Theories', value: theories.length.toString(), icon: FileText, trend: '+3 this month' },
    { label: 'Collaborators', value: '48', icon: Users, trend: '+8 this month' },
    { label: 'Impact Score', value: '9.2', icon: TrendingUp, trend: '+0.5 this month' },
    { label: 'Recognition', value: '24', icon: Award, trend: '+5 this month' },
  ]

  const recentActivity = [
    { icon: Eye, title: 'Theory reviewed', desc: 'Climate Action Framework approved', time: '2h ago' },
    { icon: Users, title: 'New collaborator', desc: 'Dr. Emily Chen joined your theory', time: '4h ago' },
    { icon: MessageSquare, title: 'New comment', desc: 'Feedback on Education Reform theory', time: '6h ago' },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with Profile */}
        {user && (
          <div className="mb-8">
            <Link href={`/profile/${user.id}`} className="inline-flex items-center gap-4 hover:opacity-80">
              <div className="w-16 h-16 rounded-full overflow-hidden relative">
                <Image 
                  src={user.avatar_url || ''} 
                  alt={user.display_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user.display_name}!</h1>
                <p className="text-muted">Here's what's happening with your theories today.</p>
              </div>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="profile-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-accent" />
                  <span className="text-sm text-accent font-medium">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Recent Theories & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Theories */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Theories
            </h2>
            <div className="space-y-4">
              {theories.slice(0, 3).map((theory) => (
                <div key={theory.id} className="border-b pb-3 last:border-0">
                  <Link href={`/theories/${theory.id}`} className="hover:text-accent">
                    <h3 className="font-medium">{theory.title}</h3>
                    <p className="text-sm text-muted">
                      Updated {format(new Date(theory.updated), 'MMM d, yyyy')}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/theories" className="flex items-center gap-2 text-accent mt-4 hover:opacity-80">
              View all theories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted">{activity.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 profile-card p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/theories/new" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-1">Create New Theory</h3>
              <p className="text-sm text-muted">Start documenting your theory of change</p>
            </Link>
            <Link href="/collaborate" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium mb-1">Join Collaboration</h3>
              <p className="text-sm text-muted">Work with others on shared theories</p>
            </Link>
            {user && (
              <Link href={`/profile/${user.id}`} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Update Profile</h3>
                <p className="text-sm text-muted">Add new experiences or achievements</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create functional Collaborate page
cat > app/collaborate/page.tsx << 'EOF'
'use client'
import { Users, MessageSquare, Edit3, Clock, Plus, Send } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function CollaboratePage() {
  const [content, setContent] = useState(`# Climate Action Framework

## Overview
This theory of change focuses on addressing climate change through community-driven initiatives.

## Key Components
1. Renewable energy adoption
2. Sustainable transportation
3. Waste reduction programs
4. Community education

## Current Focus
Working on implementation strategies for urban areas...`)
  
  const [comments, setComments] = useState([
    { id: '1', author: 'Emily Chen', content: 'Great progress on section 2!', time: '10 min ago' },
    { id: '2', author: 'John Doe', content: 'Should we include rural areas in the scope?', time: '1 hour ago' }
  ])
  
  const [newComment, setNewComment] = useState('')

  const collaborators = [
    { name: 'Dr. Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'online' },
    { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', status: 'offline' },
    { name: 'Maria Rodriguez', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100', status: 'online' },
  ]

  const addComment = () => {
    if (newComment.trim()) {
      setComments([
        { id: Date.now().toString(), author: 'Sarah Anderson', content: newComment, time: 'Just now' },
        ...comments
      ])
      setNewComment('')
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Collaborate on Theory</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="profile-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Climate Action Framework</h2>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Clock className="w-4 h-4" />
                  Last edited 5 min ago
                </div>
              </div>
              
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                preview="live"
                height={400}
              />
              
              <div className="mt-4 flex justify-between">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Edit3 className="w-4 h-4" />
                  Auto-saving...
                </div>
                <button className="btn-primary px-4 py-2 rounded-lg">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborators */}
            <div className="profile-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaborators ({collaborators.length})
              </h3>
              <div className="space-y-3">
                {collaborators.map((collab, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative">
                      <img src={collab.avatar} alt={collab.name} className="w-8 h-8 rounded-full" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        collab.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <span className="text-sm">{collab.name}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-accent text-sm hover:opacity-80 flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Invite collaborator
              </button>
            </div>

            {/* Comments */}
            <div className="profile-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({comments.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <p className="font-medium">{comment.author}</p>
                    <p className="text-muted">{comment.content}</p>
                    <p className="text-xs text-muted mt-1">{comment.time}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  placeholder="Add comment..."
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button onClick={addComment} className="btn-accent p-2 rounded">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Install dependencies and build
echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Deploying to Vercel..."
npx vercel --prod --yes

echo "🎉 Fully functional platform deployment complete!"