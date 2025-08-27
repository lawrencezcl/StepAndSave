#!/bin/bash

# Step-and-Save Deployment Script
echo "🚀 Step-and-Save Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the StepAndSave root directory"
    exit 1
fi

echo "📋 Deployment Checklist:"
echo "1. ✅ Git repository initialized"
echo "2. ✅ All files committed"
echo "3. ⏳ Ready to push to GitHub"

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo "🔗 GitHub Repository Setup Required:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Please follow these steps:"
    echo ""
    echo "1. Go to https://github.com and create a new repository named 'StepAndSave'"
    echo "2. Copy the repository URL (e.g., https://github.com/yourusername/StepAndSave.git)"
    echo "3. Run this command to add the remote:"
    echo "   git remote add origin YOUR_REPO_URL"
    echo "4. Then run this script again"
    echo ""
    echo "📝 Example:"
    echo "   git remote add origin https://github.com/yourusername/StepAndSave.git"
    exit 1
fi

echo ""
echo "🔄 Pushing to GitHub..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Vercel Deployment Instructions:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Go to https://vercel.com"
    echo "2. Sign in with your GitHub account"
    echo "3. Click 'New Project'"
    echo "4. Import your 'StepAndSave' repository"
    echo "5. Configure the project:"
    echo "   • Framework Preset: Vite"
    echo "   • Root Directory: frontend"
    echo "   • Build Command: npm run build"
    echo "   • Output Directory: dist"
    echo "   • Install Command: npm install"
    echo "6. Click 'Deploy'"
    echo ""
    echo "🎉 Your app will be available at: https://step-and-save-XXXXX.vercel.app"
    echo ""
    echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your GitHub repository URL and permissions"
fi