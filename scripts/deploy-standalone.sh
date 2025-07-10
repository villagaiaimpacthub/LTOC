#!/bin/bash

echo "🚀 LTOC Standalone Deployment"
echo "============================"
echo ""

# Create a standalone Next.js app for deployment
echo "Creating standalone deployment..."

# Create deployment directory
mkdir -p deploy-temp
cd deploy-temp

# Create package.json without workspace dependencies
cat > package.json << 'EOF'
{
  "name": "ltoc-platform-demo",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "typescript": "^5.3.3",
    "@types/react": "^18.2.45",
    "@types/node": "^20.10.5"
  }
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create app directory
mkdir -p app

# Create layout
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
EOF

# Create globals.css
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
EOF

# Create main page
cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Living Theory of Change
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A collaborative knowledge platform for systems change practitioners to build, share, and evolve theories of change together
          </p>
        </header>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-semibold text-green-900 mb-3">
            🎉 Deployment Successful!
          </h2>
          <p className="text-green-800">
            Your LTOC platform demo is now live. This version showcases the platform design and features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Collaborative Editing"
            description="Work together in real-time on theories of change with multiple stakeholders"
            icon="📝"
          />
          <FeatureCard
            title="AI-Powered Synthesis"
            description="Generate insights and synthesis from multiple theories using advanced AI"
            icon="🤖"
          />
          <FeatureCard
            title="Multi-tenant Platform"
            description="Secure workspaces for organizations with role-based access control"
            icon="🏢"
          />
        </div>

        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureList
              title="Content Management"
              items={[
                "Create and edit theories of change",
                "Version control and history tracking",
                "Tag-based organization",
                "Advanced search functionality",
                "Export to multiple formats"
              ]}
            />
            <FeatureList
              title="Collaboration Tools"
              items={[
                "Real-time collaborative editing",
                "Review and approval workflows",
                "Comments and discussions",
                "Notifications and alerts",
                "Activity feeds and updates"
              ]}
            />
          </div>
        </section>

        <section className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enable Full Functionality
          </h2>
          <p className="text-gray-700 mb-4">
            To activate all features including user authentication, data persistence, and AI capabilities:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Create a Supabase project for the database backend</li>
            <li>Configure environment variables in Vercel dashboard</li>
            <li>Set up AI API keys (OpenAI or Anthropic)</li>
            <li>Redeploy the application</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            See the documentation for detailed setup instructions.
          </p>
        </section>
      </div>
    </main>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
EOF

echo ""
echo "Deploying to Vercel..."
npx vercel --prod --yes

cd ..
rm -rf deploy-temp

echo ""
echo "🎉 Deployment complete!"