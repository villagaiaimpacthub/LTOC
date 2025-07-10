#!/bin/bash

echo "🚀 Updating Polished Demo with Profile Features"
echo "=============================================="
echo ""

# Go to scripts directory
cd /mnt/c/Users/julia/DEV/LTOC/scripts

# Check if polished demo exists, if not use the deployment from earlier
if [ ! -d "deploy-polished" ]; then
    echo "Creating fresh deployment..."
    mkdir -p integrated-platform
    cd integrated-platform
else
    cd deploy-polished
fi

# Create package.json with all dependencies
cat > package.json << 'EOF'
{
  "name": "ltoc-integrated-platform",
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
    "date-fns": "^3.0.6"
  }
}
EOF

# Create configs
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  }
}
module.exports = nextConfig
EOF

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

cat > postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

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

# Create directory structure
mkdir -p app/profile/\\[id\\]
mkdir -p components
mkdir -p lib

# Create globals.css with profile design
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

.nav-link {
  color: #6b7280;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--accent);
}

.nav-link.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
EOF

# Create layout
cat > app/layout.tsx << 'EOF'
import './globals.css'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/lib/auth'

export const metadata = {
  title: 'LTOC Platform',
  description: 'Living Theory of Change Collaborative Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
EOF

# Create Navigation with profile
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, Sparkles, LogOut, User, ChevronDown } from 'lucide-react'
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
                        : 'border-transparent nav-link hover:border-gray-300'
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

# Create Auth context
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

