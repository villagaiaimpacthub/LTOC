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
