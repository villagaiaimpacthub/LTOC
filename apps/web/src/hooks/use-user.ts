'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { User } from '@ltoc/database'

export function useUser() {
  const { supabase, session } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        setUser(data)
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [session, supabase])

  return { user, loading, isAuthenticated: !!session }
}