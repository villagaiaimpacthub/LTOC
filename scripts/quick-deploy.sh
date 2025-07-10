#!/bin/bash

echo "🚀 LTOC Platform Quick Deployment Script"
echo "========================================"
echo ""
echo "This script will help you deploy to Vercel"
echo ""

# Check if logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    echo "❗ You need to login to Vercel first"
    echo ""
    echo "Run: npx vercel login"
    echo "Then run this script again"
    exit 1
fi

echo "✅ Logged in to Vercel as: $(npx vercel whoami)"
echo ""

# Create production env file template if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production template..."
    cp .env.production.example .env.production
    echo "⚠️  Please edit .env.production with your Supabase credentials"
    echo ""
fi

# Check if this is first deployment
if [ ! -f ".vercel/project.json" ]; then
    echo "🆕 First time deployment detected"
    echo ""
    echo "Deploying with these settings:"
    echo "  Project name: ltoc-platform"
    echo "  Directory: ./apps/web"
    echo ""
    
    # Deploy with automatic answers
    npx vercel --prod \
        --name ltoc-platform \
        --build-env NEXT_PUBLIC_SUPABASE_URL= \
        --build-env NEXT_PUBLIC_SUPABASE_ANON_KEY= \
        --yes
else
    echo "🔄 Deploying to existing project..."
    npx vercel --prod
fi

echo ""
echo "========================================"
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - OPENAI_API_KEY (optional)"
echo "   - ANTHROPIC_API_KEY (optional)"
echo "3. Redeploy after adding env vars"
echo ""
echo "📚 See SUPABASE_SETUP.md for Supabase configuration"