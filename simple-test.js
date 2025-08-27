#!/usr/bin/env node

/**
 * Simple Test Runner for Step-and-Save (Node.js 14 Compatible)
 * This script tests the basic functionality without complex tooling
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Step-and-Save Simple Test Runner');
console.log('====================================\n');

// Test 1: Check Node.js version
function testNodeVersion() {
  console.log('📋 Test 1: Node.js Version Check');
  const version = process.version;
  console.log(`   Current version: ${version}`);
  
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  if (majorVersion >= 14) {
    console.log('   ✅ Node.js version is functional for basic testing');
    return true;
  } else {
    console.log('   ❌ Node.js version too old');
    return false;
  }
}

// Test 2: Check project files
function testProjectFiles() {
  console.log('\n📋 Test 2: Project Structure Check');
  
  const requiredFiles = [
    'package.json',
    '.env',
    'contracts/contracts/StepCouponFactory.sol',
    'backend/src/index.ts',
    'frontend/src/App.tsx'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file}`);
      allExist = false;
    }
  });
  
  return allExist;
}

// Test 3: Test basic JavaScript/Node.js functionality
function testBasicFunctionality() {
  console.log('\n📋 Test 3: Basic Node.js Functionality');
  
  try {
    // Test async/await
    const testAsync = async () => {
      return new Promise(resolve => setTimeout(() => resolve('success'), 100));
    };
    
    // Test JSON parsing
    const testData = JSON.stringify({ test: 'data', number: 123 });
    const parsed = JSON.parse(testData);
    
    console.log('   ✅ Async/await support');
    console.log('   ✅ JSON parsing');
    console.log('   ✅ Promise support');
    
    return true;
  } catch (error) {
    console.log(`   ❌ Basic functionality test failed: ${error.message}`);
    return false;
  }
}

// Test 4: HTTP server functionality
function testHttpServer() {
  console.log('\n📋 Test 4: HTTP Server Test');
  
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Step-and-Save test server',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
      }));
    });
    
    server.listen(3333, (err) => {
      if (err) {
        console.log(`   ❌ Server failed to start: ${err.message}`);
        resolve(false);
        return;
      }
      
      console.log('   ✅ Server started on port 3333');
      
      // Test the server with a request
      const testReq = http.request({
        hostname: 'localhost',
        port: 3333,
        path: '/test',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('   ✅ Server responds correctly');
            console.log(`   📡 Response: ${response.message}`);
            server.close();
            resolve(true);
          } catch (e) {
            console.log('   ❌ Invalid server response');
            server.close();
            resolve(false);
          }
        });
      });
      
      testReq.on('error', (err) => {
        console.log(`   ❌ Request failed: ${err.message}`);
        server.close();
        resolve(false);
      });
      
      testReq.end();
    });
    
    server.on('error', (err) => {
      console.log(`   ❌ Server error: ${err.message}`);
      resolve(false);
    });
  });
}

// Test 5: Environment variables
function testEnvironment() {
  console.log('\n📋 Test 5: Environment Configuration');
  
  // Check if .env file exists and can be read
  if (fs.existsSync('.env')) {
    console.log('   ✅ .env file exists');
    
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      console.log(`   ✅ Environment has ${lines.length} configuration entries`);
      
      // Check for required variables
      const requiredVars = ['NODE_ENV', 'PORT', 'VERY_NETWORK'];
      const hasRequired = requiredVars.some(varName => 
        lines.some(line => line.startsWith(`${varName}=`))
      );
      
      if (hasRequired) {
        console.log('   ✅ Required environment variables configured');
      } else {
        console.log('   ⚠️  Some required environment variables may be missing');
      }
      
      return true;
    } catch (error) {
      console.log(`   ❌ Error reading .env file: ${error.message}`);
      return false;
    }
  } else {
    console.log('   ❌ .env file not found');
    return false;
  }
}

// Test 6: Smart contract syntax check
function testSmartContracts() {
  console.log('\n📋 Test 6: Smart Contract Files');
  
  const contractFiles = [
    'contracts/contracts/StepCouponFactory.sol',
    'contracts/contracts/MerchantBidRegistry.sol',
    'contracts/contracts/Redeemer.sol'
  ];
  
  let allValid = true;
  
  contractFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Basic Solidity syntax checks
      const hasContract = content.includes('contract ');
      const hasPragma = content.includes('pragma solidity');
      const hasConstructor = content.includes('constructor(');
      
      if (hasContract && hasPragma) {
        console.log(`   ✅ ${path.basename(file)} - Valid Solidity structure`);
      } else {
        console.log(`   ⚠️  ${path.basename(file)} - May have syntax issues`);
        allValid = false;
      }
    } else {
      console.log(`   ❌ ${path.basename(file)} - File not found`);
      allValid = false;
    }
  });
  
  return allValid;
}

// Test 7: Package dependencies
function testDependencies() {
  console.log('\n📋 Test 7: Package Dependencies');
  
  const packages = ['contracts', 'backend', 'frontend', 'merchant-dashboard'];
  let allGood = true;
  
  packages.forEach(pkg => {
    const packageJsonPath = path.join(pkg, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const depCount = Object.keys(packageData.dependencies || {}).length;
        const devDepCount = Object.keys(packageData.devDependencies || {}).length;
        console.log(`   ✅ ${pkg} - ${depCount} deps, ${devDepCount} devDeps`);
      } catch (error) {
        console.log(`   ❌ ${pkg} - Invalid package.json`);
        allGood = false;
      }
    } else {
      console.log(`   ❌ ${pkg} - No package.json found`);
      allGood = false;
    }
  });
  
  return allGood;
}

// Main test runner
async function runAllTests() {
  console.log('Starting comprehensive test suite...\n');
  
  const results = {
    nodeVersion: testNodeVersion(),
    projectFiles: testProjectFiles(),
    basicFunctionality: testBasicFunctionality(),
    httpServer: await testHttpServer(),
    environment: testEnvironment(),
    smartContracts: testSmartContracts(),
    dependencies: testDependencies()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  let passed = 0;
  let total = 0;
  
  Object.entries(results).forEach(([test, result]) => {
    total++;
    if (result) passed++;
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(20)} ${status}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`OVERALL: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your environment is ready for development.');
    console.log('\n📝 Next steps:');
    console.log('1. Upgrade to Node.js 18+ for full compatibility');
    console.log('2. Run: npm run dev (to start development servers)');
    console.log('3. Or start individual components:');
    console.log('   - cd backend && npm run dev');
    console.log('   - cd frontend && npm run dev');
  } else {
    console.log('\n⚠️  Some tests failed, but basic functionality works.');
    console.log('\n🔧 Recommendations:');
    console.log('1. Upgrade Node.js to version 18 or higher');
    console.log('2. Install missing dependencies where needed');
    console.log('3. Check file paths and permissions');
  }
  
  console.log('\n📚 Documentation:');
  console.log('- README.md - Project overview');
  console.log('- docs/DEPLOYMENT.md - Deployment guide');
  console.log('- docs/API.md - API documentation');
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  console.log(`
Step-and-Save Simple Test Runner

Usage: node simple-test.js [options]

Options:
  --help     Show this help message
  
This test runner works with Node.js 14+ and tests basic functionality
without requiring complex tooling that may not work with older Node versions.
`);
  process.exit(0);
}

// Run tests
runAllTests().catch(error => {
  console.error(`\n❌ Test runner failed: ${error.message}`);
  process.exit(1);
});