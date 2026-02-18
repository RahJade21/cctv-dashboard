const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics?timeframe=today|weekly|monthly - Get analytics data
router.get('/', analyticsController.getAnalytics);

// GET /api/analytics/stats - Get detection statistics
router.get('/stats', analyticsController.getDetectionStats);

// GET /api/analytics/peak-hours - Get peak hours data
router.get('/peak-hours', analyticsController.getPeakHours);

// GET /api/analytics/locations - Get location-based analytics
router.get('/locations', analyticsController.getLocationAnalytics);

// GET /api/analytics/bullying-stats - Get bullying stats for dashboard card
router.get('/bullying-stats', analyticsController.getBullyingStats);

module.exports = router;