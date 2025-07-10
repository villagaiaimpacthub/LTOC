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
