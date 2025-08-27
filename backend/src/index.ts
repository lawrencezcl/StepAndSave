import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import stepRoutes from './routes/steps.js';
import couponRoutes from './routes/coupons.js';
import merchantRoutes from './routes/merchants.js';
import relayerRoutes from './routes/relayer.js';
import webhookRoutes from './routes/webhooks.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Import services
import { RelayerService } from './services/relayer/RelayerService.js';
import { GeofencingService } from './services/geofencing/GeofencingService.js';
import { WebSocketService } from './services/WebSocketService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(limiter); // Rate limiting
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/steps', authMiddleware, stepRoutes);
app.use('/api/coupons', authMiddleware, couponRoutes);
app.use('/api/merchants', authMiddleware, merchantRoutes);
app.use('/api/relayer', authMiddleware, relayerRoutes);
app.use('/api/webhooks', webhookRoutes); // No auth middleware for webhooks

// WebSocket handling
const wsService = new WebSocketService(wss);

// Initialize services
const relayerService = new RelayerService();
const geofencingService = new GeofencingService();

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Step-and-Save Backend Server started on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Local'}`);
  console.log(`🔗 VERY Network: ${process.env.VERY_NETWORK || 'testnet'}`);
  
  // Initialize services after server starts
  relayerService.initialize();
  geofencingService.initialize();
  
  console.log('✅ All services initialized successfully');
});

export default app;