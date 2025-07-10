import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LTOC Platform',
  description: 'Living Theory of Change - Collaborative Knowledge Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
