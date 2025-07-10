#!/bin/bash

echo "🚀 LTOC Platform with Enhanced User Profiles"
echo "==========================================="
echo ""

# Create deployment directory
echo "Creating platform with enhanced profiles..."
mkdir -p deploy-enhanced-profiles
cd deploy-enhanced-profiles

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ltoc-platform-enhanced",
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
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "date-fns": "^3.0.6"
  }
}
EOF

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'placeholder.supabase.co'],
  }
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

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        background: '#e8e3dd',
        foreground: '#2D2928',
        card: '#ffffff',
        'card-foreground': '#2D2928',
        primary: {
          DEFAULT: '#B79277',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#406B63',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#949FAB',
          foreground: '#2D2928',
        },
        accent: {
          DEFAULT: '#254956',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#8C1352',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create app directory structure
mkdir -p app/profile/\\[id\\]
mkdir -p app/{login,signup,dashboard,theories,collaborate,synthesis,review,search,settings}
mkdir -p components/{profile,ui}
mkdir -p lib
mkdir -p public

# Create globals.css with enhanced profile styles
cat > app/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #e8e3dd;
  --foreground: #2D2928;
  --card: #ffffff;
  --card-foreground: #2D2928;
  --primary: #B79277;
  --primary-foreground: #ffffff;
  --secondary: #406B63;
  --secondary-foreground: #ffffff;
  --muted: #949FAB;
  --muted-foreground: #2D2928;
  --accent: #254956;
  --accent-foreground: #ffffff;
  --destructive: #8C1352;
  --destructive-foreground: #ffffff;
  --border: #2D2928;
  --radius: 0.5rem;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.profile-card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.social-link {
  transition: all 0.2s ease;
  color: var(--accent);
}

.social-link:hover {
  color: var(--primary);
  transform: translateY(-2px);
}

.knowledge-item {
  border: 1px solid var(--border);
  background: var(--card);
  transition: all 0.2s ease;
}

.knowledge-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}

.btn-primary {
  background-color: var(--primary);
  color: var(--primary-foreground);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.list-disc li::marker {
  color: var(--primary);
}
EOF

# Create layout
cat > app/layout.tsx << 'EOF'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'LTOC Platform',
  description: 'Living Theory of Change Collaborative Platform',
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

# Create enhanced profile page
cat > app/profile/\\[id\\]/page.tsx << 'EOF'
'use client'
import { useState, useEffect } from 'react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileAbout from '@/components/profile/ProfileAbout'
import ProfileExperience from '@/components/profile/ProfileExperience'
import ProfileKnowledge from '@/components/profile/ProfileKnowledge'
import { mockProfiles } from '@/lib/mock-data'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundProfile = mockProfiles.find(p => p.id === params.id) || mockProfiles[0]
      setProfile(foundProfile)
      setLoading(false)
    }, 500)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileHeader profile={profile} currentUserId="current-user" />
        <ProfileAbout profile={profile} isOwner={false} />
        <ProfileExperience experiences={profile.experiences} />
        <ProfileKnowledge 
          theories={profile.theories} 
          achievements={profile.achievements} 
        />
      </div>
    </div>
  )
}
EOF

# Create ProfileHeader component
cat > components/profile/ProfileHeader.tsx << 'EOF'
'use client'
import Image from 'next/image'
import { UserPlus, Link, Linkedin, Twitter, Github } from 'lucide-react'
import { useState } from 'react'

interface ProfileHeaderProps {
  profile: any
  currentUserId?: string
}

export default function ProfileHeader({ profile, currentUserId }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const isOwnProfile = currentUserId === profile.id

  return (
    <div className="profile-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 relative">
          <Image 
            src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'} 
            alt={profile.display_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.display_name}</h1>
              <p className="text-lg text-muted-foreground">{profile.title || 'LTOC Member'}</p>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 self-start mt-2 md:mt-0">
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                  <Link className="w-3.5 h-3.5" />
                  Connect
                </button>
              </div>
            )}
          </div>
          <p className="mb-6">{profile.bio}</p>
          <div className="flex gap-4 flex-wrap mb-4">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} className="social-link flex items-center gap-2">
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            )}
            {profile.twitter_handle && (
              <a href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} className="social-link flex items-center gap-2">
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} className="social-link flex items-center gap-2">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create ProfileAbout component
cat > components/profile/ProfileAbout.tsx << 'EOF'
'use client'
import { User, Edit3 } from 'lucide-react'

