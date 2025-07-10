#!/bin/bash

# Copy necessary files from quick-profile-demo
cp ../quick-profile-demo/package.json .
cp ../quick-profile-demo/next.config.js .
cp ../quick-profile-demo/tsconfig.json .
cp ../quick-profile-demo/tailwind.config.js .
cp ../quick-profile-demo/postcss.config.js .
cp -r ../quick-profile-demo/app/globals.css .

# Update with complete profile features
mkdir -p app/profile/\\[id\\]
mkdir -p app/dashboard
mkdir -p components
mkdir -p lib

# Copy and update files
cp -r ../quick-profile-demo/* . 2>/dev/null || true

# Build and deploy
npm install
npm run build
npx vercel --prod --yes