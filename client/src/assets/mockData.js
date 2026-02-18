// Mock data for Dashboard component
// This file contains all hardcoded data that will later be replaced with API calls

export const locations = [
  { id: 1, name: 'Front Hall', value: 'front-hall' },
  { id: 2, name: 'Parking Space', value: 'parking-space' },
  { id: 3, name: 'Backyard', value: 'backyard' },
  { id: 4, name: 'Front Class', value: 'front-class' },
];

export const daysOfWeek = [
  { id: 1, name: 'Monday', value: 'monday' },
  { id: 2, name: 'Tuesday', value: 'tuesday' },
  { id: 3, name: 'Wednesday', value: 'wednesday' },
  { id: 4, name: 'Thursday', value: 'thursday' },
  { id: 5, name: 'Friday', value: 'friday' },
  { id: 6, name: 'Saturday', value: 'saturday' },
  { id: 7, name: 'Sunday', value: 'sunday' },
];

export const alerts = [
  {
    id: 1,
    cctvId: 'CCTV-1',
    cctvName: 'Front Hall Camera',
    message: 'Detected bullying at',
    time: '15.25',
    type: 'warning', // 'warning' or 'secure'
    status: 'WARNING',
  },
  {
    id: 2,
    cctvId: 'CCTV-4',
    cctvName: 'Hallway B Camera',
    message: 'Detected bullying at',
    time: '14.30',
    type: 'warning',
    status: 'WARNING',
  },
  {
    id: 3,
    cctvId: 'CCTV-5',
    cctvName: 'Playground Camera',
    message: 'Detected bullying at',
    time: '13.15',
    type: 'warning',
    status: 'WARNING',
  },
  {
    id: 4,
    cctvId: 'CCTV-3',
    cctvName: 'Cafeteria Camera',
    message: 'Nothing unusual detected',
    time: null,
    type: 'secure',
    status: 'SECURE',
  },
];

export const bullyingStats = {
  count: 3,
  location: 'area CCTV',
  percentageChange: 8,
  trend: 'down', // 'up' or 'down'
  comparisonPeriod: 'since last week',
};

export const cctvCameras = [
  {
    id: 1,
    name: 'CCTV 01 - Front Hall',
    location: 'Front Hall',
    status: 'active', // 'active', 'inactive', 'maintenance'
    statusColor: 'green-500',
    lastUpdate: '2024-02-04 15:30:00',
  },
  {
    id: 2,
    name: 'CCTV 02 - Parking Area',
    location: 'Parking Space',
    status: 'active',
    statusColor: 'green-500',
    lastUpdate: '2024-02-04 15:30:00',
  },
  {
    id: 3,
    name: 'CCTV 03 - Backyard',
    location: 'Backyard',
    status: 'active',
    statusColor: 'green-500',
    lastUpdate: '2024-02-04 15:30:00',
  },
  {
    id: 4,
    name: 'CCTV 04 - Classroom A',
    location: 'Front Class',
    status: 'active',
    statusColor: 'green-500',
    lastUpdate: '2024-02-04 15:30:00',
  },
];

// Graph data - Bullying incidents per hour in a day
export const hourlyBullyingData = [
  { hour: '00:00', incidents: 0, severity: 'low' },
  { hour: '01:00', incidents: 0, severity: 'low' },
  { hour: '02:00', incidents: 0, severity: 'low' },
  { hour: '03:00', incidents: 0, severity: 'low' },
  { hour: '04:00', incidents: 0, severity: 'low' },
  { hour: '05:00', incidents: 0, severity: 'low' },
  { hour: '06:00', incidents: 0, severity: 'low' },
  { hour: '07:00', incidents: 0, severity: 'medium' },
  { hour: '08:00', incidents: 1, severity: 'medium' },
  { hour: '09:00', incidents: 2, severity: 'high' },
  { hour: '10:00', incidents: 5, severity: 'high' },
  { hour: '11:00', incidents: 4, severity: 'medium' },
  { hour: '12:00', incidents: 16, severity: 'high' },
  { hour: '13:00', incidents: 4, severity: 'high' },
  { hour: '14:00', incidents: 2, severity: 'high' },
  { hour: '15:00', incidents: 5, severity: 'high' },
  { hour: '16:00', incidents: 3, severity: 'medium' },
  { hour: '17:00', incidents: 8, severity: 'medium' },
  { hour: '18:00', incidents: 1, severity: 'low' },
  { hour: '19:00', incidents: 0, severity: 'low' },
  { hour: '20:00', incidents: 0, severity: 'low' },
  { hour: '21:00', incidents: 0, severity: 'low' },
  { hour: '22:00', incidents: 0, severity: 'low' },
  { hour: '23:00', incidents: 0, severity: 'low' },
];

// Weekly summary data for graph
export const weeklyBullyingData = [
  { day: 'Mon', incidents: 12, resolved: 10, pending: 2 },
  { day: 'Tue', incidents: 15, resolved: 13, pending: 2 },
  { day: 'Wed', incidents: 8, resolved: 7, pending: 1 },
  { day: 'Thu', incidents: 18, resolved: 15, pending: 3 },
  { day: 'Fri', incidents: 22, resolved: 20, pending: 2 },
  { day: 'Sat', incidents: 5, resolved: 5, pending: 0 },
  { day: 'Sun', incidents: 3, resolved: 3, pending: 0 },
];

// Camera-wise incident data
export const cameraIncidentData = [
  { camera: 'CCTV 01', incidents: 15 },
  { camera: 'CCTV 02', incidents: 8 },
  { camera: 'CCTV 03', incidents: 12 },
  { camera: 'CCTV 04', incidents: 10 },
  { camera: 'CCTV 05', incidents: 20 },
  { camera: 'CCTV 06', incidents: 6 },
];