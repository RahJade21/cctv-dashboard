import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Cctv, MapPin, Clock, Activity, AlertTriangle, 
  CheckCircle, XCircle, TrendingUp, Calendar, X 
} from 'lucide-react';
import CCTVVideoPlayer from './CCTVVideoPlayer';
import { fetchCameraById } from '../services/api';

export default function CameraDetails({ cameraId, onBack }) {
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, incidents, analytics

  // Mock data - will be replaced with API calls
  const [cameraStats, setCameraStats] = useState({
    totalIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0,
    avgConfidence: 0,
    lastIncident: null,
  });

  const [recentIncidents, setRecentIncidents] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    if (cameraId) {
      loadCameraDetails();
    }
  }, [cameraId]);

  const loadCameraDetails = async () => {
    try {
      setLoading(true);
      const cameraData = await fetchCameraById(cameraId);
      setCamera(cameraData);
      
      // TODO: Load camera-specific incidents and stats from API
      loadCameraStats();
      loadRecentIncidents();
      loadRecentAlerts();
      
    } catch (err) {
      console.error('Failed to load camera details:', err);
      setError('Failed to load camera details');
    } finally {
      setLoading(false);
    }
  };

  const loadCameraStats = async () => {
    // TODO: Replace with actual API call
    // For now using mock data
    setCameraStats({
      totalIncidents: 12,
      resolvedIncidents: 8,
      pendingIncidents: 4,
      avgConfidence: 85.5,
      lastIncident: '2 hours ago',
    });
  };

  const loadRecentIncidents = async () => {
    // TODO: Replace with actual API call
    // Mock data
    setRecentIncidents([
      {
        id: 1,
        type: 'Physical',
        severity: 'high',
        confidence: 87.5,
        detectedAt: '2024-02-11 10:30',
        status: 'pending',
        description: 'Physical altercation detected',
      },
      {
        id: 2,
        type: 'Verbal',
        severity: 'medium',
        confidence: 75.2,
        detectedAt: '2024-02-11 09:15',
        status: 'resolved',
        description: 'Verbal harassment observed',
      },
      {
        id: 3,
        type: 'Physical',
        severity: 'critical',
        confidence: 92.1,
        detectedAt: '2024-02-10 14:45',
        status: 'resolved',
        description: 'Multiple students involved',
      },
    ]);
  };

  const loadRecentAlerts = async () => {
    // TODO: Replace with actual API call
    setRecentAlerts([
      {
        id: 1,
        type: 'critical',
        message: 'Physical fight detected - immediate response',
        time: '2 hours ago',
        dismissed: false,
      },
      {
        id: 2,
        type: 'warning',
        message: 'Suspicious group gathering',
        time: '5 hours ago',
        dismissed: false,
      },
    ]);
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'orange';
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
          <p className="text-gray-600">Loading camera details...</p>
        </div>
      </div>
    );
  }

  if (error || !camera) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Camera Not Found</h3>
            <p className="text-red-600 text-sm mb-4">{error || 'Camera does not exist'}</p>
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section>
        <button
          onClick={() => onBack ? onBack() : window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{camera.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{camera.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <span className={`font-semibold text-${camera.statusColor}`}>
                  {camera.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cctv size={16} />
                <span>{camera.cameraId}</span>
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full ${
            camera.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <span className="font-semibold text-sm">● LIVE</span>
          </div>
        </div>
      </section>

      {/* Video Feed & Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Live Feed</h2>
            </div>
            <div className="aspect-video bg-gray-900">
              <CCTVVideoPlayer 
                videoUrl={camera.videoUrl}
                cameraName={camera.location}
                status={camera.status}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Total Incidents</h3>
            <p className="text-3xl font-bold text-gray-800">{cameraStats.totalIncidents}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{cameraStats.resolvedIncidents}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{cameraStats.pendingIncidents}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Avg Confidence</h3>
            <p className="text-3xl font-bold text-indigo-600">{cameraStats.avgConfidence}%</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'incidents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Incidents ({recentIncidents.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Alerts</h3>
              {recentAlerts.filter(a => !a.dismissed).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active alerts</p>
              ) : (
                <div className="space-y-2">
                  {recentAlerts.filter(a => !a.dismissed).map(alert => (
                    <div 
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      style={{
                        borderLeft: `4px solid ${alert.type === 'critical' ? '#ef4444' : '#eab308'}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle 
                          className={alert.type === 'critical' ? 'text-red-500' : 'text-yellow-500'} 
                          size={20} 
                        />
                        <div>
                          <p className="font-medium text-gray-800">{alert.message}</p>
                          <p className="text-sm text-gray-500">{alert.time}</p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Camera Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Camera Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Camera ID</p>
                  <p className="font-semibold text-gray-800">{camera.cameraId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-800">{camera.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold text-${camera.statusColor}`}>{camera.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Incident</p>
                  <p className="font-semibold text-gray-800">{cameraStats.lastIncident || 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-800">{incident.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${getSeverityColor(incident.severity)}-100 text-${getSeverityColor(incident.severity)}-700`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{incident.confidence}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {incident.detectedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(incident.status)}
                          <span className="capitalize text-sm">{incident.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{incident.description}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Incident Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Physical</span>
                  <span className="font-semibold">5 (42%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '42%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Verbal</span>
                  <span className="font-semibold">4 (33%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '33%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Social</span>
                  <span className="font-semibold">3 (25%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '25%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Trend</h3>
              <div className="flex items-center gap-4">
                <TrendingUp className="text-red-500" size={32} />
                <div>
                  <p className="text-3xl font-bold text-red-600">+15%</p>
                  <p className="text-sm text-gray-600">vs last week</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600 text-sm">
                Incidents increased from 10 to 12 this week
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}