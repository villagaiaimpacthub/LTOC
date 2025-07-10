#!/bin/bash

echo "🚀 Quick Start LTOC Platform"
echo "==========================="
echo ""

cd "$(dirname "$0")/functional-platform"

# Start server in background
echo "Starting server..."
npm run dev &

# Wait for server to start
sleep 5

echo ""
echo "✅ Server should be running!"
echo ""
echo "Try these URLs in your Windows browser:"
echo "  1. http://localhost:3000"
echo "  2. http://127.0.0.1:3000"
echo ""
echo "If those don't work, try:"
echo "  - Open Windows Command Prompt (cmd.exe)"
echo "  - Navigate to: C:\Users\julia\DEV\LTOC\scripts\functional-platform"
echo "  - Run: npm run dev"
echo ""
echo "Press Enter to continue..."
read