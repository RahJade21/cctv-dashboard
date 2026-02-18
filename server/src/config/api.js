// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('API_URL:', API_URL);  // ← ADD THIS LINE
console.log('Full env:', import.meta.env.VITE_API_URL);  // ← AND THIS

export const API_ENDPOINTS = {
  cameras: `${API_URL}/api/cameras`,
  alerts: `${API_URL}/api/alerts`,
  incidents: `${API_URL}/api/incidents`,
  analytics: `${API_URL}/api/analytics`,
  reports: `${API_URL}/api/reports`,
};

export default API_URL;