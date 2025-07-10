import type { Metadata } from 'next'
import './globals.css'
import Navigation from '../components/Navigation'
import { AuthProvider } from '../lib/auth'

export const metadata: Metadata = {
  title: 'LTOC Platform - Living Theory of Change',
  description: 'Collaborative knowledge platform for systems change',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
