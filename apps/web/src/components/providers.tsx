'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { SupabaseProvider } from './supabase-provider'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { ToastProvider } from '@/components/ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <NotificationsProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NotificationsProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  )
}