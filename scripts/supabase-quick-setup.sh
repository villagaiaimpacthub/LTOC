#!/bin/bash

echo "🚀 LTOC Supabase Quick Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Create Supabase Project${NC}"
echo "1. Open https://supabase.com in your browser"
echo "2. Click 'Start your project' and sign in"
echo "3. Click 'New project' with these settings:"
echo "   - Project name: ltoc-platform"
echo "   - Database Password: (generate a strong one)"
echo "   - Region: (choose closest to you)"
echo ""
read -p "Press Enter when your project is created..."

echo ""
echo -e "${BLUE}Step 2: Get Your API Keys${NC}"
echo "In your Supabase dashboard:"
echo "1. Go to Settings → API"
echo "2. Copy these values:"
echo ""
read -p "Enter your Project URL: " SUPABASE_URL
read -p "Enter your anon public key: " SUPABASE_ANON_KEY
read -p "Enter your service_role key: " SUPABASE_SERVICE_KEY

# Create env files
echo ""
echo -e "${GREEN}Creating environment files...${NC}"

# Create .env.local for development
cat > apps/web/.env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Optional: AI Providers
# OPENAI_API_KEY=your-openai-key
# ANTHROPIC_API_KEY=your-anthropic-key
EOF

# Create .env.production for deployment
cat > .env.production << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY
EOF

echo -e "${GREEN}✓ Environment files created${NC}"

echo ""
echo -e "${BLUE}Step 3: Run Database Migrations${NC}"
echo "Go to your Supabase Dashboard → SQL Editor"
echo ""
echo "Run these migrations in order:"
echo "1. 001_initial_schema.sql"
echo "2. 002_auth_functions.sql"
echo "3. 003_collaboration.sql"
echo "4. 004_health_check.sql"
echo "5. 005_search_functionality.sql"
echo "6. 006_notifications.sql"
echo ""
echo "I'll create a combined migration file for easy copy-paste..."

# Create combined migration file
cat > supabase/migrations/combined_migrations.sql << EOF
-- LTOC Platform Complete Database Setup
-- Run this in Supabase SQL Editor

EOF

# Append all migrations
for file in supabase/migrations/[0-9]*.sql; do
    echo "-- ========================================" >> supabase/migrations/combined_migrations.sql
    echo "-- $(basename $file)" >> supabase/migrations/combined_migrations.sql
    echo "-- ========================================" >> supabase/migrations/combined_migrations.sql
    echo "" >> supabase/migrations/combined_migrations.sql
    cat "$file" >> supabase/migrations/combined_migrations.sql
    echo "" >> supabase/migrations/combined_migrations.sql
    echo "" >> supabase/migrations/combined_migrations.sql
done

echo -e "${GREEN}✓ Created combined_migrations.sql${NC}"
echo "  Copy the contents of supabase/migrations/combined_migrations.sql"
echo "  and run it in the SQL Editor"
echo ""
read -p "Press Enter when migrations are complete..."

echo ""
echo -e "${BLUE}Step 4: Configure Authentication${NC}"
echo "In Supabase Dashboard → Authentication → URL Configuration"
echo "Add these URLs:"
echo "- Site URL: http://localhost:3000"
echo "- Redirect URLs:"
echo "  - http://localhost:3000/auth/callback"
echo "  - https://your-app.vercel.app/auth/callback"
echo ""
read -p "Press Enter when auth is configured..."

echo ""
echo -e "${BLUE}Step 5: Create Admin User${NC}"
echo "1. Go to Authentication → Users"
echo "2. Click 'Invite user'"
echo "3. Enter your email"
echo "4. After confirming, run this SQL to make yourself admin:"
echo ""
echo "UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
echo ""

echo -e "${GREEN}🎉 Supabase setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test locally: ./scripts/local-dev.sh"
echo "2. Deploy to Vercel: ./scripts/quick-deploy.sh"
echo ""
echo "Your environment files have been created:"
echo "- apps/web/.env.local (for development)"
echo "- .env.production (for deployment)"