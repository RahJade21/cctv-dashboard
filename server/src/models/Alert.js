const db = require('../config/database');

class Alert {
  /**
   * Get all active alerts (not dismissed)
   */
  static async findActive() {
    const result = await db.query(
      `SELECT a.*, i.incident_type, i.severity, i.confidence_score,
              c.name as camera_name, c.camera_id, c.location
       FROM alerts a
       LEFT JOIN incidents i ON a.incident_id = i.id
       LEFT JOIN cameras c ON a.camera_id = c.id
       WHERE a.dismissed = false
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get all alerts (including dismissed)
   */
  static async findAll() {
    const result = await db.query(
      `SELECT a.*, i.incident_type, i.severity,
              c.name as camera_name, c.camera_id
       FROM alerts a
       LEFT JOIN incidents i ON a.incident_id = i.id
       LEFT JOIN cameras c ON a.camera_id = c.id
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Create new alert
   */
  static async create(alertData) {
    const { incident_id, camera_id, alert_type, message } = alertData;

    const result = await db.query(
      `INSERT INTO alerts (incident_id, camera_id, alert_type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [incident_id, camera_id, alert_type, message]
    );

    return result.rows[0];
  }

  /**
   * Dismiss alert
   */
  static async dismiss(id, dismissedBy = 'system') {
    const result = await db.query(
      `UPDATE alerts 
       SET dismissed = true, dismissed_by = $1, dismissed_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [dismissedBy, id]
    );
    return result.rows[0];
  }

  /**
   * Dismiss multiple alerts
   */
  static async dismissMultiple(ids) {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await db.query(
      `UPDATE alerts 
       SET dismissed = true, dismissed_at = CURRENT_TIMESTAMP
       WHERE id IN (${placeholders})
       RETURNING *`,
      ids
    );
    return result.rows;
  }
}

module.exports = Alert;