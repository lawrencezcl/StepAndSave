#!/usr/bin/env node

/**
 * Quick Start Script for Step-and-Save (Node.js 14 Compatible)
 * This script helps you get started with the project quickly
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

async function checkEnvironment() {
  logHeader('🔍 Environment Check');
  
  // Check Node.js version
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`, 'cyan');
  
  // Check if .env exists
  if (fs.existsSync('.env')) {
    log('✅ Environment file (.env) exists', 'green');
  } else {
    log('⚠️  Environment file missing', 'yellow');
    log('Creating .env from template...', 'yellow');
    
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      log('✅ Created .env from .env.example', 'green');
    } else {
      log('❌ No .env.example found', 'red');
    }
  }
  
  // Check project structure
  const requiredDirs = ['contracts', 'backend', 'frontend', 'merchant-dashboard'];
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`✅ ${dir}/ directory exists`, 'green');
    } else {
      log(`❌ ${dir}/ directory missing`, 'red');
    }
  });
}

function startSimpleBackend() {
  logHeader('🚀 Starting Simple Backend Server');
  
  const simpleServer = `
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      process.env[key.trim()] = value.trim();
    }
  });
}

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  res.setHeader('Content-Type', 'application/json');
  
  const url = req.url;
  const method = req.method;
  
  // Health check endpoint
  if (url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      message: 'Step-and-Save API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }));
    return;
  }
  
  // Mock API endpoints for testing
  if (url.startsWith('/api/')) {
    const endpoint = url.replace('/api/', '');
    
    switch (endpoint) {
      case 'steps/verify':
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Steps verified successfully',
          totalSteps: 1500,
          eligibleForCoupon: true
        }));
        break;
        
      case 'coupons/mint':
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          tokenId: 42,
          message: 'Coupon minted successfully',
          transactionHash: '0xmock_transaction_hash'
        }));
        break;
        
      case 'merchants/register':
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          merchantId: 'merchant_123',
          message: 'Merchant registered successfully'
        }));
        break;
        
      default:
        res.writeHead(200);
        res.end(JSON.stringify({
          message: 'Step-and-Save API',
          availableEndpoints: [
            '/health',
            '/api/steps/verify',
            '/api/coupons/mint',
            '/api/merchants/register'
          ],
          documentation: 'See docs/API.md for full documentation'
        }));
    }
  } else {
    // Default response
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Step-and-Save Backend',
      project: 'Walk. Tap. Save.',
      description: 'Convert steps into instant spendable coupons',
      status: 'running'
    }));
  }
});

server.listen(PORT, () => {
  console.log('🚀 Step-and-Save server running on http://localhost:' + PORT);
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  console.log('📝 API docs: http://localhost:' + PORT + '/api');
  console.log('');
  console.log('✨ Server is ready for testing!');
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  process.exit(1);
});
`;

  // Write the simple server file
  fs.writeFileSync('temp-server.js', simpleServer);
  
  log('✅ Simple server created', 'green');
  log('🚀 Starting server...', 'cyan');
  
  // Start the server
  const serverProcess = spawn('node', ['temp-server.js'], {
    stdio: 'inherit'
  });
  
  serverProcess.on('error', (err) => {
    log(`❌ Failed to start server: ${err.message}`, 'red');
  });
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    log('\n🛑 Stopping server...', 'yellow');
    serverProcess.kill();
    
    // Clean up temp file
    if (fs.existsSync('temp-server.js')) {
      fs.unlinkSync('temp-server.js');
    }
    
    log('👋 Goodbye!', 'cyan');
    process.exit(0);
  });
}

async function showQuickStart() {
  logHeader('🎯 Step-and-Save Quick Start Guide');
  
  log('This script will help you test the Step-and-Save project locally.', 'cyan');
  log('Perfect for Node.js 14 environments!', 'cyan');
  
  console.log('\nAvailable options:');
  log('1. Run environment check', 'blue');
  log('2. Start simple backend server', 'blue');
  log('3. Run comprehensive tests', 'blue');
  log('4. Show project information', 'blue');
  
  // Simple menu
  const choice = process.argv[2];
  
  switch (choice) {
    case 'check':
    case '1':
      await checkEnvironment();
      break;
      
    case 'server':
    case '2':
      await checkEnvironment();
      startSimpleBackend();
      break;
      
    case 'test':
    case '3':
      log('\n🧪 Running comprehensive tests...', 'cyan');
      const testProcess = spawn('node', ['simple-test.js'], { stdio: 'inherit' });
      break;
      
    case 'info':
    case '4':
      showProjectInfo();
      break;
      
    default:
      showUsage();
  }
}

function showProjectInfo() {
  logHeader('📖 Project Information');
  
  log('Step-and-Save: Walk. Tap. Save.', 'bold');
  log('Convert steps into instant spendable coupons on VERY Network', 'cyan');
  
  console.log('\n🏗️  Architecture:');
  log('• Smart Contracts - EVM contracts on VERY Network', 'green');
  log('• Frontend App - React-based Verychat mini-app', 'green');
  log('• Merchant Dashboard - React interface for merchants', 'green');
  log('• Backend Services - API, relayer, and geofencing', 'green');
  
  console.log('\n🚀 Features:');
  log('• Step tracking with ZK attestation', 'blue');
  log('• NFT coupon minting (1000 steps = 1 coupon)', 'blue');
  log('• Gasless transactions via meta-transaction relayer', 'blue');
  log('• Location-based validation (geofencing)', 'blue');
  log('• Merchant bidding system', 'blue');
  log('• QR code redemption', 'blue');
  
  console.log('\n📚 Documentation:');
  log('• README.md - Project overview and setup', 'yellow');
  log('• docs/API.md - Complete API documentation', 'yellow');
  log('• docs/DEPLOYMENT.md - Deployment guide', 'yellow');
  
  console.log('\n🔗 Quick Links:');
  log('• GitHub: https://github.com/chenglinzhang/StepAndSave', 'cyan');
  log('• VERY Network: https://very.gg', 'cyan');
  log('• DoraHacks: https://dorahacks.io', 'cyan');
}

function showUsage() {
  console.log('\n🧪 Step-and-Save Quick Start (Node.js 14 Compatible)');
  console.log('\nUsage: node quick-start.js [command]');
  console.log('\nCommands:');
  console.log('  check     Check environment and project setup');
  console.log('  server    Start a simple backend server for testing');
  console.log('  test      Run comprehensive test suite');
  console.log('  info      Show project information');
  console.log('\nExamples:');
  console.log('  node quick-start.js check    # Check your environment');
  console.log('  node quick-start.js server   # Start test server');
  console.log('  node quick-start.js test     # Run all tests');
  console.log('  node quick-start.js info     # Project information');
  console.log('\nNote: This script is designed to work with Node.js 14+');
  console.log('For full functionality, upgrade to Node.js 18+');
}

// Main execution
showQuickStart().catch(error => {
  log('❌ Error: ' + error.message, 'red');
  process.exit(1);
});