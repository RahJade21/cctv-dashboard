// This file is now just a fallback/template
// Real camera data comes from the backend API

// Export empty array - will be populated from API
export const availableCCTVCameras = [];

// Helper to format API response to match frontend structure
export const formatCameraData = (apiCamera) => {
  return {
    id: apiCamera.id,
    cameraId: apiCamera.cameraId,
    name: apiCamera.name,
    location: apiCamera.location,
    status: apiCamera.status,
    statusColor: apiCamera.statusColor || 'green-500',
    videoUrl: apiCamera.videoUrl, // Pre-signed S3 URL from backend
    thumbnailUrl: apiCamera.thumbnailUrl,
    isActive: apiCamera.isActive,
    lastUpdate: apiCamera.lastUpdate,
    rtsp_url: apiCamera.rtsp_url,
    rtsp_username: apiCamera.rtsp_username,
    rtsp_password: apiCamera.rtsp_password,
    stream_type: apiCamera.stream_type || 'hls',
  };
};