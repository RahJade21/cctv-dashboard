const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET /api/alerts - Get active alerts only
router.get('/', alertController.getActiveAlerts);

// GET /api/alerts/all - Get all alerts (including dismissed)
router.get('/all', alertController.getAllAlerts);

// POST /api/alerts/:id/dismiss - Dismiss an alert
router.post('/:id/dismiss', alertController.dismissAlert);

// POST /api/alerts - Create new alert
router.post('/', alertController.createAlert);

module.exports = router;