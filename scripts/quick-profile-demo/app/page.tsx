'use client'
import Link from 'next/link'
import { ArrowRight, Users, Brain, FileText } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { currentUser } from '@/lib/mockData'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navigation user={currentUser} />

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
            <Link href="/dashboard" className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/profile/sarah-anderson" className="px-6 py-3 rounded-lg border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-2">
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
