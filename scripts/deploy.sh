#!/bin/bash

echo "🚀 Deploying LTOC Platform to Production"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗${NC} npx not found"
    echo "Please install Node.js and npm"
    exit 1
fi

# Run pre-deployment checks
echo -e "${BLUE}Running pre-deployment checks...${NC}"
./scripts/pre-deploy.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}Pre-deployment checks failed!${NC}"
    exit 1
fi

# Check for production environment file
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠ Warning:${NC} No .env.production file found"
    echo "Environment variables should be configured in Vercel dashboard"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
npx vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify deployment at your production URL"
    echo "2. Check the health endpoint: /api/health"
    echo "3. Test authentication flow"
    echo "4. Monitor error logs in Vercel dashboard"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo "Check the error messages above and try again"
    exit 1
fi