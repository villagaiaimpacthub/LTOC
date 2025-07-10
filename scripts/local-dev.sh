#!/bin/bash

echo "🚀 Starting LTOC Platform in Development Mode"
echo "============================================"
echo ""

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  No .env.local file found!"
    echo ""
    echo "Creating from template..."
    cat > apps/web/.env.local << EOF
# Get these values from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: AI providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Optional: For GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
EOF
    echo "✅ Created apps/web/.env.local"
    echo "❗ Please edit it with your Supabase credentials"
    echo ""
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Start development server
echo ""
echo "🚀 Starting development server..."
echo "   Local URL: http://localhost:3000"
echo "   Network: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

pnpm dev