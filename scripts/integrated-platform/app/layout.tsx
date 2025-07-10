import './globals.css'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/lib/auth'

export const metadata = {
  title: 'LTOC Platform',
  description: 'Living Theory of Change Collaborative Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
