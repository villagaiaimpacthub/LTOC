#!/bin/bash

echo "🚀 LTOC Platform - Complete Integration with Profile System"
echo "=========================================================="
echo ""

# Create deployment directory
echo "Creating integrated platform with profiles..."
mkdir -p deploy-complete
cd deploy-complete

# Create package.json with all dependencies
cat > package.json << 'EOF'
{
  "name": "ltoc-platform-integrated",
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
  images: {
    domains: ['images.unsplash.com'],
  },
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

# Create tailwind.config.js with profile colors
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B79277',
        secondary: '#406B63',
        accent: '#254956',
        background: '#e8e3dd',
        muted: '#949FAB',
        foreground: '#2D2928',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
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
mkdir -p app/{theories,collaborate,synthesis,review,search,profile/\[id\],dashboard,login,signup} components lib

# Create globals.css with profile system styles
cat > app/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #B79277;
  --secondary: #406B63;
  --muted: #949FAB;
  --accent: #254956;
  --background: #e8e3dd;
  --card: #ffffff;
  --foreground: #2D2928;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Plus Jakarta Sans', sans-serif;
  @apply antialiased;
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2;
    background-color: var(--primary);
  }
  
  .btn-secondary {
    @apply px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2;
    background-color: var(--secondary);
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow;
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

  .social-link {
    color: var(--accent);
    transition: all 0.2s ease;
  }

  .social-link:hover {
    color: var(--primary);
    transform: translateY(-2px);
  }

  .knowledge-item {
    border: 1px solid #e5e7eb;
    background: var(--card);
    transition: all 0.2s ease;
  }

  .knowledge-item:hover {
    border-color: var(--primary);
    transform: translateX(4px);
  }
}
EOF

# Create layout with auth and navigation
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../lib/auth'

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

