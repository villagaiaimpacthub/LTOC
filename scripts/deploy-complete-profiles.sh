#!/bin/bash

echo "🚀 LTOC Platform with Complete User Profiles"
echo "==========================================="
echo ""

# Create deployment directory
echo "Creating platform with complete profiles..."
mkdir -p deploy-complete-profiles
cd deploy-complete-profiles

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ltoc-complete-profiles",
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

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
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
        accent: '#254956',
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

# Create directories
mkdir -p "app/profile/[id]"
mkdir -p app/{dashboard,theories,collaborate,synthesis,review,search,login,signup}
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
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
EOF

# Create Navigation component
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, FileText, Users, Brain, Eye, Search, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
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
              <Sparkles className="w-8 h-8 text-[#254956] mr-2" />
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
                        ? 'border-[#254956] text-gray-900'
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
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 hover:opacity-80">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image 
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} 
                      alt={user.display_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden md:block font-medium">{user.display_name}</span>
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

# Create Dashboard page
cat > app/dashboard/page.tsx << 'EOF'
'use client'
import { TrendingUp, Users, FileText, Award, ArrowRight, Activity, Bell, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Theories Created', value: '12', icon: FileText, trend: '+3 this month' },
    { label: 'Collaborations', value: '48', icon: Users, trend: '+8 this month' },
    { label: 'Impact Score', value: '9.2', icon: TrendingUp, trend: '+0.5 this month' },
    { label: 'Recognition', value: '24', icon: Award, trend: '+5 this month' },
  ]

  const recentActivity = [
    { type: 'collaboration', title: 'New collaboration request', description: 'Dr. Emily Chen wants to collaborate on "Climate Action Framework"', time: '2 hours ago' },
    { type: 'recognition', title: 'New recognition received', description: 'Maria Rodriguez recognized your work on AI Ethics', time: '5 hours ago' },
    { type: 'theory', title: 'Theory approved', description: 'Your theory "Ethical AI Development" was approved', time: '1 day ago' },
  ]

  const recentRecognitions = [
    { from: 'Dr. Emily Chen', message: 'Outstanding work on the AI Ethics framework!', date: '2024-01-15' },
    { from: 'Maria Rodriguez', message: 'Your insights on bias mitigation are game-changing.', date: '2024-01-14' },
  ]

  if (!user) {
    return <div className="p-8 text-center">Please log in to view your dashboard.</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section with Profile Picture */}
        <div className="mb-8 flex items-center gap-4">
          <Link href={`/profile/${user.id}`} className="flex items-center gap-4 hover:opacity-80">
            <div className="w-16 h-16 rounded-full overflow-hidden relative">
              <Image 
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'} 
                alt={user.display_name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.display_name}!</h1>
              <p className="text-[var(--muted)]">Here's what's happening with your theories today.</p>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="profile-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-[#254956]" />
                  <span className="text-sm text-[#254956] font-medium">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-[var(--muted)]">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 profile-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h2>
              <Link href="/activity" className="text-[#254956] hover:opacity-80 text-sm">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="w-10 h-10 rounded-full bg-[#254956]/10 flex items-center justify-center flex-shrink-0">
                    {activity.type === 'collaboration' && <Users className="w-5 h-5 text-[#254956]" />}
                    {activity.type === 'recognition' && <Award className="w-5 h-5 text-[#254956]" />}
                    {activity.type === 'theory' && <FileText className="w-5 h-5 text-[#254956]" />}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{activity.description}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Recognition */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="profile-card p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/theories/new" className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium">Create New Theory</h3>
                  <p className="text-sm text-[var(--muted)]">Start documenting your theory of change</p>
                </Link>
                <Link href={`/profile/${user.id}`} className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium">Update Profile</h3>
                  <p className="text-sm text-[var(--muted)]">Add new experiences or achievements</p>
                </Link>
              </div>
            </div>

            {/* Recent Recognition */}
            <div className="profile-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent Recognition</h2>
                <Link href={`/profile/${user.id}#recognition`} className="text-[#254956] hover:opacity-80 text-sm">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentRecognitions.map((rec, i) => (
                  <div key={i} className="pb-3 border-b last:border-0">
                    <p className="text-sm font-medium">{rec.from}</p>
                    <p className="text-sm text-[var(--muted)]">{rec.message}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                  </div>
                ))}
              </div>
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
  Calendar, MapPin, Globe
} from 'lucide-react'
import Recognition from '@/components/Recognition'
import { mockProfile } from '@/lib/mockData'
import { useAuth } from '@/lib/auth'

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
              <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover" />
            </div>
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.display_name}</h1>
                  <p className="text-lg text-[var(--muted)]">{profile.title}</p>
                  {profile.location && (
                    <p className="flex items-center text-sm text-[var(--muted)] mt-1">
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
              <button className="text-[var(--muted)] hover:text-[#254956]">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <p>{profile.long_bio}</p>
            {profile.highlights && (
              <div className="pt-4">
                <h3 className="font-semibold mb-2">Highlights</h3>
                <ul className="list-disc list-inside space-y-2 text-[var(--muted)]">
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
                    <span key={i} className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm">
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
              <button className="text-[var(--muted)] hover:text-[#254956]">
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="space-y-8">
            {profile.experiences.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
                  {exp.type === 'personal' ? (
                    <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[var(--primary)]" />
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
                  <p className="text-[var(--primary)] font-medium">{exp.organization_name}</p>
                  <p className="text-sm text-[var(--muted)] mb-2">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date} · {exp.duration}
                  </p>
                  <p className="mb-4">{exp.description}</p>
                  {exp.skills && (
                    <div className="flex gap-2 flex-wrap">
                      {exp.skills.map((skill, j) => (
                        <span key={j} className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-sm">
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
                        <p className="text-sm text-[var(--muted)]">{pub.description}</p>
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
                        <p className="text-sm text-[var(--muted)]">{pres.description}</p>
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
                        <p className="text-sm text-[var(--muted)]">{resource.description}</p>
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

# Create Recognition component
cat > components/Recognition.tsx << 'EOF'
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Send, Trash2, Eye, EyeOff, MessageCircle, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { mockRecognitions } from '@/lib/mockData'

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
                      <p className="text-sm text-[var(--muted)]">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(rec.id)}
                      className="p-1 text-[#254956] hover:bg-[#254956]/10 rounded"
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
                    <p className="text-sm text-[var(--muted)]">{format(new Date(rec.date), 'MMM d, yyyy')}</p>
                    <p className="mt-2">{rec.message}</p>
                    
                    {/* Response */}
                    {rec.response && (
                      <div className="mt-3 pl-4 border-l-2 border-[var(--primary)]">
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
                          className="text-sm text-[#254956] hover:opacity-80 flex items-center gap-1"
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
          <p className="text-center text-[var(--muted)] py-8">No recognition yet</p>
        )}
      </div>

      {/* Add Recognition Button/Form */}
      {!isOwnProfile && currentUserId && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#254956] hover:border-[#254956] transition-colors"
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
      duration: '1 yr',
      description: 'Conducted independent research while traveling through Asia and Europe, studying the cultural implications of AI adoption in different societies. Spent 3 months volunteering in the Amazon rainforest with indigenous communities, learning about traditional knowledge systems and their intersection with modern technology. Published "Cultural Perspectives on AI" in the International Journal of AI Ethics.',
      skills: ['Cross-Cultural Research', 'Field Work', 'Writing']
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
      skills: ['Education', 'Curriculum Development', 'Mentoring']
    },
    {
      id: '4',
      role: 'Family Caregiver',
      organization_name: 'Personal Care',
      type: 'personal',
      start_date: 'Mar 2019',
      end_date: 'Dec 2019',
      is_current: false,
      duration: '10 mos',
      description: 'Took a career break to care for a family member with chronic illness. This experience deepened my understanding of healthcare AI applications and patient needs, inspiring my later work on AI accessibility.',
      skills: ['Healthcare', 'Patient Care', 'Empathy']
    },
    {
      id: '5',
      role: 'Senior AI Researcher',
      organization_name: 'AI Research Institute',
      logo: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=100&h=100&fit=crop',
      start_date: 'Jun 2016',
      end_date: 'Feb 2019',
      is_current: false,
      duration: '2 yrs 9 mos',
      description: 'Led research projects in machine learning fairness and algorithmic bias. Published multiple papers in top-tier conferences including NeurIPS, ICML, and FAccT.',
      skills: ['Machine Learning', 'Research', 'Publications']
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
    },
    {
      title: 'Cultural Perspectives on AI: Lessons from Global Communities',
      description: 'International Journal of AI Ethics, 2021',
      link: '#'
    }
  ],
  presentations: [
    {
      title: 'The Future of Ethical AI',
      description: 'TEDx San Francisco, 2023',
      link: '#'
    },
    {
      title: 'Building Trust in AI Systems',
      description: 'AI Conference Keynote, 2022',
      link: '#'
    }
  ],
  resources: [
    {
      title: 'AI Ethics Guidelines',
      description: 'A comprehensive guide to ethical AI development',
      link: '#'
    },
    {
      title: 'Machine Learning Workshop Series',
      description: 'Online course materials and recordings',
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
  },
  {
    id: '4',
    from: {
      id: 'alex-kumar',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    message: 'Sarah mentored me during my PhD and her guidance was invaluable. She\'s not just a brilliant researcher but also an amazing teacher.',
    date: '2024-01-12T14:00:00Z',
    status: 'pending' as const,
    response: null
  }
]
EOF

# Create home page
cat > app/page.tsx << 'EOF'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Living Theory of Change Platform
          </h1>
          <p className="text-xl text-[var(--muted)] mb-8">
            Collaborate, innovate, and create lasting impact
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/profile/sarah-anderson" className="btn-secondary px-6 py-3 rounded-lg">
              View Example Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create placeholder pages
for page in theories collaborate synthesis review search login signup; do
  cat > app/$page/page.tsx << EOF
export default function ${page^}Page() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">${page^}</h1>
      <p className="text-[var(--muted)]">This page is under construction.</p>
    </div>
  )
}
EOF
done

# Install and build
npm install
npm run build

# Deploy to Vercel
npx vercel --prod --yes

echo "🎉 Complete profile deployment finished!"