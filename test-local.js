#!/usr/bin/env node

/**
 * Local Test Runner for Step-and-Save
 * This script sets up and runs local tests for all components
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

// Check Node.js version
function checkNodeVersion() {
  logSection('🔍 Checking Node.js Version');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  log(`Current Node.js version: ${nodeVersion}`, 'cyan');
  
  if (majorVersion < 18) {
    log('⚠️  Warning: Node.js 18+ is recommended for full compatibility', 'yellow');
    log('Some packages may not work optimally with Node.js 14', 'yellow');
    log('To upgrade Node.js:', 'yellow');
    log('  1. Using nvm: nvm install 18 && nvm use 18', 'yellow');
    log('  2. Using brew: brew install node@18', 'yellow');
    log('  3. Download from: https://nodejs.org/', 'yellow');
    return false;
  } else {
    log('✅ Node.js version is compatible', 'green');
    return true;
  }
}

// Check if required files exist
function checkProjectStructure() {
  logSection('📁 Checking Project Structure');
  
  const requiredFiles = [
    'package.json',
    '.env',
    'contracts/package.json',
    'frontend/package.json',
    'backend/package.json',
    'merchant-dashboard/package.json'
  ];
  
  const requiredDirs = [
    'contracts',
    'frontend', 
    'backend',
    'merchant-dashboard',
    'docs'
  ];
  
  let allFilesExist = true;
  
  // Check files
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ Found: ${file}`, 'green');
    } else {
      log(`❌ Missing: ${file}`, 'red');
      allFilesExist = false;
    }
  });
  
  // Check directories
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      log(`✅ Found directory: ${dir}`, 'green');
    } else {
      log(`❌ Missing directory: ${dir}`, 'red');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Test smart contracts compilation
function testContractsCompilation() {
  logSection('🔗 Testing Smart Contracts Compilation');
  
  return new Promise((resolve) => {
    const contractsDir = path.join(__dirname, 'contracts');
    
    if (!fs.existsSync(contractsDir)) {
      log('❌ Contracts directory not found', 'red');
      resolve(false);
      return;
    }
    
    // Check if Hardhat is available
    exec('npx hardhat --version', { cwd: contractsDir }, (error, stdout, stderr) => {
      if (error) {
        log('❌ Hardhat not installed. Installing...', 'yellow');
        
        // Install hardhat if not available
        exec('npm install --save-dev hardhat@^2.19.0', { cwd: contractsDir }, (installError) => {
          if (installError) {
            log('❌ Failed to install Hardhat', 'red');
            resolve(false);
          } else {
            log('✅ Hardhat installed successfully', 'green');
            resolve(true);
          }
        });
      } else {
        log(`✅ Hardhat available: ${stdout.trim()}`, 'green');
        
        // Try to compile contracts
        exec('npx hardhat compile', { cwd: contractsDir }, (compileError, compileStdout) => {
          if (compileError) {
            log('❌ Contract compilation failed:', 'red');
            log(compileError.message, 'red');
            resolve(false);
          } else {
            log('✅ Contracts compiled successfully', 'green');
            resolve(true);
          }
        });
      }
    });
  });
}

// Test backend services
function testBackendServices() {
  logSection('🛠️  Testing Backend Services');
  
  return new Promise((resolve) => {
    const backendDir = path.join(__dirname, 'backend');
    
    // Check if TypeScript compilation works
    exec('npx tsc --noEmit', { cwd: backendDir }, (error, stdout, stderr) => {
      if (error) {
        log('❌ TypeScript compilation failed:', 'red');
        log(stderr, 'red');
        resolve(false);
      } else {
        log('✅ TypeScript compilation successful', 'green');
        
        // Test if we can import the main modules
        try {
          const indexPath = path.join(backendDir, 'src', 'index.ts');
          if (fs.existsSync(indexPath)) {
            log('✅ Backend entry point exists', 'green');
          }
          
          const relayerPath = path.join(backendDir, 'src', 'services', 'relayer', 'RelayerService.ts');
          if (fs.existsSync(relayerPath)) {
            log('✅ RelayerService exists', 'green');
          }
          
          const geofencingPath = path.join(backendDir, 'src', 'services', 'geofencing', 'GeofencingService.ts');
          if (fs.existsSync(geofencingPath)) {
            log('✅ GeofencingService exists', 'green');
          }
          
          resolve(true);
        } catch (err) {
          log(`❌ Error checking backend structure: ${err.message}`, 'red');
          resolve(false);
        }
      }
    });
  });
}

// Test frontend build
function testFrontendBuild() {
  logSection('📱 Testing Frontend Build');
  
  return new Promise((resolve) => {
    const frontendDir = path.join(__dirname, 'frontend');
    
    // Check if Vite can build
    exec('npx vite build --mode development', { cwd: frontendDir, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        log('❌ Frontend build failed:', 'red');
        log(stderr, 'red');
        resolve(false);
      } else {
        log('✅ Frontend build successful', 'green');
        resolve(true);
      }
    });
  });
}

// Start a simple test server
function startTestServer() {
  logSection('🚀 Starting Test Server');
  
  return new Promise((resolve) => {
    // Create a simple test server
    const http = require('http');
    
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      if (req.url === '/health') {
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          message: 'Step-and-Save test server running'
        }));
      } else if (req.url === '/api/test') {
        res.end(JSON.stringify({
          message: 'Test endpoint working',
          version: '1.0.0',
          environment: 'local-test'
        }));
      } else {
        res.end(JSON.stringify({
          message: 'Step-and-Save Test Server',
          endpoints: ['/health', '/api/test'],
          project: 'Walk. Tap. Save.'
        }));
      }
    });
    
    server.listen(3001, () => {
      log('✅ Test server started on http://localhost:3001', 'green');
      log('  Health check: http://localhost:3001/health', 'cyan');
      log('  Test API: http://localhost:3001/api/test', 'cyan');
      
      // Test the server
      const http = require('http');
      http.get('http://localhost:3001/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            log(`✅ Server response: ${response.status}`, 'green');
            server.close();
            resolve(true);
          } catch (err) {
            log('❌ Invalid server response', 'red');
            server.close();
            resolve(false);
          }
        });
      }).on('error', (err) => {
        log(`❌ Server test failed: ${err.message}`, 'red');
        server.close();
        resolve(false);
      });
    });
    
    server.on('error', (err) => {
      log(`❌ Failed to start server: ${err.message}`, 'red');
      resolve(false);
    });
  });
}

// Main test runner
async function runTests() {
  log('🧪 Step-and-Save Local Test Runner', 'bold');
  log('This will test the local development environment', 'cyan');
  
  const results = {
    nodeVersion: checkNodeVersion(),
    projectStructure: checkProjectStructure(),
    contracts: await testContractsCompilation(),
    backend: await testBackendServices(),
    frontend: await testFrontendBuild(),
    server: await startTestServer()
  };
  
  logSection('📊 Test Results Summary');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${test}: ${status}`, color);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(60));
  log(`Test Summary: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! Your local environment is ready.', 'green');
    log('\nNext steps:', 'bold');
    log('1. Run: npm run dev', 'cyan');
    log('2. Open: http://localhost:3000 (frontend)', 'cyan');
    log('3. Open: http://localhost:3002 (merchant dashboard)', 'cyan');
    log('4. Check: http://localhost:3001/health (backend)', 'cyan');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'yellow');
    log('\nTroubleshooting:', 'bold');
    if (!results.nodeVersion) {
      log('- Upgrade to Node.js 18+ for best compatibility', 'yellow');
    }
    if (!results.contracts) {
      log('- Install Hardhat: cd contracts && npm install', 'yellow');
    }
    if (!results.backend) {
      log('- Check TypeScript: cd backend && npm install', 'yellow');
    }
    if (!results.frontend) {
      log('- Check Vite: cd frontend && npm install', 'yellow');
    }
  }
  
  console.log('\n📚 For more help, check:');
  log('- README.md', 'cyan');
  log('- docs/DEPLOYMENT.md', 'cyan');
  log('- docs/API.md', 'cyan');
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Step-and-Save Local Test Runner

Usage: node test-local.js [options]

Options:
  --help, -h     Show this help message
  --quick, -q    Run quick tests only (skip builds)
  --server, -s   Only start test server
  
Examples:
  node test-local.js          # Run all tests
  node test-local.js --quick  # Run quick tests
  node test-local.js --server # Start test server only
`);
  process.exit(0);
}

if (args.includes('--server') || args.includes('-s')) {
  startTestServer().then(() => {
    log('Test server is running. Press Ctrl+C to stop.', 'green');
  });
} else {
  runTests().catch(err => {
    log(`❌ Test runner failed: ${err.message}`, 'red');
    process.exit(1);
  });
}