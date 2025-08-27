# Step-and-Save Frontend Deployment Guide

## 🚀 Deployment to Vercel

Since the Vercel CLI requires Node.js 18+ and you're using Node.js 14.15.1, here are alternative deployment methods:

### Method 1: GitHub + Vercel Dashboard (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   cd /Users/chenglinzhang/Documents/GitHub/StepAndSave
   git add .
   git commit -m "Add frontend ready for deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `StepAndSave` repository
   - Set the following settings:
     - **Framework Preset**: Vite
     - **Build Command**: `cd frontend && npm run build`
     - **Output Directory**: `frontend/dist`
     - **Install Command**: `cd frontend && npm install`

### Method 2: Manual Upload (Alternative)

1. **Build the project locally**:
   ```bash
   cd /Users/chenglinzhang/Documents/GitHub/StepAndSave/frontend
   npm run build
   ```

2. **Upload dist folder** to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Drag and drop the `frontend/dist` folder

### Method 3: Use Git Deployment

1. **Update repository settings** in Vercel:
   - Root Directory: `frontend/`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 📁 Project Structure for Vercel

```
StepAndSave/
├── frontend/              # Root directory to deploy
│   ├── src/
│   ├── dist/             # Build output
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json       # Vercel configuration
│   └── ...
```

## ⚙️ Environment Variables (if needed)

Add these in Vercel Dashboard > Settings > Environment Variables:
- `NODE_VERSION`: `18.17.0` (to override Node version)

## 🔧 Build Settings in Vercel

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

## 🚨 Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify build command works locally
4. Check Node.js version compatibility

## 📱 Expected Result

Once deployed, you'll get:
- Live URL (e.g., `step-and-save-frontend.vercel.app`)
- Automatic deploys on git push
- Global CDN distribution
- HTTPS enabled by default