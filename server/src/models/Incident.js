const db = require('../config/database');

class Incident {
  /**
   * Get single incident by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT i.*, c.name as camera_name, c.location
       FROM incidents i
       LEFT JOIN cameras c ON i.camera_id = c.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all incidents with pagination
   */
  static async findAll(limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT i.*, c.name as camera_name, c.location, c.camera_id
       FROM incidents i
       LEFT JOIN cameras c ON i.camera_id = c.id
       ORDER BY i.detected_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Get incidents by status
   */
  static async findByStatus(status) {
    const result = await db.query(
      `SELECT i.*, c.name as camera_name, c.location
       FROM incidents i
       LEFT JOIN cameras c ON i.camera_id = c.id
       WHERE i.status = $1
       ORDER BY i.detected_at DESC`,
      [status]
    );
    return result.rows;
  }

  /**
   * Get recent incidents (last N)
   */
  static async findRecent(limit = 10) {
    const result = await db.query(
      `SELECT i.*, c.name as camera_name, c.location, c.camera_id
       FROM incidents i
       LEFT JOIN cameras c ON i.camera_id = c.id
       ORDER BY i.detected_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  /**
   * Get incident counts by status
   */
  static async getCounts() {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'false_positive' THEN 1 END) as false_positives
       FROM incidents`
    );
    return result.rows[0];
  }

  /**
   * Create new incident
   */
  static async create(incidentData) {
    const {
      camera_id,
      incident_type,
      severity,
      confidence_score,
      detected_at,
      video_clip_key,
      thumbnail_key,
    } = incidentData;

    const result = await db.query(
      `INSERT INTO incidents 
       (camera_id, incident_type, severity, confidence_score, detected_at, video_clip_key, thumbnail_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [camera_id, incident_type, severity, confidence_score, detected_at, video_clip_key, thumbnail_key]
    );

    return result.rows[0];
  }

  /**
   * Update incident status
   */
  static async updateStatus(id, status, resolvedBy = null, notes = null) {
    const incidentId = parseInt(id, 10);
    
    const result = await db.query(
      `UPDATE incidents 
       SET status = $1,
           resolved_by = $2,
           notes = $3,
           resolved_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, resolvedBy, notes, incidentId]
    );
    return result.rows[0];
  }
}

module.exports = Incident;