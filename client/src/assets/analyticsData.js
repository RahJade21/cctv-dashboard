// Mock data for Analytics component
// This file contains detailed analytics data for today, weekly, and monthly views

export const detectionStatistics = {
  bullyingIncidents: 23,
  falsePositives: 5,
  accuracyRate: 93,
  totalDetections: 28,
  resolvedIncidents: 20,
  pendingReview: 3,
};

export const peakHoursData = {
  morning: { label: 'Morning (8AM-12PM)', incidents: 7 },
  afternoon: { label: 'Afternoon (12PM-4PM)', incidents: 12 },
  evening: { label: 'Evening (4PM-8PM)', incidents: 4 },
  night: { label: 'Night (8PM-12AM)', incidents: 0 },
};

// Today's hourly data (24 hours)
export const todayHourlyData = [
  { hour: '00:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '01:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '02:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '03:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '04:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '05:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '06:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '07:00', incidents: 1, resolved: 1, pending: 0 },
  { hour: '08:00', incidents: 2, resolved: 2, pending: 0 },
  { hour: '09:00', incidents: 3, resolved: 2, pending: 1 },
  { hour: '10:00', incidents: 4, resolved: 3, pending: 1 },
  { hour: '11:00', incidents: 3, resolved: 3, pending: 0 },
  { hour: '12:00', incidents: 5, resolved: 4, pending: 1 },
  { hour: '13:00', incidents: 6, resolved: 5, pending: 1 },
  { hour: '14:00', incidents: 4, resolved: 4, pending: 0 },
  { hour: '15:00', incidents: 3, resolved: 3, pending: 0 },
  { hour: '16:00', incidents: 2, resolved: 2, pending: 0 },
  { hour: '17:00', incidents: 1, resolved: 1, pending: 0 },
  { hour: '18:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '19:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '20:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '21:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '22:00', incidents: 0, resolved: 0, pending: 0 },
  { hour: '23:00', incidents: 0, resolved: 0, pending: 0 },
];

// Weekly data (last 7 days)
export const weeklyData = [
  { day: 'Mon', date: '2024-01-29', incidents: 12, resolved: 10, pending: 2, falsePositives: 1 },
  { day: 'Tue', date: '2024-01-30', incidents: 15, resolved: 13, pending: 2, falsePositives: 2 },
  { day: 'Wed', date: '2024-01-31', incidents: 8, resolved: 7, pending: 1, falsePositives: 0 },
  { day: 'Thu', date: '2024-02-01', incidents: 18, resolved: 15, pending: 3, falsePositives: 1 },
  { day: 'Fri', date: '2024-02-02', incidents: 22, resolved: 20, pending: 2, falsePositives: 3 },
  { day: 'Sat', date: '2024-02-03', incidents: 5, resolved: 5, pending: 0, falsePositives: 0 },
  { day: 'Sun', date: '2024-02-04', incidents: 3, resolved: 3, pending: 0, falsePositives: 0 },
];

// Monthly data (last 30 days grouped by week)
export const monthlyData = [
  { week: 'Week 1', dateRange: 'Jan 1-7', incidents: 45, resolved: 40, pending: 5, falsePositives: 3 },
  { week: 'Week 2', dateRange: 'Jan 8-14', incidents: 52, resolved: 48, pending: 4, falsePositives: 5 },
  { week: 'Week 3', dateRange: 'Jan 15-21', incidents: 38, resolved: 35, pending: 3, falsePositives: 2 },
  { week: 'Week 4', dateRange: 'Jan 22-28', incidents: 41, resolved: 38, pending: 3, falsePositives: 4 },
  { week: 'Week 5', dateRange: 'Jan 29-Feb 4', incidents: 83, resolved: 73, pending: 10, falsePositives: 7 },
];

// Location-based analytics
export const locationAnalytics = [
  { location: 'Front Hall', incidents: 28, percentage: 30, trend: 'up' },
  { location: 'Playground', incidents: 35, percentage: 38, trend: 'down' },
  { location: 'Cafeteria', incidents: 15, percentage: 16, trend: 'stable' },
  { location: 'Hallway A', incidents: 8, percentage: 9, trend: 'down' },
  { location: 'Hallway B', incidents: 6, percentage: 7, trend: 'stable' },
];

// Severity breakdown
export const severityBreakdown = [
  { level: 'Critical', count: 8, percentage: 35, color: '#ef4444' },
  { level: 'High', count: 10, percentage: 43, color: '#f97316' },
  { level: 'Medium', count: 4, percentage: 17, color: '#eab308' },
  { level: 'Low', count: 1, percentage: 5, color: '#22c55e' },
];

// Incident types
export const incidentTypes = [
  { type: 'Physical', count: 12, percentage: 52 },
  { type: 'Verbal', count: 6, percentage: 26 },
  { type: 'Cyber', count: 3, percentage: 13 },
  { type: 'Social', count: 2, percentage: 9 },
];

// Response time analytics
export const responseTimeData = {
  average: '2.5 min',
  fastest: '45 sec',
  slowest: '8 min',
  median: '2 min',
};

// Top cameras by incidents
export const topCamerasByIncidents = [
  { camera: 'CCTV 05 - Playground', incidents: 35, change: -8 },
  { camera: 'CCTV 01 - Front Hall', incidents: 28, change: 12 },
  { camera: 'CCTV 03 - Cafeteria', incidents: 15, change: -3 },
  { camera: 'CCTV 08 - Hallway A', incidents: 8, change: 0 },
  { camera: 'CCTV 12 - Hallway B', incidents: 6, change: -2 },
];

// Comparison data (This week vs Last week)
export const comparisonData = {
  thisWeek: {
    incidents: 83,
    resolved: 73,
    pending: 10,
    avgResponseTime: '2.5 min',
  },
  lastWeek: {
    incidents: 76,
    resolved: 70,
    pending: 6,
    avgResponseTime: '3.1 min',
  },
  percentageChange: {
    incidents: 9.2,
    resolved: 4.3,
    pending: 66.7,
    avgResponseTime: -19.4,
  },
};

// Time distribution (what time incidents happen most)
export const timeDistribution = {
  earlyMorning: { range: '6AM-9AM', percentage: 15, incidents: 6 },
  morning: { range: '9AM-12PM', percentage: 30, incidents: 12 },
  afternoon: { range: '12PM-3PM', percentage: 40, incidents: 16 },
  lateAfternoon: { range: '3PM-6PM', percentage: 15, incidents: 6 },
};

// Monthly summary
export const monthlySummary = {
  totalIncidents: 259,
  totalResolved: 236,
  totalPending: 23,
  totalFalsePositives: 21,
  accuracyRate: 91.9,
  avgIncidentsPerDay: 8.6,
  mostActiveDay: 'Friday',
  leastActiveDay: 'Sunday',
};