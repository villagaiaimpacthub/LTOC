#!/bin/bash

echo "🚀 Running LTOC Platform Locally on Port 3000"
echo "============================================="
echo ""

# Check if we're in the functional-platform directory
if [ -d "functional-platform" ]; then
    cd functional-platform
elif [ -d "scripts/functional-platform" ]; then
    cd scripts/functional-platform
else
    echo "❌ Error: functional-platform directory not found"
    echo "Please run this script from the LTOC root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎯 Starting development server on port 3000..."
echo "================================================"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the development server on port 3000
PORT=3000 npm run dev