#!/bin/bash

echo "🔍 Testing WSL Network Access"
echo "============================"
echo ""

# Get Windows host IP
WINDOWS_HOST=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')

echo "Network Information:"
echo "  WSL IP: $WSL_IP"
echo "  Windows Host: $WINDOWS_HOST"
echo ""

echo "📋 Instructions to access your LTOC platform:"
echo ""
echo "1. Open Windows PowerShell as Administrator and run:"
echo "   netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$WSL_IP"
echo ""
echo "2. Then in your Windows browser, go to:"
echo "   http://localhost:3000"
echo ""
echo "To remove the port forwarding later, run:"
echo "   netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0"
echo ""

# Start the server
cd "$(dirname "$0")/functional-platform"
echo "Starting LTOC platform..."
HOST=0.0.0.0 PORT=3000 npm run dev