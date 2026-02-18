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

  /**
   * Get peak hours data
   * GET /api/analytics/peak-hours
   */
  async getPeakHours(req, res, next) {
    try {
      const peakHours = await Analytics.getPeakHours();

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
   * GET /api/analytics/locations
   */
  async getLocationAnalytics(req, res, next) {
    try {
      const locations = await Analytics.getLocationAnalytics();

      const formattedData = locations.map(loc => ({
        location: loc.location,
        incidents: parseInt(loc.incidents),
        percentage: parseInt(loc.percentage),
        trend: 'stable', // Can be enhanced with historical comparison
      }));

      res.json({
        success: true,
        data: formattedData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get bullying statistics for dashboard card
   * GET /api/analytics/bullying-stats
   */
  async getBullyingStats(req, res, next) {
    try {
      const recentIncidents = await Incident.findRecent(100);
      const pendingIncidents = recentIncidents.filter(i => i.status === 'pending');

      // Calculate trend (simplified - comparing this week to last week)
      const thisWeekIncidents = recentIncidents.filter(i => {
        const incidentDate = new Date(i.detected_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return incidentDate >= weekAgo;
      }).length;

      const lastWeekIncidents = recentIncidents.filter(i => {
        const incidentDate = new Date(i.detected_at);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return incidentDate >= twoWeeksAgo && incidentDate < weekAgo;
      }).length;

      const percentageChange = lastWeekIncidents > 0 
        ? Math.abs(Math.round(((thisWeekIncidents - lastWeekIncidents) / lastWeekIncidents) * 100))
        : 0;

      const trend = thisWeekIncidents < lastWeekIncidents ? 'down' : 'up';

      res.json({
        success: true,
        data: {
          count: pendingIncidents.length,
          location: 'area CCTV',
          percentageChange,
          trend,
          comparisonPeriod: 'since last week',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();