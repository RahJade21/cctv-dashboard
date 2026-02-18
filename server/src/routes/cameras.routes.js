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

module.exports = router;