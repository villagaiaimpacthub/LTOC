#!/bin/bash

echo "🚀 Quick Profile Demo Deployment"
echo "==============================="
echo ""

# Create deployment directory
mkdir -p quick-profile-demo
cd quick-profile-demo

# Copy from polished demo script
cp ../../deploy-polished-demo.sh ./base.sh 2>/dev/null || true

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ltoc-profile-demo",
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
    "lucide-react": "^0.295.0"
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

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
}
EOF

cat > postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

# Create directories
mkdir -p app/profile
mkdir -p components
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

.social-link {
  color: var(--accent);
  transition: all 0.2s ease;
}

.social-link:hover {
  color: var(--primary);
  transform: translateY(-2px);
}
EOF

# Create layout
cat > app/layout.tsx << 'EOF'
import './globals.css'

export const metadata = {
  title: 'LTOC Platform - User Profiles',
  description: 'Living Theory of Change Platform with Enhanced Profiles',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

# Create profile route directory
mkdir -p "app/profile/[id]"

# Create profile page
cat > "app/profile/[id]/page.tsx" << 'EOF'
'use client'
import Image from 'next/image'
import { 
  UserPlus, Link, Linkedin, Twitter, Github, User, Edit3, 
  Briefcase, PlusCircle, Heart, BookOpen, ExternalLink,
  Home, FileText, Users, Brain, Eye, Search, Sparkles
} from 'lucide-react'

export default function ProfilePage() {
  const profile = {
    display_name: 'Sarah Anderson',
    title: 'AI Research Scientist | Data Ethics Advocate',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    bio: 'Leading research in ethical AI development with a focus on fairness and transparency.',
    long_bio: 'With over a decade of experience in artificial intelligence and machine learning, I specialize in developing ethical AI solutions that prioritize fairness, transparency, and human-centered design.',
    linkedin_url: 'https://linkedin.com/in/sarahanderson',
    twitter_handle: '@sarahai',
    github_url: 'https://github.com/sarahanderson',
    skills: ['Machine Learning', 'AI Ethics', 'Python', 'TensorFlow', 'Research'],
    interests: ['Ethical AI', 'Data Privacy', 'Mentoring', 'Public Speaking'],
  }

  const experiences = [
    {
      role: 'Lead AI Ethics Researcher',
      organization_name: 'Tech Innovation Labs',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop',
      start_date: 'Jan 2022',
      is_current: true,
      description: 'Leading a team of researchers in developing ethical AI frameworks.',
      skills: ['AI Ethics', 'Team Leadership', 'Research']
    },
    {
      role: 'Family Caregiver',
      organization_name: 'Personal Care',
      type: 'personal',
      start_date: 'Mar 2019',
      end_date: 'Dec 2019',
      description: 'Took a career break to care for a family member.',
      skills: ['Healthcare', 'Patient Care']
    }
  ]

  return (
    <>
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-[var(--primary)] mr-2" />
              <h1 className="text-xl font-bold">LTOC Platform</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <FileText className="w-4 h-4" />
                <span>Theories</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Users className="w-4 h-4" />
                <span>Collaborate</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

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
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </button>
                    <button className="btn-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                      <Link className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  </div>
                </div>
                <p className="mb-6">{profile.bio}</p>
                <div className="flex gap-4 flex-wrap">
                  <a href={profile.linkedin_url} className="social-link flex items-center gap-2">
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                  <a href="#" className="social-link flex items-center gap-2">
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                  <a href={profile.github_url} className="social-link flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
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
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience
            </h2>
            <div className="space-y-8">
              {experiences.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden relative">
                    {exp.type === 'personal' ? (
                      <div className="w-full h-full bg-[var(--primary)]/10 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                    ) : (
                      <Image src={exp.logo!} alt={exp.organization_name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{exp.role}</h3>
                    <p className="text-[var(--primary)] font-medium">{exp.organization_name}</p>
                    <p className="text-sm text-[var(--muted)] mb-2">
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                    </p>
                    <p className="mb-4">{exp.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {exp.skills.map((skill, j) => (
                        <span key={j} className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
EOF

# Create home page with link to profile
cat > app/page.tsx << 'EOF'
import Link from 'next/link'
import { ArrowRight, Users, Brain, FileText, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-[var(--primary)] mr-2" />
              <h1 className="text-xl font-bold">LTOC Platform</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Living Theory of Change Platform
          </h1>
          <p className="text-xl text-[var(--muted)] mb-8">
            Collaborate, innovate, and create lasting impact
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/profile/sarah-anderson" className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2">
              View Example Profile
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="profile-card p-6 text-center">
            <Users className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rich User Profiles</h3>
            <p className="text-[var(--muted)]">
              Showcase your experience, skills, and achievements
            </p>
          </div>
          <div className="profile-card p-6 text-center">
            <FileText className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Theory Documentation</h3>
            <p className="text-[var(--muted)]">
              Create and share your theories of change
            </p>
          </div>
          <div className="profile-card p-6 text-center">
            <Brain className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-[var(--muted)]">
              Get intelligent synthesis and recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Install and build
npm install
npm run build

# Deploy
npx vercel --prod --yes

echo "🎉 Profile demo deployed!"