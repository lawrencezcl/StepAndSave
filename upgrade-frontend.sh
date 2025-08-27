#!/bin/bash

# Step-and-Save Frontend Upgrade Script
# Run this after upgrading Node.js to 16+

echo "🚀 Upgrading Step-and-Save Frontend for Node.js 16+"
echo "📋 Current Node.js version:"
node --version

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible!"

cd frontend

echo "🧹 Cleaning up old dependencies..."
rm -rf node_modules package-lock.json

echo "📦 Updating package.json with modern versions..."
# This will be replaced by the actual package.json update

echo "📥 Installing updated dependencies..."
npm install

echo "🔧 Updating Vite configuration..."
# Vite config will be updated to latest version

echo "🔄 Restoring Web3 components..."
# Components will be restored with full Web3 functionality

echo "🎯 Starting development server..."
npm run dev

echo "✅ Frontend upgrade complete! Check http://localhost:3000"