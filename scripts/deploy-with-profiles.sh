#!/bin/bash

echo "🚀 LTOC Platform with User Profiles"
echo "==================================="
echo ""

# Copy the polished demo setup
cp -r /mnt/c/Users/julia/DEV/LTOC/scripts/deploy-polished.sh /tmp/deploy-profiles-base.sh

# Create deployment directory
echo "Creating platform with user profiles..."
mkdir -p deploy-profiles
cd deploy-profiles

# Copy base files from polished demo
cp ../deploy-polished/package.json .
cp ../deploy-polished/next.config.js .
cp ../deploy-polished/postcss.config.js .
cp ../deploy-polished/tailwind.config.js .
cp ../deploy-polished/tsconfig.json .

# Create directory structure
mkdir -p app/{profile,login,signup} components lib

# Copy base files
cp -r ../deploy-polished/app/globals.css app/
cp -r ../deploy-polished/app/layout.tsx app/
cp -r ../deploy-polished/app/page.tsx app/
cp -r ../deploy-polished/app/theories app/
cp -r ../deploy-polished/app/collaborate app/
cp -r ../deploy-polished/app/synthesis app/
cp -r ../deploy-polished/app/review app/
cp -r ../deploy-polished/app/search app/
cp -r ../deploy-polished/components/* components/

# Update Navigation to include profile
cat > components/Navigation.tsx << 'EOF'
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, FileText, Users, Brain, Search, Bell, 
  Settings, LogOut, ChevronDown, Sparkles, Eye, User
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
                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0) || 'D'}
                    </div>
                  )}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-slide-in">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      {user?.email}
                    </div>
                    <Link 
                      href="/profile/demo-user" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="inline w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                    <Link 
                      href="/profile/demo-user/edit" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="inline w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                    <hr className="my-1" />
                    <Link 
                      href="/login" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LogOut className="inline w-4 h-4 mr-2" />
                      Sign out
                    </Link>
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

# Create Profile Page
cat > app/profile/page.tsx << 'EOF'
'use client'
import { redirect } from 'next/navigation'

export default function ProfileRedirect() {
  redirect('/profile/demo-user')
}
EOF

# Create detailed profile page
mkdir -p app/profile/demo-user
cat > app/profile/demo-user/page.tsx << 'EOF'
'use client'
import { 
  Calendar, MapPin, Globe, Linkedin, Twitter, Github,
  Mail, Users, FileText, Award, Briefcase, Star,
  Edit, UserPlus, Share2, MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false)
  
  const profile = {
    id: 'demo-user',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'Systems Change Practitioner',
    bio: 'Passionate about leveraging technology and collaborative approaches to drive sustainable systems change. Working at the intersection of education, technology, and social innovation.',
    location: 'San Francisco, CA',
    website: 'https://sarahchen.com',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    twitter_handle: '@sarahchen',
    github_handle: 'sarahchen',
    joined_date: '2023-06-15',
    skills: ['Systems Thinking', 'Theory of Change', 'AI/ML', 'Education Innovation', 'Impact Measurement'],
    interests: ['Climate Action', 'EdTech', 'Social Innovation', 'Community Building'],
    stats: {
      theories: 12,
      collaborations: 24,
      contributions: 156,
      followers: 89,
      following: 45
    }
  }

  const experiences = [
    {
      id: 1,
      role: 'Director of Innovation',
      organization: 'EduTech Foundation',
      start_date: '2021-01',
      current: true,
      description: 'Leading innovation initiatives to transform education through technology and systems thinking approaches.'
    },
    {
      id: 2,
      role: 'Senior Consultant',
      organization: 'Impact Partners',
      start_date: '2018-03',
      end_date: '2020-12',
      description: 'Advised nonprofits and social enterprises on theory of change development and impact measurement.'
    }
  ]

  const achievements = [
    {
      id: 1,
      title: 'Certified Theory of Change Facilitator',
      date: '2022-05',
      category: 'certification',
      issuer: 'International Development Institute'
    },
    {
      id: 2,
      title: 'Innovation in Education Award',
      date: '2023-03',
      category: 'award',
      issuer: 'EdTech Association'
    },
    {
      id: 3,
      title: 'Published: "Systems Thinking in Education"',
      date: '2022-11',
      category: 'publication',
      journal: 'Journal of Educational Innovation'
    }
  ]

  const recentTheories = [
    { id: 1, title: 'AI-Powered Personalized Learning Framework', date: '2 days ago' },
    { id: 2, title: 'Community-Driven Climate Action Model', date: '1 week ago' },
    { id: 3, title: 'Digital Equity in Education Initiative', date: '2 weeks ago' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              <img 
                src={profile.avatar_url} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">{profile.role}</p>
              <p className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Link 
              href="/profile/demo-user/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-700 mb-6">{profile.bio}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-b">
          <div className="text-center">
            <p className="text-2xl font-semibold">{profile.stats.theories}</p>
            <p className="text-sm text-gray-500">Theories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{profile.stats.collaborations}</p>
            <p className="text-sm text-gray-500">Collaborations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{profile.stats.contributions}</p>
            <p className="text-sm text-gray-500">Contributions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{profile.stats.followers}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{profile.stats.following}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4 mt-4">
          <a href={profile.website} className="flex items-center text-gray-600 hover:text-blue-600">
            <Globe className="w-4 h-4 mr-1" />
            Website
          </a>
          <a href={profile.linkedin_url} className="flex items-center text-gray-600 hover:text-blue-600">
            <Linkedin className="w-4 h-4 mr-1" />
            LinkedIn
          </a>
          <a href={`https://twitter.com/${profile.twitter_handle.slice(1)}`} className="flex items-center text-gray-600 hover:text-blue-600">
            <Twitter className="w-4 h-4 mr-1" />
            {profile.twitter_handle}
          </a>
          <a href={`https://github.com/${profile.github_handle}`} className="flex items-center text-gray-600 hover:text-blue-600">
            <Github className="w-4 h-4 mr-1" />
            GitHub
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills & Interests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Experience
            </h3>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-gray-200 pl-4">
                  <h4 className="font-medium">{exp.role}</h4>
                  <p className="text-sm text-gray-600">{exp.organization}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.start_date).getFullYear()} - 
                    {exp.current ? ' Present' : ` ${new Date(exp.end_date).getFullYear()}`}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">
                      {achievement.issuer || achievement.journal}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(achievement.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Theories */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Recent Theories
            </h3>
            <div className="space-y-3">
              {recentTheories.map((theory) => (
                <Link 
                  key={theory.id}
                  href={`/theories/${theory.id}`}
                  className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                >
                  <p className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    {theory.title}
                  </p>
                  <p className="text-xs text-gray-500">{theory.date}</p>
                </Link>
              ))}
            </div>
            <Link 
              href="/theories?author=sarah-chen"
              className="text-sm text-blue-600 hover:text-blue-700 mt-3 inline-block"
            >
              View all theories →
            </Link>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Member since {new Date(profile.joined_date).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create Edit Profile Page
mkdir -p app/profile/demo-user/edit
cat > app/profile/demo-user/edit/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  User, MapPin, Globe, Linkedin, Twitter, Github,
  Camera, Save, Plus, X, Briefcase, Award, ChevronLeft
} from 'lucide-react'

