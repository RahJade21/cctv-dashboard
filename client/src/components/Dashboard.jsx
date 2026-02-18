import React, { useState, useEffect } from 'react';
import { Map, Calendar, Cctv, X, Info, ArrowDown, ArrowUp, ChevronRight, Edit } from 'lucide-react';
import visitor from "../assets/visitor.png";
import BullyingChart from './BullyingChart';
import CCTVVideoPlayer from './CCTVVideoPlayer';
import CameraSelectionModal from './CameraSelectionModal';
import { 
  fetchAllCameras, 
  updateCameraPreferences,
  fetchActiveAlerts,
  dismissAlert,
  fetchAnalytics
} from '../services/api';
import { formatCameraData } from '../assets/cctvCamerasData';

export default function Dashboard({ onNavigateToCameraDetails }) {
  // Filter states
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [placeOpen, setPlaceOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [chartType, setChartType] = useState('hourly');
  
  // Data states
  const [cameras, setCameras] = useState([]);
  const [locations, setLocations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [bullyingStats, setBullyingStats] = useState({
    count: 0,
    location: 'all areas',
    percentageChange: 0,
    trend: 'stable',
    comparisonPeriod: 'since yesterday',
  });
  const [chartData, setChartData] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  // Date range options
  const dateRangeOptions = [
    { id: 'all', name: 'All Time', value: 'all' },
    { id: 'today', name: 'Today', value: 'today' },
    { id: 'yesterday', name: 'Yesterday', value: 'yesterday' },
    { id: 'week', name: 'This Week', value: 'week' },
    { id: 'month', name: 'This Month', value: 'month' },
  ];

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadFilteredData();
  }, [selectedLocation, selectedDateRange]);

  // Reload chart when type changes
  useEffect(() => {
    loadChartData();
  }, [chartType, selectedDateRange]);

  const loadAllData = async () => {
    await Promise.all([
      loadCameras(),
      loadAlerts(),
      loadBullyingStats(),
      loadChartData(),
    ]);
  };

  const loadFilteredData = async () => {
    await Promise.all([
      loadAlerts(),
      loadBullyingStats(),
    ]);
  };

  const loadCameras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const camerasData = await fetchAllCameras();
      const formattedCameras = camerasData.map(formatCameraData);
      
      setCameras(formattedCameras);

      // Extract unique locations for dropdown
      const uniqueLocations = [...new Set(formattedCameras.map(cam => cam.location))];
      setLocations([
        { id: 'all', name: 'All Locations' },
        ...uniqueLocations.map((loc, idx) => ({ id: `loc-${idx}`, name: loc }))
      ]);
      
    } catch (err) {
      console.error('Failed to load cameras:', err);
      setError('Failed to load cameras. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setAlertsLoading(true);
      const alertsData = await fetchActiveAlerts();
      
      // Filter alerts by location and date if needed
      const filteredAlerts = alertsData.filter(alert => {
        // Filter by location
        if (selectedLocation !== 'all') {
          const camera = cameras.find(cam => cam.id === alert.camera_id);
          if (camera && camera.location !== selectedLocation) {
            return false;
          }
        }
        
        // Filter by date range
        if (selectedDateRange !== 'all') {
          const alertDate = new Date(alert.created_at || alert.time);
          const now = new Date();
          
          switch(selectedDateRange) {
            case 'today':
              return alertDate.toDateString() === now.toDateString();
            case 'yesterday':
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              return alertDate.toDateString() === yesterday.toDateString();
            case 'week':
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return alertDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return alertDate >= monthAgo;
            default:
              return true;
          }
        }
        
        return true;
      });
      
      setAlerts(filteredAlerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  const loadBullyingStats = async () => {
    try {
      // For now, calculate from alerts
      const totalIncidents = alerts.length;
      
      // Calculate comparison based on date range
      let comparisonPeriod = 'since yesterday';
      if (selectedDateRange === 'week') {
        comparisonPeriod = 'since last week';
      } else if (selectedDateRange === 'month') {
        comparisonPeriod = 'since last month';
      }

      // Mock comparison - in real implementation, fetch previous period data
      const percentageChange = Math.floor(Math.random() * 30) - 10;
      const trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable';

      const locationText = selectedLocation === 'all' ? 'all areas' : selectedLocation;

      setBullyingStats({
        count: totalIncidents,
        location: locationText,
        percentageChange: Math.abs(percentageChange),
        trend,
        comparisonPeriod,
      });
    } catch (err) {
      console.error('Failed to load bullying stats:', err);
    }
  };

  const loadChartData = async () => {
    try {
      setChartLoading(true);
      const timeframe = chartType === 'hourly' ? 'today' : 'weekly';
      const data = await fetchAnalytics(timeframe);
      setChartData(data);
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.name === 'All Locations' ? 'all' : location.name);
    setPlaceOpen(false);
  };

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range.value);
    setCalendarOpen(false);
  };

  const handleAlertDismiss = async (alertId) => {
    try {
      await dismissAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      loadBullyingStats();
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
      alert('Failed to dismiss alert. Please try again.');
    }
  };

  const handleUpdateCameras = async (selectedCameraIds) => {
    try {
      await updateCameraPreferences(selectedCameraIds);
      await loadCameras();
    } catch (error) {
      console.error('Failed to update camera preferences:', error);
      alert('Failed to save camera preferences. Please try again.');
    }
  };

  // FIXED: Navigate to camera details using the prop function
  const handleCameraDetailsClick = (cameraId) => {
    if (onNavigateToCameraDetails) {
      onNavigateToCameraDetails(cameraId);
    }
  };

  const activeCameras = cameras.filter(camera => camera.isActive);

  // Filter active cameras by location if selected
  const displayedCameras = selectedLocation === 'all' 
    ? activeCameras 
    : activeCameras.filter(cam => cam.location === selectedLocation);

  // Get display names for selected filters
  const selectedLocationDisplay = locations.find(loc => 
    loc.name === selectedLocation || (selectedLocation === 'all' && loc.id === 'all')
  )?.name || 'All Locations';

  const selectedDateDisplay = dateRangeOptions.find(opt => 
    opt.value === selectedDateRange
  )?.name || 'Today';

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-10'>
      {/* SECTION 1: Header with Filters */}
      <section className='section-1'>
        <div className='flex justify-between items-center'>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className='flex gap-6'>
            {/* Location Dropdown */}
            <div className="relative inline-block">
              <button 
                onClick={() => setPlaceOpen(s => !s)} 
                className="inline-flex w-full items-center gap-x-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50"
              >
                <Map /> {selectedLocationDisplay} ▾
              </button>
              {placeOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg z-10 border border-gray-200">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        (selectedLocation === 'all' && location.id === 'all') || 
                        (selectedLocation === location.name)
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Dropdown */}
            <div className="relative inline-block">
              <button 
                onClick={() => setCalendarOpen(s => !s)} 
                className="inline-flex w-full items-center gap-x-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50"
              >
                <Calendar /> {selectedDateDisplay} ▾
              </button>
              {calendarOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg z-10 border border-gray-200">
                  {dateRangeOptions.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => handleDateRangeSelect(range)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedDateRange === range.value
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedLocation !== 'all' || selectedDateRange !== 'today') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                <Map size={14} />
                {selectedLocation}
                <button
                  onClick={() => setSelectedLocation('all')}
                  className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedDateRange !== 'today' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                <Calendar size={14} />
                {selectedDateDisplay}
                <button
                  onClick={() => setSelectedDateRange('today')}
                  className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: Alerts and Statistics */}
      <section className='section-2'>
        <div className='flex'>
          {/* Alerts List */}
          <div className='w-2/3 pr-6'>
            {alertsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700">
                  ✅ No active alerts for {selectedLocationDisplay} ({selectedDateDisplay})
                </p>
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                {alerts.map((alert) => {
                  const borderColor = alert.alert_type === 'critical' ? '#ef4444' : '#eab308';
                  const bgColor = alert.alert_type === 'critical' ? '#ef4444' : '#eab308';
                  
                  return (
                    <div 
                      key={alert.id}
                      className="bg-white rounded-sm py-1 px-3 flex justify-between items-center"
                      style={{ borderLeft: `4px solid ${borderColor}` }}
                    >
                      <div className='flex gap-3 items-center'>
                        <Cctv />
                        <div><b>{alert.cctvName || alert.camera_id}</b></div>
                        <div>|</div>
                        <div>{alert.message}</div>
                      </div>
                      <div className='flex gap-3 items-center'>
                        <div 
                          className="rounded-full px-2 text-white font-bold text-sm"
                          style={{ backgroundColor: bgColor }}
                        >
                          {alert.alert_type === 'critical' ? 'CRITICAL' : 'WARNING'}
                        </div>
                        <button 
                          onClick={() => handleAlertDismiss(alert.id)}
                          className="hover:bg-gray-100 rounded p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bullying Statistics Card */}
          <div className='w-1/3'>
            <div className='bg-white h-full rounded-sm p-2 px-4 flex flex-col gap-3'>
              <div className='flex gap-2 items-center'>
                <b>Bullying Detection</b> 
                <Info className='w-4'/>
              </div> 
              <div className='flex gap-2 items-center'>
                <img src={visitor} alt="visitor" className='size-fit'/>
                <div>
                  <div className='font-bold'>{bullyingStats.count} Bullying</div>
                  <p>Detected at {bullyingStats.location}</p>
                </div>
              </div>
              <div className='flex gap-2 items-center'>
                {bullyingStats.trend === 'down' ? (
                  <ArrowDown color='#00d15b' size={20} />
                ) : bullyingStats.trend === 'up' ? (
                  <ArrowUp color='#ff0000' size={20} />
                ) : (
                  <span className="text-gray-500">—</span>
                )}
                <span className={
                  bullyingStats.trend === 'down' ? 'text-green-500' : 
                  bullyingStats.trend === 'up' ? 'text-red-500' : 
                  'text-gray-500'
                }>
                  {bullyingStats.percentageChange}%
                </span>
                <span className='text-sm'>{bullyingStats.comparisonPeriod}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Main CCTV Header */}
      <section className='section-3'>
        <div className='flex justify-between'>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Main CCTV</h1>
            <h3 className='text-gray-600 mt-2'>
              {selectedLocation === 'all' 
                ? `Showing ${displayedCameras.length} active cameras`
                : `Showing ${displayedCameras.length} cameras in ${selectedLocation}`
              }
            </h3>
          </div>
          <button 
            onClick={() => setIsCameraModalOpen(true)}
            className="inline-flex items-center gap-x-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50"
          >
            <Edit size={16} /> Add / Remove
          </button>
        </div>
      </section>

      {/* SECTION 4: CCTV Camera Grid */}
      <section className='section-4'>
        {displayedCameras.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-yellow-800 text-lg">
              📹 No cameras found for "{selectedLocation}"
            </p>
            <p className="text-yellow-600 text-sm mt-2">
              Try selecting a different location or add more cameras
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {displayedCameras.map((camera) => (
              <div 
                key={camera.id}
                className='bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow'
              >
                <div className='p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center'>
                  <div className='flex items-center gap-2'>
                    <Cctv size={16} className='text-gray-600' />
                    <span className='font-semibold text-sm text-gray-800'>{camera.name}</span>
                  </div>
                  <button className='p-1 hover:bg-gray-200 rounded transition-colors'>
                    <Info size={14} className='text-gray-600' />
                  </button>
                </div>
                
                <div className='aspect-video bg-gray-900'>
                  <CCTVVideoPlayer 
                    videoUrl={camera.videoUrl}
                    cameraName={camera.location}
                    status={camera.status}
                  />
                </div>
                
                <div className='p-3 flex justify-between items-center bg-gray-50 border-t border-gray-200'>
                  <div className={`text-${camera.statusColor} font-semibold flex items-center gap-1 text-sm`}>
                    <span className='text-xl'>•</span>
                    <span className='capitalize'>{camera.status}</span>
                  </div>
                  <button 
                    onClick={() => handleCameraDetailsClick(camera.id)}
                    className='flex items-center text-indigo-600 hover:text-indigo-700 text-xs font-medium cursor-pointer'
                  >
                    <span>Details</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCameras.length < 4 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ You have less than 4 cameras active. Click "Add / Remove" to add more cameras.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 5: Graph Summary */}
      <section className='section-5'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Graph Summary</h1>
            <h3 className='text-gray-600 mt-2'>Current analytical event graph</h3>
          </div>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setChartType('hourly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                chartType === 'hourly'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setChartType('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                chartType === 'weekly'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {chartLoading ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        ) : (
          <BullyingChart 
            data={chartData}
            type={chartType}
          />
        )}
      </section>

      {/* Camera Selection Modal */}
      <CameraSelectionModal 
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        availableCameras={cameras}
        activeCameras={activeCameras}
        onUpdateCameras={handleUpdateCameras}
      />
    </div>
  );
}