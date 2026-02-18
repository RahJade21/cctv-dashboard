import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import {
  fetchAnalytics,
  fetchDetectionStats,
  fetchPeakHours,
  fetchLocationAnalytics,
} from '../services/api';

export default function Analytics() {
  const [activeTimeframe, setActiveTimeframe] = useState('today'); // 'today', 'weekly', 'monthly'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for all data
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    bullyingIncidents: 0,
    resolvedIncidents: 0,
    pendingIncidents: 0,
    falsePositives: 0,
    accuracyRate: 0,
    totalChange: 0,
    totalTrend: 'stable',
    resolvedChange: 0,
    resolvedTrend: 'stable',
  });
  const [peakHours, setPeakHours] = useState({});
  const [chartData, setChartData] = useState([]);
  const [locationData, setLocationData] = useState([]);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload chart when timeframe changes
  useEffect(() => {
    loadChartData();
  }, [activeTimeframe]);

  const loadAllData = async () => {
    await Promise.all([
      loadDetectionStats(),
      loadPeakHours(),
      loadChartData(),
      loadLocationData(),
    ]);
  };

  const loadDetectionStats = async () => {
    try {
      const stats = await fetchDetectionStats();
      setDetectionStats(stats);
    } catch (err) {
      console.error('Failed to load detection stats:', err);
    }
  };

  const loadPeakHours = async () => {
    try {
      const hours = await fetchPeakHours();
      setPeakHours(hours);
    } catch (err) {
      console.error('Failed to load peak hours:', err);
    }
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalytics(activeTimeframe);
      setChartData(data);
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationData = async () => {
    try {
      const locations = await fetchLocationAnalytics();
      setLocationData(locations);
    } catch (err) {
      console.error('Failed to load location data:', err);
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      {/* Header with Timeframe Selector */}
      <section>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-600 mt-2">Detailed analysis and insights</p>
          </div>
          
          {/* Timeframe Toggle */}
          <div className="inline-flex rounded-lg shadow-sm bg-white border border-gray-300" role="group">
            <button
              onClick={() => setActiveTimeframe('today')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-l-lg transition-colors ${
                activeTimeframe === 'today'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTimeframe('weekly')}
              className={`px-6 py-2.5 text-sm font-semibold border-l border-gray-300 transition-colors ${
                activeTimeframe === 'weekly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveTimeframe('monthly')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-r-lg border-l border-gray-300 transition-colors ${
                activeTimeframe === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      {/* Key Metrics Cards */}
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Total Incidents */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
              <h3 className="text-3xl font-bold text-gray-800">{detectionStats.totalDetections}</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {detectionStats.totalTrend === 'up' && (
              <>
                <TrendingUp size={16} className="text-red-500" />
                <span className="text-sm text-red-600 font-semibold">+{detectionStats.totalChange}%</span>
              </>
            )}
            {detectionStats.totalTrend === 'down' && (
              <>
                <TrendingDown size={16} className="text-green-500" />
                <span className="text-sm text-green-600 font-semibold">{detectionStats.totalChange}%</span>
              </>
            )}
            {detectionStats.totalTrend === 'stable' && (
              <>
                <Minus size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600 font-semibold">No change</span>
              </>
            )}
            <span className="text-xs text-gray-500">vs last week</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <h3 className="text-3xl font-bold text-gray-800">{detectionStats.resolvedIncidents}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {detectionStats.resolvedTrend === 'up' && (
              <>
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-sm text-green-600 font-semibold">+{detectionStats.resolvedChange}%</span>
              </>
            )}
            {detectionStats.resolvedTrend === 'down' && (
              <>
                <TrendingDown size={16} className="text-red-500" />
                <span className="text-sm text-red-600 font-semibold">{detectionStats.resolvedChange}%</span>
              </>
            )}
            {detectionStats.resolvedTrend === 'stable' && (
              <>
                <Minus size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600 font-semibold">No change</span>
              </>
            )}
            <span className="text-xs text-gray-500">vs last week</span>
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Accuracy Rate</p>
              <h3 className="text-3xl font-bold text-gray-800">{detectionStats.accuracyRate}%</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-gray-500">False Positives: </span>
            <span className="font-semibold text-yellow-600">{detectionStats.falsePositives}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Review</p>
              <h3 className="text-3xl font-bold text-gray-800">{detectionStats.pendingIncidents}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Chart */}
      <section>
        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadChartData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnalyticsChart 
            data={chartData} 
            type={activeTimeframe}
            showComparison={activeTimeframe !== 'today'}
          />
        )}
      </section>

      {/* Two Column Layout - Peak Hours & Locations */}
      <section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Peak Hours Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-600" size={20} />
            <h3 className="text-xl font-semibold text-gray-700">Peak Hours</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(peakHours).map(([key, period], index) => {
              const maxIncidents = Math.max(
                ...Object.values(peakHours).map(p => p.incidents || 0)
              );
              const percentage = maxIncidents > 0 
                ? (period.incidents / maxIncidents) * 100 
                : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">{period.label}</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {period.incidents} incidents
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Analysis */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-indigo-600" size={20} />
            <h3 className="text-xl font-semibold text-gray-700">Location Analysis</h3>
          </div>
          <div className="space-y-3">
            {locationData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No location data available
              </div>
            ) : (
              locationData.map((location, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="font-semibold text-gray-800">{location.location}</div>
                      <div className="text-sm text-gray-500">{location.percentage}% of total</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-gray-800">{location.incidents}</span>
                    {location.trend === 'up' && <TrendingUp className="text-red-500" size={20} />}
                    {location.trend === 'down' && <TrendingDown className="text-green-500" size={20} />}
                    {location.trend === 'stable' && <Minus className="text-gray-500" size={20} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}