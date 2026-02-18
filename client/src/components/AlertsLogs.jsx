import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, Filter, Search,
  Calendar, MapPin, RefreshCw, Eye, FileText, Download
} from 'lucide-react';

export default function AlertsLogs() {
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'logs'
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterType, setFilterType] = useState('all'); // all, critical, warning
  const [filterStatus, setFilterStatus] = useState('active'); // active, dismissed, all
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all'); // all, today, week, month

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filterStatus, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAlerts(),
        loadIncidents(),
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load alerts and logs');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const endpoint = filterStatus === 'all' 
        ? `${import.meta.env.VITE_API_URL}/api/alerts/all`
        : `${import.meta.env.VITE_API_URL}/api/alerts`;
        
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setAlerts([]);
    }
  };

  const loadIncidents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/incidents`);
      const data = await response.json();
      
      if (data.success) {
        setIncidents(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
      setIncidents([]);
    }
  };

  const handleResolveAlert = async (alertId, incidentId) => {
    const confirmed = window.confirm('Mark this alert as resolved? This will also update the incident status.');
    if (!confirmed) return;

    try {
      // Resolve the alert
      const alertResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissedBy: 'admin' }),
      });

      const alertData = await alertResponse.json();
      
      if (!alertData.success) {
        throw new Error(alertData.message || 'Failed to resolve alert');
      }

      // If there's an associated incident, resolve it too
      if (incidentId) {
        const incidentResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/incidents/${incidentId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'resolved',
            resolvedBy: 'admin',
            notes: 'Resolved from Alert & Logs page'
          }),
        });

        const incidentData = await incidentResponse.json();
        
        if (!incidentData.success) {
          console.error('Failed to update incident:', incidentData.message);
        }
      }
      
      // Show success message
      alert('Alert marked as resolved!');
      
      // Reload data
      loadData();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
      alert('Failed to resolve alert: ' + err.message);
    }
  };

  const handleDismissAlert = async (alertId) => {
    const confirmed = window.confirm('Dismiss this alert? It will be removed from the active list.');
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissedBy: 'admin' }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Alert dismissed successfully!');
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
      alert('Failed to dismiss alert: ' + err.message);
    }
  };

  const handleResolveIncident = async (incidentId) => {
    const notes = window.prompt('Add resolution notes (optional):');
    if (notes === null) return; // User cancelled

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'resolved',
          resolvedBy: 'admin',
          notes: notes || 'Resolved from Alert & Logs page'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Incident marked as resolved!');
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Failed to resolve incident:', err);
      alert('Failed to resolve incident: ' + err.message);
    }
  };

  const handleMarkFalsePositive = async (incidentId) => {
    const confirmed = window.confirm('Mark this incident as a false positive?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'false_positive',
          resolvedBy: 'admin',
          notes: 'Marked as false positive from Alert & Logs page'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Incident marked as false positive!');
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Failed to mark as false positive:', err);
      alert('Failed to update incident: ' + err.message);
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    // Filter by type
    if (filterType !== 'all' && alert.alert_type !== filterType) return false;
    
    // Filter by status
    if (filterStatus === 'active' && alert.dismissed) return false;
    if (filterStatus === 'dismissed' && !alert.dismissed) return false;
    
    // Filter by search query
    if (searchQuery && !alert.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by date
    if (selectedDate !== 'all') {
      const alertDate = new Date(alert.created_at);
      const now = new Date();
      
      switch(selectedDate) {
        case 'today':
          if (alertDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (alertDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (alertDate < monthAgo) return false;
          break;
      }
    }
    
    return true;
  });

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!incident.incident_type?.toLowerCase().includes(searchLower) &&
          !incident.camera_name?.toLowerCase().includes(searchLower) &&
          !incident.location?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filter by date
    if (selectedDate !== 'all') {
      const incidentDate = new Date(incident.detected_at);
      const now = new Date();
      
      switch(selectedDate) {
        case 'today':
          if (incidentDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (incidentDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (incidentDate < monthAgo) return false;
          break;
      }
    }
    
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const currentIncidents = filteredIncidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((activeTab === 'alerts' ? filteredAlerts : filteredIncidents).length / itemsPerPage);

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'false_positive':
        return <XCircle className="text-gray-500" size={20} />;
      default:
        return <AlertTriangle className="text-orange-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts and logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Alert & Logs</h1>
            <p className="text-gray-600 mt-2">Manage alerts and review incident logs</p>
          </div>
          
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      {/* Tabs */}
      <section>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Alerts ({filteredAlerts.filter(a => !a.dismissed).length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incident Logs ({filteredIncidents.length})
            </button>
          </nav>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search alerts or incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {activeTab === 'alerts' && (
            <>
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active Only</option>
                <option value="dismissed">Dismissed Only</option>
                <option value="all">All Alerts</option>
              </select>
            </>
          )}

          {/* Date Range */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>
      </section>

      {/* Content */}
      <section>
        {activeTab === 'alerts' ? (
          // Alerts List
          <div className="space-y-3">
            {currentAlerts.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No alerts found</p>
              </div>
            ) : (
              currentAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  style={{
                    borderLeft: `4px solid ${alert.alert_type === 'critical' ? '#ef4444' : '#eab308'}`
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.alert_type === 'critical' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.alert_type === 'critical' ? 'CRITICAL' : 'WARNING'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                        {alert.dismissed && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            Dismissed
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {alert.message}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{alert.camera_name || alert.cctvName || `Camera ${alert.camera_id}`}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {!alert.dismissed && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveAlert(alert.id, alert.incident_id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                        >
                          <CheckCircle size={16} />
                          Resolve
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 text-sm"
                        >
                          <XCircle size={16} />
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Incident Logs Table
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detected At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentIncidents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No incidents found
                      </td>
                    </tr>
                  ) : (
                    currentIncidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-800 capitalize">{incident.incident_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-800">{incident.camera_name || `Camera ${incident.camera_id}`}</div>
                            <div className="text-sm text-gray-500">{incident.location || 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${getSeverityColor(incident.severity)}-100 text-${getSeverityColor(incident.severity)}-700 capitalize`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {incident.confidence_score}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(incident.detected_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(incident.status)}
                            <span className="capitalize text-sm">{incident.status.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            {incident.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleResolveIncident(incident.id)}
                                  className="text-green-600 hover:text-green-800 font-medium"
                                >
                                  Resolve
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleMarkFalsePositive(incident.id)}
                                  className="text-orange-600 hover:text-orange-800 font-medium"
                                >
                                  False Positive
                                </button>
                              </>
                            )}
                            {incident.status !== 'pending' && (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </section>
      )}
    </div>
  );
}