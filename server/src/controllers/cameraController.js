const s3Service = require('../services/s3Service');

// Mock camera data (will be replaced with database in Phase 3)
const cameras = [
  {
    id: 1,
    cameraId: 'CCTV-01',
    name: 'CCTV 01 - Front Hall',
    location: 'Front Hall',
    status: 'active',
    videoKey: 'videos/camera-01-front-hall.mp4',
    thumbnailKey: 'thumbnails/camera-01-front-hall.jpg',
    isActive: true,
  },
  {
    id: 2,
    cameraId: 'CCTV-02',
    name: 'CCTV 02 - Parking Area',
    location: 'Parking Space',
    status: 'active',
    videoKey: 'videos/camera-02-parking.mp4',
    thumbnailKey: 'thumbnails/camera-02-parking.jpg',
    isActive: true,
  },
  {
    id: 3,
    cameraId: 'CCTV-03',
    name: 'CCTV 03 - Backyard',
    location: 'Backyard',
    status: 'active',
    videoKey: 'videos/camera-03-backyard.mp4',
    thumbnailKey: 'thumbnails/camera-03-backyard.jpg',
    isActive: true,
  },
  {
    id: 4,
    cameraId: 'CCTV-04',
    name: 'CCTV 04 - Classroom A',
    location: 'Front Class',
    status: 'active',
    videoKey: 'videos/camera-04-classroom.mp4',
    thumbnailKey: 'thumbnails/camera-04-classroom.jpg',
    isActive: true,
  },
  {
    id: 5,
    cameraId: 'CCTV-05',
    name: 'CCTV 05 - Playground',
    location: 'Playground',
    status: 'active',
    videoKey: 'videos/camera-05-playground.mp4',
    thumbnailKey: 'thumbnails/camera-05-playground.jpg',
    isActive: false,
  },
  {
    id: 6,
    cameraId: 'CCTV-06',
    name: 'CCTV 06 - Cafeteria',
    location: 'Cafeteria',
    status: 'active',
    videoKey: 'videos/camera-06-cafeteria.mp4',
    thumbnailKey: 'thumbnails/camera-06-cafeteria.jpg',
    isActive: false,
  },
  {
    id: 7,
    cameraId: 'CCTV-07',
    name: 'CCTV 07 - Hallway A',
    location: 'Hallway A',
    status: 'active',
    videoKey: 'videos/camera-07-hallway-a.mp4',
    thumbnailKey: 'thumbnails/camera-07-hallway-a.jpg',
    isActive: false,
  },
  {
    id: 8,
    cameraId: 'CCTV-08',
    name: 'CCTV 08 - Hallway B',
    location: 'Hallway B',
    status: 'active',
    videoKey: 'videos/camera-08-hallway-b.mp4',
    thumbnailKey: 'thumbnails/camera-08-hallway-b.jpg',
    isActive: false,
  },
];

class CameraController {
  /**
   * Get all cameras with signed video URLs
   * GET /api/cameras
   */
  async getAllCameras(req, res, next) {
    try {
      // Get signed S3 URLs from videoKey
      const camerasWithUrls = await Promise.all(
        cameras.map(async (camera) => {
          const videoUrl = await s3Service.getVideoUrl(camera.videoKey);
          const thumbnailUrl = await s3Service.getThumbnailUrl(camera.thumbnailKey);

          return {
            ...camera,
            videoUrl,
            thumbnailUrl,
            statusColor: camera.status === 'active' ? 'green-500' : 'gray-500',
            lastUpdate: new Date().toISOString(),
          };
        })
      );

      res.json({
        success: true,
        data: camerasWithUrls,
        count: camerasWithUrls.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active cameras only
   * GET /api/cameras/active
   */
  async getActiveCameras(req, res, next) {
    try {
      const activeCameras = cameras.filter(camera => camera.isActive);

      const camerasWithUrls = await Promise.all(
        activeCameras.map(async (camera) => {
          const videoUrl = await s3Service.getVideoUrl(camera.videoKey);
          const thumbnailUrl = await s3Service.getThumbnailUrl(camera.thumbnailKey);

          return {
            ...camera,
            videoUrl,
            thumbnailUrl,
            statusColor: 'green-500',
            lastUpdate: new Date().toISOString(),
          };
        })
      );

      res.json({
        success: true,
        data: camerasWithUrls,
        count: camerasWithUrls.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single camera by ID
   * GET /api/cameras/:id
   */
  async getCameraById(req, res, next) {
    try {
      const { id } = req.params;
      const camera = cameras.find(cam => cam.id === parseInt(id));

      if (!camera) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found',
        });
      }

      const videoUrl = await s3Service.getVideoUrl(camera.videoKey);
      const thumbnailUrl = await s3Service.getThumbnailUrl(camera.thumbnailKey);

      res.json({
        success: true,
        data: {
          ...camera,
          videoUrl,
          thumbnailUrl,
          statusColor: camera.status === 'active' ? 'green-500' : 'gray-500',
          lastUpdate: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update camera active status
   * PATCH /api/cameras/:id/status
   */
  async updateCameraStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const cameraIndex = cameras.findIndex(cam => cam.id === parseInt(id));

      if (cameraIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found',
        });
      }

      cameras[cameraIndex].isActive = isActive;

      res.json({
        success: true,
        message: 'Camera status updated',
        data: cameras[cameraIndex],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update multiple camera statuses (for user preferences)
   * POST /api/cameras/preferences
   */
  async updateCameraPreferences(req, res, next) {
    try {
      const { activeCameraIds } = req.body;

      if (!Array.isArray(activeCameraIds)) {
        return res.status(400).json({
          success: false,
          message: 'activeCameraIds must be an array',
        });
      }

      // Validate minimum 4 cameras
      if (activeCameraIds.length < 4) {
        return res.status(400).json({
          success: false,
          message: 'At least 4 cameras must be active',
        });
      }

      // Update all cameras
      cameras.forEach(camera => {
        camera.isActive = activeCameraIds.includes(camera.id);
      });

      const activeCameras = cameras.filter(cam => cam.isActive);

      res.json({
        success: true,
        message: 'Camera preferences updated',
        data: {
          activeCameraIds,
          activeCount: activeCameras.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CameraController();