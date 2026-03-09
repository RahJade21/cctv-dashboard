const Analytics = require('../models/Analytics');
const Incident = require('../models/Incident');

class AnalyticsController {
  /**
   * Get analytics data based on timeframe
   * GET /api/analytics?timeframe=today|weekly|monthly
   */
  async getAnalytics(req, res, next) {
    try {
      const { timeframe = 'today' } = req.query;

      let data;
      switch (timeframe) {
        case 'today':
          data = await Analytics.getTodayHourly();
          break;
        case 'weekly':
          data = await Analytics.getWeekly();
          break;
        case 'monthly':
          data = await Analytics.getMonthly();
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid timeframe. Use: today, weekly, or monthly',
          });
      }

      res.json({
        success: true,
        timeframe,
        data,
        count: data.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detection statistics summary
   * GET /api/analytics/stats
   */
  async getDetectionStats(req, res, next) {
    try {
      const stats = await Analytics.getDetectionStats();
      const counts = await Incident.getCounts();

      // Combine stats with counts
      const detectionStats = {
        totalDetections: stats.totalDetections,
        bullyingIncidents: parseInt(counts.total) - parseInt(counts.false_positives) || 0,
        resolvedIncidents: stats.resolvedIncidents,
        pendingIncidents: parseInt(counts.pending) || 0,
        falsePositives: stats.falsePositives,
        accuracyRate: stats.accuracyRate,
        avgConfidence: stats.avgConfidence,
        // Comparison data
        totalChange: stats.totalChange,
        totalTrend: stats.totalTrend,
        resolvedChange: stats.resolvedChange,
        resolvedTrend: stats.resolvedTrend,
      };

      res.json({
        success: true,
        data: detectionStats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update these methods in backend/src/controllers/analyticsController.js

  /**
   * Get peak hours data
   * GET /api/analytics/peak-hours?timeframe=today|weekly|monthly
   */
  async getPeakHours(req, res, next) {
    try {
      const { timeframe = 'weekly' } = req.query;  // ← Accept timeframe parameter
      const peakHours = await Analytics.getPeakHours(timeframe);  // ← Pass to model

      // Format for frontend
      const formattedData = peakHours.reduce((acc, row) => {
        const key = row.period.toLowerCase().split(' ')[0]; // 'morning', 'afternoon', etc.
        acc[key] = {
          label: row.period,
          incidents: parseInt(row.incidents) || 0,
        };
        return acc;
      }, {});

      res.json({
        success: true,
        data: formattedData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get location-based analytics
   * GET /api/analytics/locations?timeframe=today|weekly|monthly
   */
  async getLocationAnalytics(req, res, next) {
    try {
      const { timeframe = 'weekly' } = req.query;  // ← Accept timeframe parameter
      const locations = await Analytics.getLocationAnalytics(timeframe);  // ← Pass to model

      // No need to format - model already returns correct format with trends
      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bullying statistics with filters for dashboard card
   * GET /api/analytics/bullying-stats?location=Front+Hall&timeframe=today
   */
  async getBullyingStats(req, res, next) {
    try {
      const { location, dateRange = 'today' } = req.query;
      
      const db = require('../config/database');
      
      // Build date filter with timezone consideration
      let dateFilter = '';
      let comparisonDateFilter = '';
      
      // Normalize timeframe parameter to support both formats (today/yesterday/week/month and weekly/monthly)
      let normalizedTimeframe = dateRange;
      if (dateRange === 'weekly') normalizedTimeframe = 'week';
      if (dateRange === 'monthly') normalizedTimeframe = 'month';
      
      switch(normalizedTimeframe) {
        case 'today':
          // Use DATE() to compare dates, not timestamps
          dateFilter = `DATE(detected_at) = CURRENT_DATE`;
          comparisonDateFilter = `DATE(detected_at) = CURRENT_DATE - INTERVAL '1 day'`;
          break;
        case 'yesterday':
          dateFilter = `DATE(detected_at) = CURRENT_DATE - INTERVAL '1 day'`;
          comparisonDateFilter = `DATE(detected_at) = CURRENT_DATE - INTERVAL '2 days'`;
          break;
        case 'week':
          dateFilter = `DATE(detected_at) >= CURRENT_DATE - INTERVAL '7 days'`;
          comparisonDateFilter = `DATE(detected_at) >= CURRENT_DATE - INTERVAL '14 days' AND DATE(detected_at) < CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateFilter = `DATE(detected_at) >= CURRENT_DATE - INTERVAL '30 days'`;
          comparisonDateFilter = `DATE(detected_at) >= CURRENT_DATE - INTERVAL '60 days' AND DATE(detected_at) < CURRENT_DATE - INTERVAL '30 days'`;
          break;
        default:
          dateFilter = `DATE(detected_at) = CURRENT_DATE`;
          comparisonDateFilter = `DATE(detected_at) = CURRENT_DATE - INTERVAL '1 day'`;
      }
      
      // Build location filter
      let locationJoin = '';
      let locationFilter = '';
      if (location && location !== 'all') {
        locationJoin = `LEFT JOIN cameras c ON i.camera_id = c.id`;
        locationFilter = `AND c.location = $1`;
      }
      
      // Get current period stats
      const currentQuery = `
        SELECT COUNT(*) as total_incidents
        FROM incidents i
        ${locationJoin}
        WHERE ${dateFilter} ${locationFilter}
      `;
      
      const currentParams = (location && location !== 'all') ? [location] : [];
      const currentResult = await db.query(currentQuery, currentParams);
      const totalIncidents = parseInt(currentResult.rows[0].total_incidents) || 0;
      
      // Get comparison period stats
      const comparisonQuery = `
        SELECT COUNT(*) as total_incidents
        FROM incidents i
        ${locationJoin}
        WHERE ${comparisonDateFilter} ${locationFilter}
      `;
      
      const comparisonResult = await db.query(comparisonQuery, currentParams);
      const comparisonIncidents = parseInt(comparisonResult.rows[0].total_incidents) || 0;
      
      // Calculate percentage change
      let percentageChange = 0;
      let trend = 'stable';
      
      if (comparisonIncidents > 0) {
        percentageChange = Math.round(((totalIncidents - comparisonIncidents) / comparisonIncidents) * 100);
        trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable';
      } else if (totalIncidents > 0) {
        percentageChange = 100;
        trend = 'up';
      }
      
      res.json({
        success: true,
        data: {
          totalIncidents,
          percentageChange: Math.abs(percentageChange),
          trend,
          comparison: {
            current: totalIncidents,
            previous: comparisonIncidents
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();