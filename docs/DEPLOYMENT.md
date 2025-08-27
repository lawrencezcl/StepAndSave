# Deployment Guide

This guide covers deploying Step-and-Save to various environments including local development, testnet, and production.

## Prerequisites

- Node.js 18+ and npm 9+
- Git
- VERY Network wallet with testnet/mainnet tokens
- Domain name (for production)

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/chenglinzhang/StepAndSave.git
cd StepAndSave
npm install
```

### 2. Environment Configuration

Copy environment template and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required for all deployments
VERY_NETWORK=testnet  # or 'mainnet' for production
RELAYER_PRIVATE_KEY=0x...  # Your relayer wallet private key
JWT_SECRET=your_super_secret_key

# For production
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.com
DATABASE_URL=postgres://...
```

## Local Development

### 1. Start Development Servers

```bash
# Start all services
npm run dev

# Or start individually
npm run dev --workspace=frontend    # Frontend on :3000
npm run dev --workspace=backend     # Backend on :3001
npm run dev --workspace=merchant-dashboard  # Dashboard on :3002
```

### 2. Deploy Contracts Locally

```bash
# Start local hardhat node
cd contracts
npx hardhat node

# Deploy contracts (in another terminal)
npm run deploy
```

### 3. Access Applications

- **User App:** http://localhost:3000
- **Merchant Dashboard:** http://localhost:3002
- **API:** http://localhost:3001/health

## Testnet Deployment

### 1. Prepare VERY Testnet

1. Get testnet VERY tokens from faucet
2. Configure `.env` with testnet settings:

```bash
VERY_NETWORK=testnet
VERY_RPC_URL=https://testnet-rpc.very.network
```

### 2. Deploy Smart Contracts

```bash
cd contracts

# Deploy to VERY testnet
npm run deploy:testnet

# Verify contracts (optional)
npm run verify -- --network very-testnet <contract-address>
```

### 3. Update Contract Addresses

After deployment, update `.env` with contract addresses:

```bash
STEP_COUPON_FACTORY_ADDRESS=0x...
MERCHANT_BID_REGISTRY_ADDRESS=0x...
REDEEMER_ADDRESS=0x...
```

### 4. Deploy Backend

#### Option A: Docker Deployment

```bash
# Build Docker image
docker build -t step-and-save-backend ./backend

# Run with environment variables
docker run -d \
  --name step-and-save-backend \
  --env-file .env \
  -p 3001:3001 \
  step-and-save-backend
```

#### Option B: VPS Deployment

```bash
# On your server
git clone https://github.com/chenglinzhang/StepAndSave.git
cd StepAndSave
npm install

# Build backend
npm run build --workspace=backend

# Start with PM2
npm install -g pm2
pm2 start backend/dist/index.js --name step-and-save-backend

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

### 5. Deploy Frontend

#### Option A: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Option B: Netlify

```bash
# Build frontend
npm run build --workspace=frontend

# Deploy to Netlify (manual upload or CLI)
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

### 6. Deploy Merchant Dashboard

```bash
# Build dashboard
npm run build --workspace=merchant-dashboard

# Deploy to hosting service of choice
# (Similar to frontend deployment)
```

## Production Deployment

### 1. Production Environment Variables

```bash
NODE_ENV=production
VERY_NETWORK=mainnet
VERY_RPC_URL=https://rpc.very.network

# Security
JWT_SECRET=production_secret_key
WEBHOOK_SECRET=production_webhook_secret

# Database (required for production)
DATABASE_URL=postgres://user:pass@host:5432/stepandsave
REDIS_URL=redis://user:pass@host:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=warn

# SSL/Security
ENABLE_CORS=false
RATE_LIMIT_MAX_REQUESTS=50
```

### 2. SSL/HTTPS Setup

```bash
# Using Cloudflare (recommended)
# 1. Add domain to Cloudflare
# 2. Update DNS records
# 3. Enable SSL/TLS encryption

# Using Let's Encrypt (if self-hosting)
sudo certbot --nginx -d api.step-and-save.app
```

### 3. Database Setup

```bash
# PostgreSQL setup
sudo -u postgres createdb stepandsave
sudo -u postgres createuser stepandsave_user

# Redis setup (optional, for caching)
sudo systemctl enable redis
sudo systemctl start redis
```

### 4. Production Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Step-and-Save production deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build applications
npm run build

# Deploy contracts to mainnet (if needed)
if [ "$DEPLOY_CONTRACTS" = "true" ]; then
  cd contracts
  npm run deploy:mainnet
  cd ..
fi

# Restart backend service
pm2 restart step-and-save-backend

# Deploy frontend
cd frontend
vercel --prod
cd ..

# Deploy merchant dashboard
cd merchant-dashboard
vercel --prod
cd ..

echo "✅ Deployment completed successfully!"
```

### 5. Monitoring and Health Checks

```bash
# PM2 monitoring
pm2 monit

# Health check endpoint
curl https://api.step-and-save.app/health

# Setup uptime monitoring (recommended services)
# - UptimeRobot
# - Pingdom
# - DataDog
```

## Docker Deployment

### 1. Full Stack Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:password@db:5432/stepandsave
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules

  merchant-dashboard:
    build: ./merchant-dashboard
    ports:
      - "3002:3002"
    environment:
      - VITE_API_URL=http://localhost:3001
    volumes:
      - ./merchant-dashboard:/app
      - /app/node_modules

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=stepandsave
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2. Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## CI/CD Pipeline

### GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Step-and-Save

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      
      # Deploy contracts
      - name: Deploy Contracts
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          VERY_RPC_URL: ${{ secrets.VERY_RPC_URL }}
        run: |
          cd contracts
          npm run deploy:mainnet
      
      # Deploy to Vercel
      - name: Deploy Frontend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          cd frontend
          npx vercel --prod --token $VERCEL_TOKEN
```

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   ```bash
   # Check network configuration
   npx hardhat verify --help
   
   # Verify RPC URL
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     $VERY_RPC_URL
   ```

2. **Relayer Out of Gas**
   ```bash
   # Check relayer balance
   curl http://localhost:3001/api/relayer/balance
   
   # Top up relayer wallet
   # Send VERY tokens to relayer address
   ```

3. **Frontend Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Database Connection Issues**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT version();"
   
   # Check Redis connection
   redis-cli -u $REDIS_URL ping
   ```

### Performance Optimization

1. **Backend Optimization**
   - Enable Redis caching
   - Use connection pooling
   - Implement rate limiting
   - Add request compression

2. **Frontend Optimization**
   - Enable PWA features
   - Implement code splitting
   - Optimize images and assets
   - Use CDN for static files

3. **Database Optimization**
   - Add proper indexes
   - Use read replicas
   - Implement connection pooling
   - Regular maintenance

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled for all domains
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Monitoring and alerting setup

## Support

For deployment issues or questions:

1. Check our [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Open an issue on [GitHub](https://github.com/chenglinzhang/StepAndSave/issues)
3. Join our [Discord](https://discord.gg/stepandsave)
4. Contact support: support@step-and-save.app