export default function EditProfilePage() {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah')
  const [skills, setSkills] = useState(['Systems Thinking', 'Theory of Change', 'AI/ML', 'Education Innovation', 'Impact Measurement'])
  const [interests, setInterests] = useState(['Climate Action', 'EdTech', 'Social Innovation', 'Community Building'])
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const handleSave = () => {
    // In real app, this would save to database
    alert('Profile saved successfully!')
    router.push('/profile/demo-user')
  }

  const addSkill = () => {
    if (newSkill && skills.length < 10) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const addInterest = () => {
    if (newInterest && interests.length < 10) {
      setInterests([...interests, newInterest])
      setNewInterest('')
    }
  }

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/profile/demo-user"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600">Update your profile information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium">Profile Picture</h3>
              <p className="text-sm text-gray-500">Upload a photo to personalize your profile</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Sarah Chen"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role/Title</label>
              <input
                type="text"
                defaultValue="Systems Change Practitioner"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue="sarah.chen@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  defaultValue="San Francisco, CA"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              rows={4}
              defaultValue="Passionate about leveraging technology and collaborative approaches to drive sustainable systems change. Working at the intersection of education, technology, and social innovation."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    defaultValue="https://sarahchen.com"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    defaultValue="https://linkedin.com/in/sarahchen"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    defaultValue="@sarahchen"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">GitHub</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    defaultValue="sarahchen"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={addSkill} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-2">Interests</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add an interest"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={addInterest} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">
                Make my profile public (visible to non-registered users)
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link
              href="/profile/demo-user"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
EOF

# Create Login Page
cat > app/login/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, Github, Chrome } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  defaultValue="sarah.chen@example.com"
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  defaultValue="password123"
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-900">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <Github className="h-5 w-5" />
                <span className="ml-2">GitHub</span>
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <Chrome className="h-5 w-5" />
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
EOF

# Create Signup Page
cat > app/signup/page.tsx << 'EOF'
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Building, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      router.push('/profile/demo-user/edit')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Log in
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Organization (Optional)</label>
              <div className="mt-1 relative">
                <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input type="checkbox" required className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
EOF

# Update AuthContext to include avatar
cat > components/AuthContext.tsx << 'EOF'
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState({
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'admin',
    organization: 'EduTech Foundation',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  })

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
EOF

echo ""
echo "Deploying platform with user profiles..."
npx vercel --prod --yes

cd ..
rm -rf deploy-profiles

echo ""
echo "🎉 Platform with user profiles deployed!"