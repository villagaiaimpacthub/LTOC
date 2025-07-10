import './globals.css'

export const metadata = {
  title: 'LTOC Platform - User Profiles',
  description: 'Living Theory of Change Platform with Enhanced Profiles',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
