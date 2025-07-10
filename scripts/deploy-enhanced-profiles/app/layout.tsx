import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'LTOC Platform',
  description: 'Living Theory of Change Collaborative Platform',
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
