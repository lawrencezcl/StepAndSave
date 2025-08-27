# Node.js Upgrade Guide for Step-and-Save Frontend

## Prerequisites

Your current environment:
- Node.js: 14.15.1 (needs upgrade)
- npm: 6.14.8
- Target: Node.js 16+ for BigInt support

## Step 1: Upgrade Node.js

### Option A: Using Node Version Manager (nvm) - Recommended

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or reload
source ~/.bashrc
# or
source ~/.zshrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### Option B: Direct Download
1. Go to https://nodejs.org/
2. Download Node.js 18 LTS or 20 LTS
3. Install using the installer

### Option C: Using Homebrew (macOS)
```bash
brew install node@18
brew link node@18 --force
```

## Step 2: Upgrade Frontend Dependencies

After Node.js upgrade, run the following commands:

```bash
# Navigate to project root
cd /Users/chenglinzhang/Documents/GitHub/StepAndSave

# Run the upgrade script
./upgrade-frontend.sh
```

Or manually:

```bash
cd frontend

# Clean old dependencies
rm -rf node_modules package-lock.json

# Replace package.json with modern versions
cp ../package-modern.json package.json

# Install updated dependencies
npm install

# Replace components with Web3 functionality
cp ../App-modern.tsx src/App.tsx
cp ../vite.config-modern.ts vite.config.ts

# Start development server
npm run dev
```

## Step 3: Restore Web3 Components

The upgrade will restore:

✅ **RainbowKit Integration** - Full wallet connection UI
✅ **Wagmi v2.5.0** - Latest React hooks for Ethereum
✅ **Viem v2.9.0** - Modern Ethereum library with BigInt support
✅ **React Query v5** - Advanced data fetching
✅ **Vite v5.1.4** - Latest build tool with HMR
✅ **PWA Support** - Progressive Web App features

## Step 4: Update Configuration Files

### Modern wagmi config (src/config/wagmi.ts):
```typescript
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors';

// Very Network testnet configuration
export const veryTestnet = {
  id: 12052024,
  name: 'VERY Testnet',
  network: 'very-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'VERY',
    symbol: 'VERY',
  },
  rpcUrls: {
    public: { http: ['https://rpc-testnet.very.network'] },
    default: { http: ['https://rpc-testnet.very.network'] },
  },
  blockExplorers: {
    default: { name: 'Very Explorer', url: 'https://testnet.veryscan.io' },
  },
  testnet: true,
};

export const wagmiConfig = createConfig({
  chains: [veryTestnet, sepolia, mainnet],
  transports: {
    [veryTestnet.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: 'your-wallet-connect-project-id' }),
    safe(),
  ],
});
```

### Update main.tsx for React 18:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Step 5: Test Full Web3 Functionality

After upgrade, test these features:

1. **Wallet Connection** - Connect MetaMask/WalletConnect
2. **Step Tracking** - Real step counting simulation
3. **NFT Minting** - Coupon creation with Web3 integration
4. **Location Services** - Geolocation-based features
5. **Transaction Signing** - Gasless meta-transactions
6. **Mobile Responsiveness** - PWA functionality

## Expected Results

✅ **No BigInt Errors** - Modern Node.js supports BigInt natively
✅ **Fast HMR** - Vite 5 with improved hot reload
✅ **Full Web3 Stack** - Complete wagmi + RainbowKit integration
✅ **TypeScript Support** - Latest TS with better type inference
✅ **PWA Features** - Service worker and offline support
✅ **Optimized Builds** - Tree shaking and code splitting

## Troubleshooting

### If you encounter issues:

1. **Clear all caches:**
   ```bash
   npm cache clean --force
   rm -rf ~/.npm
   ```

2. **Verify Node.js version:**
   ```bash
   node --version  # Must be 16.0.0 or higher
   ```

3. **Check package versions:**
   ```bash
   npm list viem wagmi @rainbow-me/rainbowkit
   ```

4. **Restart development server:**
   ```bash
   npm run clean
   npm run dev
   ```

## Next Steps

After successful upgrade:
1. Test all Web3 functionality
2. Deploy to staging environment
3. Run full integration tests
4. Update documentation
5. Prepare for DoraHacks submission

The frontend will be fully ready for Web3 testing with BigInt support!