# Create Dashboard with profile integration
cat > app/page.tsx << 'EOF'
'use client'
import { TrendingUp, Users, FileText, Clock, ArrowRight, Activity, Award, Sparkles, Eye, MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Active Theories', value: '24', icon: FileText, trend: '+12%' },
    { label: 'Collaborators', value: '156', icon: Users, trend: '+8%' },
    { label: 'Impact Score', value: '8.9', icon: TrendingUp, trend: '+15%' },
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

        {/* Activity and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <Link href="/activity" className="flex items-center gap-2 text-accent mt-4 hover:opacity-80">
              View all activity <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="profile-card p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/theories/new" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Create New Theory</h3>
                <p className="text-sm text-muted">Start documenting your theory of change</p>
              </Link>
              <Link href="/collaborate" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-medium mb-1">Join Collaboration</h3>
                <p className="text-sm text-muted">Work with others on shared theories</p>
              </Link>
              {user && (
                <Link href={`/profile/${user.id}`} className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium mb-1">Update Profile</h3>
                  <p className="text-sm text-muted">Add new experiences or achievements</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create Profile page
cat > "app/profile/[id]/page.tsx" << 'EOF'
'use client'
import Image from 'next/image'
import { 
  UserPlus, Link as LinkIcon, Linkedin, Twitter, Github, User, Edit3, 
  Briefcase, PlusCircle, Heart, BookOpen, ExternalLink, Award,
  Calendar, MapPin, Globe, MessageCircle, Send, Trash2, Eye, EyeOff
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const isOwnProfile = user?.id === params.id
  const [recognitions, setRecognitions] = useState([
    { id: '1', from: 'Dr. Emily Chen', message: 'Excellent work on the AI Ethics framework!', date: '2024-01-15', status: 'approved', response: 'Thank you Emily!' },
    { id: '2', from: 'Maria Rodriguez', message: 'Your insights on bias mitigation are transformative.', date: '2024-01-14', status: 'approved', response: null }
  ])
  const [showRecForm, setShowRecForm] = useState(false)
  const [newRec, setNewRec] = useState('')

  const profile = {
    display_name: 'Sarah Anderson',
    title: 'AI Research Scientist | Data Ethics Advocate',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    bio: 'Leading research in ethical AI development with a focus on fairness and transparency.',
    long_bio: 'With over a decade of experience in artificial intelligence and machine learning, I specialize in developing ethical AI solutions that prioritize fairness, transparency, and human-centered design.',
    location: 'San Francisco, CA',
    linkedin_url: 'https://linkedin.com',
    twitter_handle: '@sarahai',
    github_url: 'https://github.com',
    website: 'https://sarahanderson.ai',
    skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research'],
    interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking'],
    experiences: [
      {
        role: 'Lead AI Ethics Researcher',
        organization_name: 'Tech Innovation Labs',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
        start_date: 'Jan 2022',
        is_current: true,
        description: 'Leading ethical AI framework development.',
        skills: ['AI Ethics', 'Team Leadership', 'Research']
      },
      {
        role: 'Independent Research & World Travel',
        organization_name: 'Self-Directed Study',
        logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=100&h=100&fit=crop',
        start_date: 'Jan 2021',
        end_date: 'Dec 2021',
        duration: '1 yr',
        description: 'Conducted research while traveling, including 3 months in the Amazon studying traditional knowledge systems.',
        skills: ['Cross-Cultural Research', 'Field Work']
      },
      {
        role: 'AI Education Volunteer',
        organization_name: 'Code.org',
        start_date: 'Sep 2020',
        is_current: true,
        description: 'Teaching AI to underprivileged students.',
        skills: ['Education', 'Mentoring']
      },
      {
        role: 'Family Caregiver',
        organization_name: 'Personal Care',
        type: 'personal',
        start_date: 'Mar 2019',
        end_date: 'Dec 2019',
        description: 'Career break for family care.',
        skills: ['Healthcare', 'Patient Care']
      },
      {
        role: 'Senior AI Researcher',
        organization_name: 'AI Research Institute',
        start_date: 'Jun 2016',
        end_date: 'Feb 2019',
        description: 'Led ML fairness research projects.',
        skills: ['Machine Learning', 'Research']
      }
    ],
    publications: [
      { title: 'Ethical Considerations in Machine Learning Models', description: 'AI Ethics Journal, 2023' },
      { title: 'Cultural Perspectives on AI', description: 'International Journal of AI Ethics, 2021' }
    ]
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="profile-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 relative">
              <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" />
            </div>
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.display_name}</h1>
                  <p className="text-lg text-muted">{profile.title}</p>
                  <p className="flex items-center text-sm text-muted mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.location}
                  </p>
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
                <a href={profile.linkedin_url} className="flex items-center gap-2 text-accent hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-accent hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </a>
                <a href={profile.github_url} className="flex items-center gap-2 text-accent hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                <a href={profile.website} className="flex items-center gap-2 text-accent hover:text-primary transition-colors">
                  <Globe className="w-5 h-5" />
                  <span>Website</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            About
          </h2>
          <div className="space-y-4">
            <p>{profile.long_bio}</p>
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
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Experience
          </h2>
          <div className="space-y-8">
            {profile.experiences.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
                  {exp.type === 'personal' ? (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                  ) : exp.logo ? (
                    <Image src={exp.logo} alt={exp.organization_name} fill className="object-cover" />
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
                  <p className="text-sm text-muted mb-2">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
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
          <div className="space-y-4">
            {profile.publications.map((pub, i) => (
              <div key={i} className="p-4 border rounded-lg hover:border-primary transition-all hover:translate-x-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{pub.title}</h4>
                    <p className="text-sm text-muted">{pub.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recognition Section */}
        <div className="profile-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recognition
          </h2>
          
          <div className="space-y-4 mb-6">
            {recognitions.filter(r => r.status === 'approved').map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{rec.from}</p>
                    <p className="text-sm text-muted mb-2">{rec.date}</p>
                    <p>{rec.message}</p>
                    {rec.response && (
                      <div className="mt-3 pl-4 border-l-2 border-primary">
                        <p className="text-sm font-medium">Response:</p>
                        <p className="text-sm">{rec.response}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isOwnProfile && (
            <div>
              {!showRecForm ? (
                <button
                  onClick={() => setShowRecForm(true)}
                  className="w-full py-3 border-2 border-dashed border-accent text-accent rounded-lg hover:bg-accent/5"
                >
                  Leave a note of recognition
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={newRec}
                    onChange={(e) => setNewRec(e.target.value)}
                    placeholder="Share your recognition..."
                    className="w-full p-3 border rounded-lg resize-none h-24"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowRecForm(false)} className="px-4 py-2">
                      Cancel
                    </button>
                    <button className="btn-accent px-4 py-2 rounded-lg flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
EOF

# Create other pages with profile-themed design
# Theories page
cat > app/theories/page.tsx << 'EOF'
'use client'
import { Plus, FileText, Clock, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function TheoriesPage() {
  const theories = [
    { id: '1', title: 'Education Reform Through Technology', status: 'Published', collaborators: 12, impact: 8.5, updated: '2 days ago' },
    { id: '2', title: 'Climate Action Framework', status: 'In Review', collaborators: 8, impact: 9.2, updated: '1 week ago' },
    { id: '3', title: 'Healthcare Accessibility Model', status: 'Draft', collaborators: 5, impact: 7.8, updated: '3 weeks ago' },
  ]

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
                <div>
                  <h3 className="text-xl font-semibold mb-2">{theory.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {theory.updated}
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
                  theory.status === 'Published' ? 'bg-green-100 text-green-700' :
                  theory.status === 'In Review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {theory.status}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/theories/${theory.id}`} className="text-accent hover:opacity-80">
                  View Theory →
                </Link>
                <Link href={`/theories/${theory.id}/edit`} className="text-accent hover:opacity-80">
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
EOF

# Collaborate page
cat > app/collaborate/page.tsx << 'EOF'
'use client'
import { Users, MessageSquare, Edit3, Clock } from 'lucide-react'
import { useState } from 'react'

export default function CollaboratePage() {
  const [content, setContent] = useState('# Climate Action Framework\\n\\nThis theory of change focuses on...')
  
  const collaborators = [
    { name: 'Dr. Emily Chen', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', status: 'online' },
    { name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', status: 'offline' },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
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
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
                placeholder="Start writing your theory..."
              />
              <div className="mt-4 flex justify-between">
                <button className="text-accent hover:opacity-80">
                  <Edit3 className="w-5 h-5 inline mr-1" />
                  Markdown Preview
                </button>
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
                Collaborators
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
              <button className="mt-3 text-accent text-sm hover:opacity-80">
                + Invite collaborator
              </button>
            </div>

            {/* Comments */}
            <div className="profile-card p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
              </h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Emily Chen</p>
                  <p className="text-muted">Great progress on section 2!</p>
                  <p className="text-xs text-muted mt-1">10 min ago</p>
                </div>
              </div>
              <button className="mt-3 text-accent text-sm hover:opacity-80">
                Add comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# AI Synthesis page
cat > app/synthesis/page.tsx << 'EOF'
'use client'
import { Brain, Send, Sparkles, FileText } from 'lucide-react'
import { useState } from 'react'

export default function SynthesisPage() {
  const [selectedTheory, setSelectedTheory] = useState('')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I can help you synthesize insights from your theories. Select a theory to get started.' }
  ])

  const theories = [
    'Education Reform Through Technology',
    'Climate Action Framework',
    'Healthcare Accessibility Model'
  ]

  const handleSend = () => {
    if (!question.trim()) return
    setMessages([...messages, 
      { role: 'user', content: question },
      { role: 'ai', content: 'Based on your theory, here are some synthesized insights...' }
    ])
    setQuestion('')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="profile-card p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            AI Theory Synthesis
          </h1>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select a theory to analyze:</label>
            <select 
              value={selectedTheory}
              onChange={(e) => setSelectedTheory(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Choose a theory...</option>
              {theories.map((theory) => (
                <option key={theory} value={theory}>{theory}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-accent text-white' : 'bg-white'
                }`}>
                  {msg.role === 'ai' && <Sparkles className="w-4 h-4 inline mr-1" />}
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your theory..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button onClick={handleSend} className="btn-accent px-4 py-2 rounded-lg">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="profile-card p-6">
          <h2 className="font-semibold mb-3">Suggested Questions:</h2>
          <div className="space-y-2">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              What are the key assumptions in this theory?
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              How can we measure the impact of this approach?
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              What are potential barriers to implementation?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Review page
cat > app/review/page.tsx << 'EOF'
'use client'
import { Eye, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

export default function ReviewPage() {
  const pendingReviews = [
    { id: '1', title: 'Urban Sustainability Initiative', author: 'Maria Rodriguez', submitted: '2 hours ago', priority: 'high' },
    { id: '2', title: 'Digital Literacy Program', author: 'Alex Kumar', submitted: '1 day ago', priority: 'medium' },
    { id: '3', title: 'Community Health Outreach', author: 'Dr. James Wilson', submitted: '3 days ago', priority: 'low' },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Review Queue</h1>
        
        <div className="grid gap-6">
          {pendingReviews.map((review) => (
            <div key={review.id} className="profile-card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{review.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>By {review.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {review.submitted}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  review.priority === 'high' ? 'bg-red-100 text-red-700' :
                  review.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {review.priority} priority
                </span>
              </div>
              
              <div className="mt-4 flex gap-3">
                <button className="btn-accent px-4 py-2 rounded-lg flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Review
                </button>
                <button className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button className="px-4 py-2 rounded-lg border flex items-center gap-2 hover:bg-gray-50">
                  <MessageSquare className="w-4 h-4" />
                  Comment
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

# Search page
cat > app/search/page.tsx << 'EOF'
'use client'
import { Search, Filter, Calendar, Tag, User } from 'lucide-react'
import { useState } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ type: 'all', date: 'all', author: 'all' })
  
  const results = [
    { type: 'theory', title: 'Climate Action Framework', author: 'Sarah Anderson', date: '2024-01-10', tags: ['climate', 'sustainability'] },
    { type: 'collaboration', title: 'Education Reform Discussion', author: 'Dr. Emily Chen', date: '2024-01-08', tags: ['education', 'technology'] },
    { type: 'synthesis', title: 'Healthcare Access Analysis', author: 'Maria Rodriguez', date: '2024-01-05', tags: ['healthcare', 'equity'] },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search</h1>
        
        {/* Search Bar */}
        <div className="profile-card p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search theories, collaborations, and more..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>
          
          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <select className="px-3 py-2 border rounded-lg">
              <option value="all">All Types</option>
              <option value="theory">Theories</option>
              <option value="collaboration">Collaborations</option>
              <option value="synthesis">AI Synthesis</option>
            </select>
            <select className="px-3 py-2 border rounded-lg">
              <option value="all">Any Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select className="px-3 py-2 border rounded-lg">
              <option value="all">All Authors</option>
              <option value="me">My Content</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, i) => (
            <div key={i} className="profile-card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.type === 'theory' ? 'bg-blue-100 text-blue-700' :
                    result.type === 'collaboration' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {result.type}
                  </span>
                  <h3 className="text-lg font-semibold mt-2 mb-1">{result.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {result.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {result.date}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {result.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-accent hover:opacity-80">
                  View →
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

# Install and build
echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Deploying to Vercel..."
npx vercel --prod --yes

echo "🎉 Integrated platform deployment complete!"