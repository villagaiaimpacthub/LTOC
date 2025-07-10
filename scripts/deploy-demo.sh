#!/bin/bash

echo "🚀 LTOC Demo Deployment (No Supabase Required)"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}This will deploy a demo version without database functionality${NC}"
echo ""

# Check if logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    echo "❗ You need to login to Vercel first"
    echo ""
    echo "Run: npx vercel login"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Vercel${NC}"
echo ""

# Create a minimal Next.js app for demo
echo "Creating demo pages..."

# Create a simple home page
mkdir -p apps/web/app
cat > apps/web/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Living Theory of Change Platform</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">🎉 Demo Deployment Successful!</h2>
        <p className="text-gray-700 mb-4">
          This is a demo version of the LTOC platform. The full version includes:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>User authentication and multi-tenancy</li>
          <li>Content management with real-time collaboration</li>
          <li>AI-powered synthesis generation</li>
          <li>Advanced search and filtering</li>
          <li>Admin dashboard and analytics</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">📚 Features</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Collaborative theory editing</li>
            <li>✓ Version control & history</li>
            <li>✓ AI synthesis tools</li>
            <li>✓ Review workflows</li>
            <li>✓ Real-time notifications</li>
          </ul>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">🛠️ Tech Stack</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Next.js 14 + TypeScript</li>
            <li>• Supabase (PostgreSQL)</li>
            <li>• Tailwind CSS</li>
            <li>• OpenAI/Anthropic APIs</li>
            <li>• Vercel deployment</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">⚡ Next Steps</h3>
        <p className="text-gray-700 mb-3">To enable full functionality:</p>
        <ol className="list-decimal ml-6 space-y-2 text-gray-700">
          <li>Create a Supabase project</li>
          <li>Run the database migrations</li>
          <li>Add environment variables to Vercel</li>
          <li>Redeploy the application</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">
          See <code className="bg-gray-200 px-2 py-1 rounded">SUPABASE_SETUP.md</code> for detailed instructions.
        </p>
      </div>
    </main>
  )
}
EOF

# Create layout
cat > apps/web/app/layout.tsx << 'EOF'
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
EOF

# Create minimal globals.css
cat > apps/web/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Deploy
echo ""
echo -e "${GREEN}Deploying to Vercel...${NC}"
cd apps/web
npx vercel --prod --yes

echo ""
echo -e "${GREEN}🎉 Demo deployment complete!${NC}"
echo ""
echo "Your demo is now live. To add full functionality:"
echo "1. Set up Supabase (see SUPABASE_SETUP.md)"
echo "2. Add environment variables in Vercel dashboard"
echo "3. Redeploy"