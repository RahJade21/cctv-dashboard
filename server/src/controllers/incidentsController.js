const Incident = require('../models/Incident');

class IncidentController {
  /**
   * Get all incidents with optional filters
   * GET /api/incidents?limit=100&offset=0
   */
  async getAllIncidents(req, res, next) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const incidents = await Incident.findAll(parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        data: incidents,
        count: incidents.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent incidents
   * GET /api/incidents/recent?limit=10
   */
  async getRecentIncidents(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      
      const incidents = await Incident.findRecent(parseInt(limit));

      res.json({
        success: true,
        data: incidents,
        count: incidents.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single incident by ID
   * GET /api/incidents/:id
   */
  async getIncidentById(req, res, next) {
    try {
      const { id } = req.params;
      
      const incident = await Incident.findById(id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found',
        });
      }

      res.json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update incident status
   * PATCH /api/incidents/:id/status
   * Body: { status: 'resolved', resolvedBy: 'admin', notes: '...' }
   */
  async updateIncidentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, resolvedBy, notes } = req.body;

      // Validate status
      const validStatuses = ['pending', 'resolved', 'false_positive'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const incident = await Incident.updateStatus(id, status, resolvedBy, notes);

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found',
        });
      }

      res.json({
        success: true,
        message: `Incident marked as ${status}`,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get incident counts by status
   * GET /api/incidents/stats/counts
   */
  async getIncidentCounts(req, res, next) {
    try {
      const counts = await Incident.getCounts();

      res.json({
        success: true,
        data: counts,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IncidentController();