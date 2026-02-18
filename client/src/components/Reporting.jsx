import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Calendar, Filter, TrendingUp, AlertTriangle,
  CheckCircle, Clock, MapPin, BarChart3, PieChart, RefreshCw, Eye
} from 'lucide-react';

export default function Reporting() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [includeSections, setIncludeSections] = useState({
    overview: true,
    incidents: true,
    alerts: true,
    analytics: true,
    cameras: true,
  });

  const [generatedReports, setGeneratedReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadGeneratedReports();
  }, []);

  const loadGeneratedReports = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`);
      const data = await response.json();
      
      if (data.success) {
        setGeneratedReports(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      // Mock data for now
      setGeneratedReports([
        {
          id: 1,
          name: 'Weekly Summary Report',
          type: 'summary',
          dateRange: 'Feb 5 - Feb 11, 2024',
          generatedAt: '2024-02-11 15:30:00',
          generatedBy: 'admin',
          fileSize: '2.3 MB',
          status: 'completed',
        },
        {
          id: 2,
          name: 'Monthly Detailed Report',
          type: 'detailed',
          dateRange: 'January 2024',
          generatedAt: '2024-02-01 10:00:00',
          generatedBy: 'admin',
          fileSize: '5.1 MB',
          status: 'completed',
        },
      ]);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    try {
      const params = {
        reportType,
        dateRange,
        customStartDate,
        customEndDate,
        includeSections,
        generatedBy: 'admin',
        generatedAt: new Date().toISOString(),
      };

      // Try to call backend API
      let reportCreated = false;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        const data = await response.json();

        if (data.success) {
          setReportData(data.data);
          reportCreated = true;
          alert('Report generated and saved to database!');
          loadGeneratedReports();
        }
      } catch (apiError) {
        console.log('Backend API not available, generating client-side report');
      }

      // Fallback: Create report locally if API not available
      if (!reportCreated) {
        const newReport = {
          id: Date.now(),
          name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
          type: reportType,
          dateRange: getDateRangeDisplay(),
          generatedAt: new Date().toISOString(),
          generatedBy: 'admin',
          fileSize: '1.2 MB',
          status: 'completed',
        };

        // Add to existing reports at the beginning
        setGeneratedReports(prev => [newReport, ...prev]);
        setReportData(newReport);
        
        alert('Report generated successfully! (Note: Backend not connected, report not saved to database)');
      }
      
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      window.open(`${import.meta.env.VITE_API_URL}/api/reports/${reportId}/download`, '_blank');
      alert('Download started!');
    } catch (err) {
      console.error('Failed to download report:', err);
      alert('Failed to download report');
    }
  };

  const getDateRangeDisplay = () => {
    switch(dateRange) {
      case 'today':
        return new Date().toLocaleDateString();
      case 'week':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return `${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`;
      case 'month':
        return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'custom':
        return `${customStartDate} - ${customEndDate}`;
      default:
        return 'Select date range';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reporting</h1>
            <p className="text-gray-600 mt-2">Generate and manage incident reports</p>
          </div>
          
          <button
            onClick={loadGeneratedReports}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Report Configuration
            </h2>

            {/* Report Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="custom">Custom Report</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {reportType === 'summary' && 'High-level overview with key metrics'}
                {reportType === 'detailed' && 'Complete incident data with analysis'}
                {reportType === 'custom' && 'Choose specific sections to include'}
              </p>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>

              {dateRange === 'custom' && (
                <div className="mt-3 space-y-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="End Date"
                  />
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">
                {getDateRangeDisplay()}
              </p>
            </div>

            {/* Include Sections */}
            {reportType === 'custom' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Sections
                </label>
                <div className="space-y-2">
                  {Object.keys(includeSections).map((section) => (
                    <label key={section} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeSections[section]}
                        onChange={(e) => setIncludeSections({
                          ...includeSections,
                          [section]: e.target.checked
                        })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {section}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Generate Report
                </>
              )}
            </button>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Preview</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{reportType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span className="font-medium text-xs">{getDateRangeDisplay()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Reports List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} />
                Generated Reports
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                View and download previously generated reports
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {generatedReports.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No reports generated yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Configure and generate your first report using the panel on the left
                  </p>
                </div>
              ) : (
                generatedReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="text-indigo-600" size={24} />
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {report.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {report.dateRange}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{new Date(report.generatedAt).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{report.fileSize}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              report.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDownloadReport(report.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Report Types Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="text-blue-600" size={20} />
                <h3 className="font-semibold text-blue-900">Summary Report</h3>
              </div>
              <p className="text-sm text-blue-700">
                Quick overview with key metrics, trends, and highlights
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-purple-600" size={20} />
                <h3 className="font-semibold text-purple-900">Detailed Report</h3>
              </div>
              <p className="text-sm text-purple-700">
                Complete incident logs, analytics, and detailed breakdowns
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="text-green-600" size={20} />
                <h3 className="font-semibold text-green-900">Custom Report</h3>
              </div>
              <p className="text-sm text-green-700">
                Choose specific sections and data points to include
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}