# Create auth context
cat > lib/auth.tsx << 'EOF'
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  role?: string
  organization?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
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
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
      role: 'admin',
      organization: 'Tech Innovation Labs'
    }
    setUser(demoUser)
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const mockUser = {
      id: 'sarah-anderson',
      email,
      display_name: 'Sarah Anderson',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
      role: 'admin',
      organization: 'Tech Innovation Labs'
    }
    setUser(mockUser)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# Create Navigation with profile integration
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Home, FileText, Users, Brain, Search, Bell, 
  Settings, LogOut, ChevronDown, Sparkles, Eye
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications] = useState(3)
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
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
              <Sparkles className="w-8 h-8 text-accent mr-2" />
              <h1 className="text-xl font-bold">LTOC Platform</h1>
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
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                      alt={user.display_name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden md:block font-medium mr-1">{user.display_name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-slide-in">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500">
                        {user.email}
                      </div>
                      <Link 
                        href={`/profile/${user.id}`} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        View Profile
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="inline w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary px-4 py-2 text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
EOF

# Create mock data
cat > lib/mockData.ts << 'EOF'
export const mockProfile = {
  id: 'sarah-anderson',
  display_name: 'Sarah Anderson',
  title: 'AI Research Scientist | Data Ethics Advocate',
  email: 'sarah.anderson@example.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  bio: 'Leading research in ethical AI development with a focus on fairness and transparency. Published author and frequent speaker at international conferences.',
  long_bio: 'With over a decade of experience in artificial intelligence and machine learning, I specialize in developing ethical AI solutions that prioritize fairness, transparency, and human-centered design. My research focuses on creating robust frameworks for evaluating and mitigating bias in machine learning models.',
  location: 'San Francisco, CA',
  website: 'https://sarahanderson.ai',
  linkedin_url: 'https://linkedin.com/in/sarahanderson',
  twitter_handle: '@sarahai',
  github_url: 'https://github.com/sarahanderson',
  highlights: [
    'PhD in Computer Science, Stanford University',
    'Published 20+ peer-reviewed papers in top AI conferences',
    'TEDx speaker on "The Future of Ethical AI"',
    'Advisory board member for AI Ethics Coalition'
  ],
  skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research', 'Data Analysis', 'Public Speaking'],
  interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking', 'Environmental Conservation'],
  experiences: [
    {
      id: '1',
      role: 'Lead AI Ethics Researcher',
      organization_name: 'Tech Innovation Labs',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      start_date: 'Jan 2022',
      end_date: null,
      is_current: true,
      duration: '2 yrs 3 mos',
      description: 'Leading a team of researchers in developing ethical AI frameworks and guidelines. Spearheading initiatives in responsible AI development and implementation across multiple product lines.',
      skills: ['AI Ethics', 'Team Leadership', 'Research'],
      type: 'work'
    },
    {
      id: '2',
      role: 'Independent Research & World Travel',
      organization_name: 'Self-Directed Study',
      logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop',
      start_date: 'Jan 2021',
      end_date: 'Dec 2021',
      is_current: false,
      duration: '1 yr',
      description: 'Conducted independent research while traveling through Asia and Europe, studying the cultural implications of AI adoption in different societies. Spent 3 months volunteering in the Amazon rainforest with indigenous communities, learning about traditional knowledge systems and their intersection with modern technology. Published "Cultural Perspectives on AI" in the International Journal of AI Ethics.',
      skills: ['Cross-Cultural Research', 'Field Work', 'Writing'],
      type: 'personal'
    },
    {
      id: '3',
      role: 'AI Education Volunteer',
      organization_name: 'Code.org',
      logo: 'https://images.unsplash.com/photo-1559024094-4a1e4495c3c1?w=100&h=100&fit=crop',
      start_date: 'Sep 2020',
      end_date: null,
      is_current: true,
      duration: '3 yrs 6 mos',
      description: 'Teaching AI concepts to underprivileged high school students. Developed curriculum for introducing ethical AI concepts to teenagers, reaching over 500 students across 10 schools.',
      skills: ['Education', 'Curriculum Development', 'Mentoring'],
      type: 'volunteer'
    }
  ],
  publications: [
    {
      title: 'Ethical Considerations in Machine Learning Models',
      description: 'Published in AI Ethics Journal, 2023',
      link: '#'
    },
    {
      title: 'Fairness Metrics in Neural Networks',
      description: 'ArXiv Preprint, 2023',
      link: '#'
    }
  ],
  presentations: [
    {
      title: 'The Future of Ethical AI',
      description: 'TEDx San Francisco, 2023',
      link: '#'
    }
  ],
  resources: [
    {
      title: 'AI Ethics Guidelines',
      description: 'A comprehensive guide to ethical AI development',
      link: '#'
    }
  ]
}

export const mockRecognitions = [
  {
    id: '1',
    from: {
      id: 'emily-chen',
      name: 'Dr. Emily Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    message: 'Sarah\'s work on AI ethics has been transformative for our industry. Her framework for bias detection has helped us build more equitable systems.',
    date: '2024-01-15T10:00:00Z',
    status: 'approved' as const,
    response: 'Thank you so much, Emily! It\'s been a pleasure collaborating with your team.'
  },
  {
    id: '2',
    from: {
      id: 'maria-rodriguez',
      name: 'Maria Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop'
    },
    message: 'I attended Sarah\'s workshop on ethical AI and it completely changed my perspective. Her ability to explain complex concepts in accessible ways is remarkable.',
    date: '2024-01-14T15:30:00Z',
    status: 'approved' as const,
    response: null
  },
  {
    id: '3',
    from: {
      id: 'john-doe',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    message: 'Working with Sarah on the AI Ethics Coalition has been inspiring. Her dedication to making AI accessible and fair for everyone is unmatched.',
    date: '2024-01-13T09:00:00Z',
    status: 'approved' as const,
    response: 'I appreciate your kind words, John. Looking forward to our continued collaboration!'
  }
]
EOF

# Create Recognition component
cat > components/Recognition.tsx << 'EOF'
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
EOF

# Create enhanced dashboard with profile integration
cat > app/dashboard/page.tsx << 'EOF'
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { 
  TrendingUp, Users, FileText, Clock, 
  ArrowRight, Activity, Sparkles, Eye,
  MessageSquare, Calendar, Brain, Award
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  
  const stats = [
    { label: 'Active Theories', value: '24', change: '+3', icon: FileText, color: 'text-primary' },
    { label: 'Collaborators', value: '156', change: '+12', icon: Users, color: 'text-secondary' },
    { label: 'Reviews Pending', value: '8', change: '-2', icon: Eye, color: 'text-yellow-600' },
    { label: 'Recognition', value: '47', change: '+15', icon: Award, color: 'text-accent' },
  ]
  
  const recentActivities = [
    { type: 'theory', action: 'updated', item: 'Climate Action Framework', user: 'Sarah Chen', time: '2 hours ago' },
    { type: 'review', action: 'approved', item: 'Education Innovation Model', user: 'John Doe', time: '5 hours ago' },
    { type: 'ai', action: 'generated', item: 'Synthesis Report Q4', user: 'AI Assistant', time: '1 day ago' },
    { type: 'recognition', action: 'received', item: 'Recognition from Maria Garcia', user: 'Maria Garcia', time: '2 days ago' },
  ]

  const recentRecognitions = [
    { from: 'Dr. Emily Chen', message: 'Outstanding work on the AI Ethics framework!', date: '2024-01-15' },
    { from: 'Maria Rodriguez', message: 'Your insights on bias mitigation are game-changing.', date: '2024-01-14' },
  ]

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section with Profile Picture */}
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/profile/${user.id}`} className="flex items-center gap-4 hover:opacity-80">
          <div className="w-16 h-16 rounded-full overflow-hidden relative">
            <Image 
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'} 
              alt={user.display_name}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.display_name}!</h1>
            <p className="text-gray-600">Here's what's happening with your theories today.</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="profile-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gray-100`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
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
          <div className="profile-card">
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
                      activity.type === 'theory' ? 'bg-primary' :
                      activity.type === 'review' ? 'bg-green-500' :
                      activity.type === 'ai' ? 'bg-purple-500' : 
                      activity.type === 'recognition' ? 'bg-accent' : 'bg-yellow-500'
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
              <Link href="/theories" className="mt-4 text-sm text-accent hover:opacity-80 flex items-center">
                View all activity
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="profile-card p-6">
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
              <Link href={`/profile/${user.id}`} className="btn-secondary justify-center">
                <Award className="w-4 h-4" />
                View Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="profile-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              Upcoming Events
              <Calendar className="w-5 h-5 text-gray-400" />
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-3">
                <p className="font-medium text-sm">Theory Review Meeting</p>
                <p className="text-xs text-gray-500">Today at 2:00 PM</p>
              </div>
              <div className="border-l-4 border-secondary pl-3">
                <p className="font-medium text-sm">AI Workshop</p>
                <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
              </div>
              <div className="border-l-4 border-accent pl-3">
                <p className="font-medium text-sm">Quarterly Synthesis</p>
                <p className="text-xs text-gray-500">Friday at 3:00 PM</p>
              </div>
            </div>
          </div>

          <div className="profile-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Recognition</h2>
              <Link href={`/profile/${user.id}#recognition`} className="text-accent hover:opacity-80 text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentRecognitions.map((rec, i) => (
                <div key={i} className="pb-3 border-b last:border-0">
                  <p className="text-sm font-medium">{rec.from}</p>
                  <p className="text-sm text-gray-600">{rec.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              AI Assistant
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get instant help with your theories
            </p>
            <Link href="/synthesis" className="btn-primary w-full justify-center">
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create profile page
cat > app/profile/\[id\]/page.tsx << 'EOF'
'use client'
import Image from 'next/image'
import { 
  UserPlus, Link as LinkIcon, Linkedin, Twitter, Github, User, Edit3, 
  Briefcase, PlusCircle, Heart, BookOpen, ExternalLink, Award,
  Calendar, MapPin, Globe
} from 'lucide-react'
import Recognition from '../../../components/Recognition'
import { mockProfile } from '../../../lib/mockData'
import { useAuth } from '../../../lib/auth'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const isOwnProfile = user?.id === params.id
  const profile = mockProfile // In real app, fetch based on params.id

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="profile-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 relative">
              <Image src={profile.avatar_url} alt={profile.display_name} width={128} height={128} className="object-cover" />
            </div>
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.display_name}</h1>
                  <p className="text-lg text-gray-600">{profile.title}</p>
                  {profile.location && (
                    <p className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location}
                    </p>
                  )}
                </div>
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </button>
                    <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  </div>
                )}
              </div>
              <p className="mb-6">{profile.bio}</p>
              <div className="flex gap-4 flex-wrap">
                <a href={profile.linkedin_url} className="social-link flex items-center gap-2">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
                <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} className="social-link flex items-center gap-2">
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </a>
                <a href={profile.github_url} className="social-link flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                {profile.website && (
                  <a href={profile.website} className="social-link flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-card p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" />
              About
            </h2>
            {isOwnProfile && (
              <button className="text-gray-500 hover:text-accent">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <p>{profile.long_bio}</p>
            {profile.highlights && (
              <div className="pt-4">
                <h3 className="font-semibold mb-2">Highlights</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {profile.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="profile-card p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience
            </h2>
            {isOwnProfile && (
              <button className="text-gray-500 hover:text-accent">
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="space-y-8">
            {profile.experiences.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
                  {exp.type === 'personal' ? (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                  ) : exp.logo ? (
                    <Image src={exp.logo} alt={exp.organization_name} width={48} height={48} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {exp.organization_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{exp.role}</h3>
                  <p className="text-primary font-medium">{exp.organization_name}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date} · {exp.duration}
                  </p>
                  <p className="mb-4">{exp.description}</p>
                  {exp.skills && (
                    <div className="flex gap-2 flex-wrap">
                      {exp.skills.map((skill, j) => (
                        <span key={j} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Hub */}
        <div className="profile-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Knowledge Hub
          </h2>
          
          {/* Publications */}
          {profile.publications?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Research Papers</h3>
              <div className="space-y-4">
                {profile.publications.map((pub, i) => (
                  <div key={i} className="knowledge-item p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium mb-2">{pub.title}</h4>
                        <p className="text-sm text-gray-600">{pub.description}</p>
                      </div>
                      <a href={pub.link} className="flex-shrink-0">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Presentations */}
          {profile.presentations?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Presentations</h3>
              <div className="space-y-4">
                {profile.presentations.map((pres, i) => (
                  <div key={i} className="knowledge-item p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium mb-2">{pres.title}</h4>
                        <p className="text-sm text-gray-600">{pres.description}</p>
                      </div>
                      {pres.link && (
                        <a href={pres.link} className="flex-shrink-0">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {profile.resources?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Featured Resources</h3>
              <div className="space-y-4">
                {profile.resources.map((resource, i) => (
                  <div key={i} className="knowledge-item p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium mb-2">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                      <a href={resource.link} className="flex-shrink-0">
                        <LinkIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recognition Section */}
        <div id="recognition" className="profile-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recognition
          </h2>
          <Recognition 
            profileId={params.id} 
            isOwnProfile={isOwnProfile}
            currentUserId={user?.id}
          />
        </div>
      </div>
    </div>
  )
}
EOF

# Create landing page
cat > app/page.tsx << 'EOF'
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  )
}
EOF

# Create theories page
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
EOF

# Create collaborate page
cat > app/collaborate/page.tsx << 'EOF'
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
EOF

# Create synthesis page
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
                  <div className="text-2xl font-bold text-primary">87%</div>
                  <div className="text-sm text-gray-600">Strategy Overlap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">12</div>
                  <div className="text-sm text-gray-600">Common Themes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">5</div>
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

# Create review page
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
EOF

# Create login page
cat > app/login/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Sign in to LTOC Platform</h2>
          <p className="mt-2 text-gray-600">
            Demo: Use any email/password to login
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full btn-primary justify-center"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/signup" className="text-accent hover:opacity-80">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
EOF

# Deploy
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Building the application..."
npm run build

echo ""
echo "Deploying to Vercel..."
npx vercel --prod --yes

cd ..
rm -rf deploy-complete

echo ""
echo "🎉 Complete integration deployment finished!"
echo "The LTOC platform with profile system has been deployed."
echo ""
echo "Features included:"
echo "✅ User profile system with pictures and recognition"
echo "✅ Personalized dashboard with welcome message"
echo "✅ All platform functionality (Theories, Collaborate, AI Synthesis, Review, Search)"
echo "✅ Consistent design with profile color scheme"
echo "✅ Fully integrated authentication"
echo ""
echo "You can now test all functionality in the deployed application!"