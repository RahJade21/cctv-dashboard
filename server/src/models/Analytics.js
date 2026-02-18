const db = require('../config/database');

class Analytics {
  /**
   * Get today's hourly analytics
   */
  static async getTodayHourly() {
    const result = await db.query(
      `SELECT 
        TO_CHAR(CURRENT_DATE + (h.hour || ' hours')::interval, 'HH24:MI') as hour,
        COALESCE(SUM(a.total_incidents), 0)::integer as incidents,
        COALESCE(SUM(a.resolved_incidents), 0)::integer as resolved,
        COALESCE(SUM(a.pending_incidents), 0)::integer as pending
       FROM generate_series(0, 23) as h(hour)
       LEFT JOIN analytics a ON a.hour = h.hour AND a.date = CURRENT_DATE
       GROUP BY h.hour
       ORDER BY h.hour`
    );
    return result.rows;
  }

  /**
   * Get weekly analytics (last 7 days)
   */
  static async getWeekly() {
    const result = await db.query(
      `SELECT 
        TO_CHAR(date, 'Dy') as day,
        date,
        SUM(total_incidents)::integer as incidents,
        SUM(resolved_incidents)::integer as resolved,
        SUM(pending_incidents)::integer as pending,
        SUM(false_positives)::integer as falsePositives
       FROM analytics
       WHERE date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY date
       ORDER BY date ASC`
    );
    return result.rows;
  }

  /**
   * Get monthly analytics (grouped by week)
   */
  static async getMonthly() {
    const result = await db.query(
      `SELECT 
        'Week ' || EXTRACT(WEEK FROM date)::text as week,
        MIN(date)::text || ' - ' || MAX(date)::text as dateRange,
        SUM(total_incidents) as incidents,
        SUM(resolved_incidents) as resolved,
        SUM(pending_incidents) as pending,
        SUM(false_positives) as falsePositives
       FROM analytics
       WHERE date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY EXTRACT(WEEK FROM date)
       ORDER BY EXTRACT(WEEK FROM date) ASC`
    );
    return result.rows;
  }

  /**
   * Get detection statistics summary with comparison
   */
  static async getDetectionStats() {
    // Get current period stats
    const currentStats = await db.query(
      `SELECT 
        COUNT(*) as total_detections,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_incidents,
        COUNT(CASE WHEN status = 'false_positive' THEN 1 END) as false_positives,
        ROUND(AVG(confidence_score), 2) as avg_confidence,
        ROUND(
          (COUNT(CASE WHEN status != 'false_positive' THEN 1 END)::DECIMAL / 
           NULLIF(COUNT(*), 0) * 100), 2
        ) as accuracy_rate
       FROM incidents
       WHERE detected_at >= CURRENT_DATE - INTERVAL '7 days'`
    );

    // Get previous period stats (7-14 days ago)
    const previousStats = await db.query(
      `SELECT 
        COUNT(*) as total_detections,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_incidents
       FROM incidents
       WHERE detected_at >= CURRENT_DATE - INTERVAL '14 days'
         AND detected_at < CURRENT_DATE - INTERVAL '7 days'`
    );

    const current = currentStats.rows[0];
    const previous = previousStats.rows[0];

    // Calculate percentage changes
    const totalChange = previous.total_detections > 0
      ? Math.round(((current.total_detections - previous.total_detections) / previous.total_detections) * 100)
      : 0;

    const resolvedChange = previous.resolved_incidents > 0
      ? Math.round(((current.resolved_incidents - previous.resolved_incidents) / previous.resolved_incidents) * 100)
      : 0;

    return {
      totalDetections: parseInt(current.total_detections) || 0,
      resolvedIncidents: parseInt(current.resolved_incidents) || 0,
      falsePositives: parseInt(current.false_positives) || 0,
      accuracyRate: parseFloat(current.accuracy_rate) || 0,
      avgConfidence: parseFloat(current.avg_confidence) || 0,
      totalChange: totalChange,
      totalTrend: totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable',
      resolvedChange: resolvedChange,
      resolvedTrend: resolvedChange > 0 ? 'up' : resolvedChange < 0 ? 'down' : 'stable',
    };
  }

  /**
   * Get peak hours data
   */
  static async getPeakHours() {
    const result = await db.query(
      `SELECT 
        CASE 
          WHEN a.hour BETWEEN 8 AND 11 THEN 'Morning (8AM-12PM)'
          WHEN a.hour BETWEEN 12 AND 15 THEN 'Afternoon (12PM-4PM)'
          WHEN a.hour BETWEEN 16 AND 19 THEN 'Evening (4PM-8PM)'
          ELSE 'Night (8PM-12AM)'
        END as period,
        SUM(a.total_incidents)::integer as incidents
       FROM analytics a
       WHERE a.date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY 
        CASE 
          WHEN a.hour BETWEEN 8 AND 11 THEN 'Morning (8AM-12PM)'
          WHEN a.hour BETWEEN 12 AND 15 THEN 'Afternoon (12PM-4PM)'
          WHEN a.hour BETWEEN 16 AND 19 THEN 'Evening (4PM-8PM)'
          ELSE 'Night (8PM-12AM)'
        END
       ORDER BY 
        MIN(CASE 
          WHEN a.hour BETWEEN 8 AND 11 THEN 1
          WHEN a.hour BETWEEN 12 AND 15 THEN 2
          WHEN a.hour BETWEEN 16 AND 19 THEN 3
          ELSE 4
        END)`
    );
    return result.rows;
  }

  /**
   * Get location-based analytics
   */
  static async getLocationAnalytics() {
    const result = await db.query(
      `SELECT 
        c.location,
        COUNT(i.id) as incidents,
        ROUND((COUNT(i.id)::DECIMAL / 
          NULLIF((SELECT COUNT(*) FROM incidents), 0) * 100), 0) as percentage
       FROM cameras c
       LEFT JOIN incidents i ON c.id = i.camera_id
       GROUP BY c.location
       HAVING COUNT(i.id) > 0
       ORDER BY incidents DESC
       LIMIT 5`
    );
    return result.rows;
  }

  /**
   * Insert analytics record
   */
  static async insert(analyticsData) {
    const { date, camera_id, hour, total_incidents, resolved_incidents, pending_incidents, false_positives, avg_confidence } = analyticsData;

    const result = await db.query(
      `INSERT INTO analytics 
       (date, camera_id, hour, total_incidents, resolved_incidents, pending_incidents, false_positives, avg_confidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (date, camera_id, hour) 
       DO UPDATE SET
         total_incidents = EXCLUDED.total_incidents,
         resolved_incidents = EXCLUDED.resolved_incidents,
         pending_incidents = EXCLUDED.pending_incidents,
         false_positives = EXCLUDED.false_positives,
         avg_confidence = EXCLUDED.avg_confidence
       RETURNING *`,
      [date, camera_id, hour, total_incidents, resolved_incidents, pending_incidents, false_positives, avg_confidence]
    );

    return result.rows[0];
  }
}

module.exports = Analytics;