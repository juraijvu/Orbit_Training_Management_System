#!/bin/bash

echo "🔍 Troubleshooting deployment issues..."

# Check current directory
echo "Current directory: $(pwd)"

# Check if package.json exists in current directory
if [ -f "package.json" ]; then
    echo "✅ package.json found in current directory"
else
    echo "❌ package.json NOT found in current directory"
    
    # Search for package.json in common locations
    echo "🔍 Searching for package.json..."
    find /var/www -name "package.json" 2>/dev/null
    find /home -name "package.json" 2>/dev/null
    find /root -name "package.json" 2>/dev/null
fi

# List current directory contents
echo ""
echo "📁 Current directory contents:"
ls -la

echo ""
echo "📁 Contents of /var/www/:"
ls -la /var/www/

echo ""
echo "📁 Checking if orbit-system directory exists:"
if [ -d "/var/www/orbit-system" ]; then
    echo "✅ /var/www/orbit-system exists"
    echo "Contents:"
    ls -la /var/www/orbit-system/
else
    echo "❌ /var/www/orbit-system does not exist"
fi

echo ""
echo "📁 Checking html directory:"
if [ -d "/var/www/html" ]; then
    echo "✅ /var/www/html exists"
    echo "Contents:"
    ls -la /var/www/html/
else
    echo "❌ /var/www/html does not exist"
fi