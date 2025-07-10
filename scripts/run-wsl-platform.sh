#!/bin/bash

echo "🚀 Starting LTOC Platform with WSL Fix"
echo "======================================"
echo ""

cd "$(dirname "$0")/functional-platform"

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null

# Get WSL IP
WSL_IP=$(hostname -I | awk '{print $1}')

echo "🔧 WSL IP Address: $WSL_IP"
echo ""
echo "📝 To access from Windows browser:"
echo ""
echo "1. Run this in Windows PowerShell (as Administrator):"
echo "   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$WSL_IP"
echo ""
echo "2. Then open: http://localhost:3000"
echo ""
echo "Starting server..."
echo ""

# Start with explicit host binding
npx next dev -H 0.0.0.0 -p 3000