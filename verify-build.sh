#!/bin/bash

echo "🔍 Step-and-Save Build Verification"
echo "=================================="

cd frontend

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️ Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📊 Build statistics:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -d "dist" ]; then
        echo "📁 Build output:"
        ls -la dist/
        echo ""
        echo "📐 File sizes:"
        du -h dist/*
    fi
    
    echo ""
    echo "🚀 Ready for deployment!"
    echo "Run './deploy.sh' to deploy to GitHub and Vercel"
    
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above and fix any issues before deploying."
    exit 1
fi