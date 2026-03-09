const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function for API calls
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== CAMERA API ====================

/**
 * Get all cameras with S3 video URLs
 */
export const fetchAllCameras = async () => {
  const response = await fetchAPI('/api/cameras');
  return response.data;
};

/**
 * Get active cameras only
 */
export const fetchActiveCameras = async () => {
  const response = await fetchAPI('/api/cameras/active');
  return response.data;
};

/**
 * Get single camera by ID
 */
export const fetchCameraById = async (id) => {
  const response = await fetchAPI(`/api/cameras/${id}`);
  return response.data;
};

/**
 * Update camera preferences (active/inactive)
 */
export const updateCameraPreferences = async (activeCameraIds) => {
  const response = await fetchAPI('/api/cameras/preferences', {
    method: 'POST',
    body: JSON.stringify({ activeCameraIds }),
  });
  return response.data;
};

/**
 * Get camera statistics
 */
export const fetchCameraStats = async () => {
  const response = await fetchAPI('/api/cameras/stats');
  return response.data;
};

// ==================== ALERTS API ====================

/**
 * Get all active alerts (not dismissed)
 */
export const fetchActiveAlerts = async () => {
  const response = await fetchAPI('/api/alerts');
  return response.data;
};

/**
 * Get all alerts (including dismissed)
 */
export const fetchAllAlerts = async () => {
  const response = await fetchAPI('/api/alerts/all');
  return response.data;
};

/**
 * Dismiss an alert
 */
export const dismissAlert = async (alertId) => {
  const response = await fetchAPI(`/api/alerts/${alertId}/dismiss`, {
    method: 'POST',
    body: JSON.stringify({ dismissedBy: 'user' }),
  });
  return response.data;
};

/**
 * Create new alert
 */
export const createAlert = async (alertData) => {
  const response = await fetchAPI('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(alertData),
  });
  return response.data;
};

// ==================== ANALYTICS API ====================

/**
 * Get analytics data by timeframe
 * @param {string} timeframe - 'today', 'weekly', or 'monthly'
 */
export const fetchAnalytics = async (timeframe = 'today') => {
  const response = await fetchAPI(`/api/analytics?timeframe=${timeframe}`);
  return response.data;
};

/**
 * Get detection statistics summary
 */
export const fetchDetectionStats = async () => {
  const response = await fetchAPI('/api/analytics/stats');
  return response.data;
};

// Update these functions in frontend/src/services/api.js

// Update fetchPeakHours to accept timeframe
export const fetchPeakHours = async (timeframe = 'weekly') => {
  const response = await fetch(`${API_BASE_URL}/api/analytics/peak-hours?timeframe=${timeframe}`);
  const data = await response.json();
  if (!data.success) throw new Error('Failed to fetch peak hours');
  return data.data;
};

// Update fetchLocationAnalytics to accept timeframe
export const fetchLocationAnalytics = async (timeframe = 'weekly') => {
  const response = await fetch(`${API_BASE_URL}/api/analytics/locations?timeframe=${timeframe}`);
  const data = await response.json();
  if (!data.success) throw new Error('Failed to fetch location analytics');
  return data.data;
};

/**
 * Get bullying stats for dashboard card
 */
export const fetchBullyingStats = async () => {
  const response = await fetchAPI('/api/analytics/bullying-stats');
  return response.data;
};

// ==================== HEALTH CHECK ====================

/**
 * Check if backend is running
 */
export const checkHealth = async () => {
  const response = await fetchAPI('/health');
  return response;
};