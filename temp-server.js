
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
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
