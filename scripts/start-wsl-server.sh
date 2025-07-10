#!/bin/bash

echo "🚀 Starting LTOC Platform for WSL Access"
echo "======================================="
echo ""

# Get WSL IP address
WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')

cd "$(dirname "$0")/functional-platform"

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎯 Starting server with WSL networking..."
echo ""
echo "===================================================="
echo "🌐 Access the platform using these URLs:"
echo ""
echo "  From Windows browser:"
echo "  → http://localhost:3000"
echo "  → http://127.0.0.1:3000"
echo ""
echo "  Alternative WSL IP:"
echo "  → http://$WSL_IP:3000"
echo ""
echo "===================================================="
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start server binding to all interfaces
HOST=0.0.0.0 PORT=3000 npm run dev