interface ProfileAboutProps {
  profile: any
  isOwner: boolean
}

export default function ProfileAbout({ profile, isOwner }: ProfileAboutProps) {
  return (
    <div className="profile-card p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5" />
          About
        </h2>
        {isOwner && (
          <button className="text-muted-foreground hover:text-accent">
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        <p>{profile.bio}</p>
        {profile.long_bio && <p>{profile.long_bio}</p>}
        
        {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
          <div className="pt-4 space-y-4">
            {profile.skills?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.interests?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
EOF

# Create ProfileExperience component
cat > components/profile/ProfileExperience.tsx << 'EOF'
'use client'
import { Briefcase, PlusCircle, Heart } from 'lucide-react'
import Image from 'next/image'

interface ProfileExperienceProps {
  experiences: any[]
}

export default function ProfileExperience({ experiences }: ProfileExperienceProps) {
  return (
    <div className="profile-card p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Experience
        </h2>
        <button className="text-muted-foreground hover:text-accent">
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        {experiences.map((exp, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
              {exp.logo ? (
                <Image 
                  src={exp.logo} 
                  alt={exp.organization_name}
                  fill
                  className="object-cover"
                />
              ) : exp.type === 'personal' ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
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
              <p className="text-sm text-muted-foreground mb-2">
                {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
              </p>
              {exp.description && <p className="mb-4">{exp.description}</p>}
              {exp.skills && (
                <div className="flex gap-2 flex-wrap">
                  {exp.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
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
  )
}
EOF

# Create ProfileKnowledge component
cat > components/profile/ProfileKnowledge.tsx << 'EOF'
'use client'
import { BookOpen, ExternalLink, Link } from 'lucide-react'

interface ProfileKnowledgeProps {
  theories: any[]
  achievements: any[]
}

export default function ProfileKnowledge({ theories, achievements }: ProfileKnowledgeProps) {
  return (
    <div className="profile-card p-6 md:p-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Knowledge Hub
      </h2>
      
      {/* Theories */}
      {theories?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Theories</h3>
          <div className="space-y-4">
            {theories.map((theory, index) => (
              <div key={index} className="knowledge-item p-4 rounded-lg">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{theory.title}</h4>
                    <p className="text-sm text-muted-foreground">{theory.description}</p>
                  </div>
                  <a href={`/theories/${theory.id}`} className="flex-shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Achievements & Publications</h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="knowledge-item p-4 rounded-lg">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.link && (
                    <a href={achievement.link} className="flex-shrink-0">
                      <Link className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
EOF

# Create Navigation component
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, User, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
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
            <div className="flex-shrink-0 flex items-center">
              <Sparkles className="w-8 h-8 text-primary mr-2" />
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
                        ? 'border-primary text-gray-900'
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
            {user ? (
              <>
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 hover:text-primary">
                  <User className="w-5 h-5" />
                  <span className="hidden md:block">{user.display_name}</span>
                </Link>
                <button onClick={logout} className="text-gray-500 hover:text-gray-700">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary px-4 py-2 rounded-md text-sm">
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

# Create AuthContext
cat > components/AuthContext.tsx << 'EOF'
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
    // Check for saved user
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    // Mock login
    const mockUser = {
      id: 'current-user',
      email,
      display_name: 'Demo User',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop'
    }
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# Create mock data
cat > lib/mock-data.ts << 'EOF'
export const mockProfiles = [
  {
    id: 'sarah-anderson',
    display_name: 'Sarah Anderson',
    title: 'AI Research Scientist | Data Ethics Advocate',
    email: 'sarah.anderson@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    bio: 'Leading research in ethical AI development with a focus on fairness and transparency. Published author and frequent speaker at international conferences.',
    long_bio: 'With over a decade of experience in artificial intelligence and machine learning, I specialize in developing ethical AI solutions that prioritize fairness, transparency, and human-centered design.',
    location: 'San Francisco, CA',
    website: 'https://sarahanderson.ai',
    linkedin_url: 'https://linkedin.com/in/sarahanderson',
    twitter_handle: '@sarahai',
    github_url: 'https://github.com/sarahanderson',
    skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research'],
    interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking'],
    experiences: [
      {
        id: '1',
        role: 'Lead AI Ethics Researcher',
        organization_name: 'Tech Innovation Labs',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
        start_date: 'Jan 2022',
        end_date: null,
        is_current: true,
        description: 'Leading a team of researchers in developing ethical AI frameworks and guidelines.',
        skills: ['AI Ethics', 'Team Leadership', 'Research']
      },
      {
        id: '2',
        role: 'Independent Research & World Travel',
        organization_name: 'Self-Directed Study',
        logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop',
        start_date: 'Jan 2021',
        end_date: 'Dec 2021',
        is_current: false,
        description: 'Conducted independent research while traveling through Asia and Europe.',
        skills: ['Cross-Cultural Research', 'Publication']
      },
      {
        id: '3',
        role: 'Family Caregiver',
        organization_name: 'Personal Care',
        type: 'personal',
        start_date: 'Mar 2019',
        end_date: 'Dec 2019',
        is_current: false,
        description: 'Took a career break to care for a family member with chronic illness.',
        skills: ['Healthcare', 'Patient Care']
      }
    ],
    theories: [
      {
        id: '1',
        title: 'Ethical Considerations in Machine Learning Models',
        description: 'Published in AI Ethics Journal, 2023'
      },
      {
        id: '2', 
        title: 'Fairness Metrics in Neural Networks',
        description: 'ArXiv Preprint, 2023'
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'AI Ethics Guidelines',
        description: 'A comprehensive guide to ethical AI development',
        link: '#'
      },
      {
        id: '2',
        title: 'Machine Learning Workshop Series',
        description: 'Online course materials and recordings',
        link: '#'
      }
    ]
  }
]
EOF

# Create login page
cat > app/login/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate login
    setTimeout(() => {
      login(email, password)
      router.push('/')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:opacity-80">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-card py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border rounded-md"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border rounded-md"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2 px-4 rounded-md flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
EOF

# Create dashboard page
cat > app/page.tsx << 'EOF'
'use client'
import { TrendingUp, Users, FileText, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Active Theories', value: '24', icon: FileText, trend: '+12%' },
    { label: 'Collaborators', value: '156', icon: Users, trend: '+8%' },
    { label: 'Impact Score', value: '8.9', icon: TrendingUp, trend: '+15%' },
    { label: 'Hours Saved', value: '320', icon: Clock, trend: '+23%' },
  ]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{user ? `, ${user.display_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your theories today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="profile-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New collaboration request</p>
                  <p className="text-sm text-muted-foreground">From Dr. Emily Chen</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theory approved</p>
                  <p className="text-sm text-muted-foreground">Climate Action Framework</p>
                </div>
                <span className="text-xs text-muted-foreground">5h ago</span>
              </div>
            </div>
            <Link href="/theories" className="flex items-center gap-2 text-primary mt-4 hover:opacity-80">
              View all activity <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/theories/new" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Create New Theory</h3>
                <p className="text-sm text-muted-foreground">Start documenting your theory of change</p>
              </Link>
              <Link href={user ? `/profile/${user.id}` : '/login'} className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Update Profile</h3>
                <p className="text-sm text-muted-foreground">Add your latest achievements and experience</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create placeholder pages
for page in theories collaborate synthesis review search settings; do
  cat > app/$page/page.tsx << EOF
export default function ${page^}Page() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">${page^}</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
    </div>
  )
}
EOF
done

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod --yes

echo ""
echo "🎉 Enhanced profile deployment complete!"
echo ""