require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const cameraRoutes = require('./routes/cameras.routes');
const alertRoutes = require('./routes/alerts.routes');
const incidentRoutes = require('./routes/incidents.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes = require('./routes/reports.routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// ==================== Middleware ====================

// Security headers
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// ==================== Routes ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CCTV Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/cameras', cameraRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// ==================== Server Start ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   CCTV Bullying Detection API Server      ║
╠════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV?.padEnd(28)} ║
║  Port:        ${PORT.toString().padEnd(28)} ║
║  Frontend:    ${process.env.FRONTEND_URL?.padEnd(28)} ║
║  AWS Region:  ${process.env.AWS_REGION?.padEnd(28)} ║
║  S3 Bucket:   ${process.env.AWS_S3_BUCKET?.substring(0, 28).padEnd(28)} ║
╚════════════════════════════════════════════╝
  `);
  console.log('✅ Server is ready to accept requests');
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📹 Cameras API: http://localhost:${PORT}/api/cameras`);
  console.log(`🚨 Alerts API: http://localhost:${PORT}/api/alerts`);
  console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;