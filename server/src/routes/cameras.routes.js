const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/cameraController');

// GET /api/cameras - Get all cameras
router.get('/', cameraController.getAllCameras);

// GET /api/cameras/active - Get active cameras only
router.get('/active', cameraController.getActiveCameras);

// GET /api/cameras/:id - Get single camera
router.get('/:id', cameraController.getCameraById);

// PATCH /api/cameras/:id/status - Update camera status
router.patch('/:id/status', cameraController.updateCameraStatus);

// POST /api/cameras/preferences - Update camera preferences
router.post('/preferences', cameraController.updateCameraPreferences);

// GET /api/cameras/:id/stats - Get camera statistics
router.get('/:id/stats', cameraController.getCameraStats);

// GET /api/cameras/:id/incidents - Get camera incidents
router.get('/:id/incidents', cameraController.getCameraIncidents);

// GET /api/cameras/:id/alerts - Get camera alerts
router.get('/:id/alerts', cameraController.getCameraAlerts);

module.exports = router;