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
