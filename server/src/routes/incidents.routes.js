const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentsController');

// GET /api/incidents - Get all incidents
router.get('/', incidentController.getAllIncidents);

// GET /api/incidents/recent - Get recent incidents
router.get('/recent', incidentController.getRecentIncidents);

// GET /api/incidents/:id - Get single incident
router.get('/:id', incidentController.getIncidentById);

// PATCH /api/incidents/:id/status - Update incident status
router.patch('/:id/status', incidentController.updateIncidentStatus);

// GET /api/incidents/stats/counts - Get incident counts
router.get('/stats/counts', incidentController.getIncidentCounts);

module.exports = router;
