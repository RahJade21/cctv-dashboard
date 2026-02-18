const Report = require('../models/Report');

class ReportController {
  async generateReport(req, res, next) {
    try {
      const { reportType, dateRange, generatedBy } = req.body;
      
      // Create report name based on type
      const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      
      // Get date range display
      let dateRangeDisplay = '';
      if (dateRange === 'today') {
        dateRangeDisplay = new Date().toLocaleDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        dateRangeDisplay = `${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`;
      } else if (dateRange === 'month') {
        dateRangeDisplay = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      // Save to database
      const report = await Report.create({
        name: reportName,
        type: reportType,
        dateRange: dateRangeDisplay,
        generatedBy: generatedBy || 'admin',
        fileSize: '1.2 MB',
      });
      
      res.json({
        success: true,
        message: 'Report generated successfully',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllReports(req, res, next) {
    try {
      const reports = await Report.findAll();
      
      res.json({
        success: true,
        data: reports,
        count: reports.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadReport(req, res, next) {
    try {
      // For now, just send a message
      // In production, generate/retrieve PDF here
      res.json({
        success: true,
        message: 'Download functionality to be implemented',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();