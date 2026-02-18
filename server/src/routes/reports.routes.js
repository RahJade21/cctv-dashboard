const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// POST /api/reports/generate - Generate new report
router.post('/generate', reportController.generateReport);

// GET /api/reports - Get all reports
router.get('/', reportController.getAllReports);

// GET /api/reports/:id/download - Download report PDF
router.get('/:id/download', reportController.downloadReport);

module.exports = router;