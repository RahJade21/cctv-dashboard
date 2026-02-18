const Alert = require('../models/Alert');

class AlertController {
  /**
   * Get all active alerts
   * GET /api/alerts
   */
  async getActiveAlerts(req, res, next) {
    try {
      const alerts = await Alert.findActive();

      // Format for frontend
      const formattedAlerts = alerts.map(alert => ({
        id: alert.id,
        cctvId: alert.camera_id,
        cctvName: alert.camera_name,
        message: alert.message,
        time: alert.created_at,
        type: alert.alert_type,
        status: alert.alert_type === 'critical' ? 'CRITICAL' : 'WARNING',
        severity: alert.severity,
        borderColor: alert.alert_type === 'critical' ? 'red-500' : 'yellow-500',
        bgColor: alert.alert_type === 'critical' ? 'red-500' : 'yellow-500',
        incidentId: alert.incident_id,
        dismissed: alert.dismissed,
      }));

      res.json({
        success: true,
        data: formattedAlerts,
        count: formattedAlerts.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all alerts (including dismissed)
   * GET /api/alerts/all
   */
  async getAllAlerts(req, res, next) {
    try {
      const alerts = await Alert.findAll();

      res.json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dismiss an alert
   * POST /api/alerts/:id/dismiss
   */
  async dismissAlert(req, res, next) {
    try {
      const { id } = req.params;
      const { dismissedBy } = req.body;

      const alert = await Alert.dismiss(id, dismissedBy || 'user');

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found',
        });
      }

      res.json({
        success: true,
        message: 'Alert dismissed successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new alert
   * POST /api/alerts
   */
  async createAlert(req, res, next) {
    try {
      const alertData = req.body;

      const alert = await Alert.create(alertData);

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();