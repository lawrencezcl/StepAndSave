# Step-and-Save

🚶‍♂️ **Convert your daily steps into instant spendable NFT coupons on VERY Network**

A Web3 loyalty program that rewards users for walking by minting NFT coupons that can be used at participating merchants.

## 🌟 Features

- **Step Tracking**: Real-time step counting with progress visualization
- **NFT Coupons**: Convert every 1,000 steps into tradeable NFT coupons
- **Wallet Integration**: Connect with Web3 wallets (demo mode available)
- **Merchant Network**: Use coupons for discounts at local businesses
- **Responsive Design**: PWA-ready mobile-first interface
- **VERY Network**: Built on sustainable blockchain infrastructure

## 🚀 Live Demo

Visit the live application: [step-and-save-frontend.vercel.app](https://step-and-save-frontend.vercel.app)

## 📱 Project Structure

```
StepAndSave/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── SimpleApp.tsx  # Main application
│   │   └── main.tsx       # Entry point
│   ├── dist/             # Build output
│   └── package.json
├── backend/              # Node.js backend (optional)
├── contracts/            # Smart contracts
└── docs/                 # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **React 17** - UI framework
- **TypeScript** - Type safety
- **Vite 3** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Hot Toast** - Notifications
- **React Router** - Navigation

### Blockchain (Demo Mode)
- **VERY Network** - Sustainable blockchain
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **RainbowKit** - Wallet connection

## 🏗️ Quick Start

### Prerequisites
- Node.js 14.15.1+ (18+ recommended for full features)
- npm 6.14.8+

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/StepAndSave.git
   cd StepAndSave
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
cd frontend
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to GitHub**: Push your code to GitHub
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend/`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Configure Environment**:
   - Node.js Version: 18.x

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🎮 How to Use

1. **Welcome Screen**: First-time users see an introduction
2. **Connect Wallet**: Demo wallet connection (no real wallet needed)
3. **Start Walking**: Begin step tracking with the start button
4. **Earn Coupons**: Every 1,000 steps = 1 NFT coupon
5. **View Progress**: Real-time progress bar and statistics
6. **Mint NFTs**: Convert steps to coupons (demo mode)

## 🔧 Configuration

### Vite Configuration
The project uses Vite with React plugin and Tailwind CSS integration.

### Tailwind CSS
Fully configured with custom components and responsive design.

### PostCSS
Configured for Tailwind CSS and autoprefixer support.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DoraHacks** - Hackathon platform
- **VERY Network** - Sustainable blockchain infrastructure
- **React Community** - Amazing ecosystem
- **Tailwind CSS** - Beautiful utility-first CSS

## 📞 Support

For support, email support@stepandsave.app or join our Discord community.

---

**Built with ❤️ for DoraHacks Hackathon**

*Turn every step into value. Walk, earn, spend, repeat.*