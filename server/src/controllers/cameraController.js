// backend/src/controllers/cameraController.js
const s3Service = require('../services/s3Service');
const db = require('../config/database');

class CameraController {
  /**
   * Get all cameras from database with signed video URLs
   * GET /api/cameras
   */
  async getAllCameras(req, res, next) {
    try {
      // Fetch cameras from Neon database
      const result = await db.query(
        `SELECT 
          id,
          camera_id,
          name,
          location,
          status,
          video_key,
          thumbnail_key,
          is_active,
          rtsp_url,
          rtsp_username,
          rtsp_password,
          stream_type,
          created_at,
          updated_at
        FROM cameras
        ORDER BY id ASC`
      );

      const cameras = result.rows;

      // Add signed S3 URLs for cameras that don't have RTSP
      const camerasWithUrls = await Promise.all(
        cameras.map(async (camera) => {
          let videoUrl = null;
          let thumbnailUrl = null;

          // Only generate S3 URLs if no RTSP or as fallback
          if (camera.video_key) {
            videoUrl = await s3Service.getVideoUrl(camera.video_key);
          }
          if (camera.thumbnail_key) {
            thumbnailUrl = await s3Service.getThumbnailUrl(camera.thumbnail_key);
          }

          return {
            id: camera.id,
            cameraId: camera.camera_id,
            name: camera.name,
            location: camera.location,
            status: camera.status,
            videoKey: camera.video_key,
            thumbnailKey: camera.thumbnail_key,
            isActive: camera.is_active,
            // RTSP fields
            rtsp_url: camera.rtsp_url,
            rtsp_username: camera.rtsp_username,
            rtsp_password: camera.rtsp_password,
            stream_type: camera.stream_type || 'hls',
            // S3 fallback URLs
            videoUrl,
            thumbnailUrl,
            // UI helpers
            statusColor: camera.status === 'active' ? 'green-500' : 'gray-500',
            lastUpdate: camera.updated_at || new Date().toISOString(),
          };
        })
      );

      res.json({
        success: true,
        data: camerasWithUrls,
        count: camerasWithUrls.length,
      });
    } catch (error) {
      console.error('Error fetching cameras:', error);
      next(error);
    }
  }

  /**
   * Get active cameras only
   * GET /api/cameras/active
   */
  async getActiveCameras(req, res, next) {
    try {
      // Fetch only active cameras from database
      const result = await db.query(
        `SELECT 
          id,
          camera_id,
          name,
          location,
          status,
          video_key,
          thumbnail_key,
          is_active,
          rtsp_url,
          rtsp_username,
          rtsp_password,
          stream_type,
          created_at,
          updated_at
        FROM cameras
        WHERE is_active = true
        ORDER BY id ASC`
      );

      const cameras = result.rows;

      const camerasWithUrls = await Promise.all(
        cameras.map(async (camera) => {
          let videoUrl = null;
          let thumbnailUrl = null;

          // Generate S3 URLs as fallback
          if (camera.video_key) {
            videoUrl = await s3Service.getVideoUrl(camera.video_key);
          }
          if (camera.thumbnail_key) {
            thumbnailUrl = await s3Service.getThumbnailUrl(camera.thumbnail_key);
          }

          return {
            id: camera.id,
            cameraId: camera.camera_id,
            name: camera.name,
            location: camera.location,
            status: camera.status,
            videoKey: camera.video_key,
            thumbnailKey: camera.thumbnail_key,
            isActive: camera.is_active,
            rtsp_url: camera.rtsp_url,
            rtsp_username: camera.rtsp_username,
            rtsp_password: camera.rtsp_password,
            stream_type: camera.stream_type || 'hls',
            videoUrl,
            thumbnailUrl,
            statusColor: 'green-500',
            lastUpdate: camera.updated_at || new Date().toISOString(),
          };
        })
      );

      res.json({
        success: true,
        data: camerasWithUrls,
        count: camerasWithUrls.length,
      });
    } catch (error) {
      console.error('Error fetching active cameras:', error);
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
      
      const result = await db.query(
        `SELECT 
          id,
          camera_id,
          name,
          location,
          status,
          video_key,
          thumbnail_key,
          is_active,
          rtsp_url,
          rtsp_username,
          rtsp_password,
          stream_type,
          created_at,
          updated_at
        FROM cameras
        WHERE id = $1`,
        [parseInt(id, 10)]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found',
        });
      }

      const camera = result.rows[0];

      // Generate S3 URLs
      let videoUrl = null;
      let thumbnailUrl = null;
      if (camera.video_key) {
        videoUrl = await s3Service.getVideoUrl(camera.video_key);
      }
      if (camera.thumbnail_key) {
        thumbnailUrl = await s3Service.getThumbnailUrl(camera.thumbnail_key);
      }

      res.json({
        success: true,
        data: {
          id: camera.id,
          cameraId: camera.camera_id,
          name: camera.name,
          location: camera.location,
          status: camera.status,
          videoKey: camera.video_key,
          thumbnailKey: camera.thumbnail_key,
          isActive: camera.is_active,
          rtsp_url: camera.rtsp_url,
          rtsp_username: camera.rtsp_username,
          rtsp_password: camera.rtsp_password,
          stream_type: camera.stream_type || 'hls',
          videoUrl,
          thumbnailUrl,
          statusColor: camera.status === 'active' ? 'green-500' : 'gray-500',
          lastUpdate: camera.updated_at || new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching camera:', error);
      next(error);
    }
  }

  /**
   * Get statistics for specific camera
   * GET /api/cameras/:id/stats
   */
  async getCameraStats(req, res, next) {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        `SELECT 
          COUNT(*) as total_incidents,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_incidents,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_incidents,
          ROUND(AVG(confidence_score), 2) as avg_confidence,
          MAX(detected_at) as last_incident
        FROM incidents
        WHERE camera_id = $1`,
        [parseInt(id, 10)]
      );
      
      const stats = result.rows[0];
      
      // Calculate time since last incident
      let lastIncident = null;
      if (stats.last_incident) {
        const now = new Date();
        const last = new Date(stats.last_incident);
        const diffMs = now - last;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
          lastIncident = `${diffMins} minutes ago`;
        } else if (diffMins < 1440) {
          lastIncident = `${Math.floor(diffMins / 60)} hours ago`;
        } else {
          lastIncident = `${Math.floor(diffMins / 1440)} days ago`;
        }
      }
      
      res.json({
        success: true,
        data: {
          totalIncidents: parseInt(stats.total_incidents) || 0,
          resolvedIncidents: parseInt(stats.resolved_incidents) || 0,
          pendingIncidents: parseInt(stats.pending_incidents) || 0,
          avgConfidence: parseFloat(stats.avg_confidence) || 0,
          lastIncident
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get incidents for specific camera
   * GET /api/cameras/:id/incidents?limit=10
   */
  async getCameraIncidents(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;
      
      const result = await db.query(
        `SELECT 
          i.*,
          c.name as camera_name,
          c.location
        FROM incidents i
        LEFT JOIN cameras c ON i.camera_id = c.id
        WHERE i.camera_id = $1
        ORDER BY i.detected_at DESC
        LIMIT $2`,
        [parseInt(id, 10), parseInt(limit, 10)]
      );
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get alerts for specific camera
   * GET /api/cameras/:id/alerts?limit=5
   */
  async getCameraAlerts(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      
      const result = await db.query(
        `SELECT 
          a.*,
          i.incident_type,
          i.severity
        FROM alerts a
        LEFT JOIN incidents i ON a.incident_id = i.id
        WHERE a.camera_id = $1 AND a.dismissed = false
        ORDER BY a.created_at DESC
        LIMIT $2`,
        [parseInt(id, 10), parseInt(limit, 10)]
      );
      
      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
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

      const result = await db.query(
        `UPDATE cameras 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [isActive, parseInt(id, 10)]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found',
        });
      }

      res.json({
        success: true,
        message: 'Camera status updated',
        data: result.rows[0],
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

      // Deactivate all cameras first
      await db.query(
        `UPDATE cameras SET is_active = false, updated_at = CURRENT_TIMESTAMP`
      );

      // Activate selected cameras
      if (activeCameraIds.length > 0) {
        await db.query(
          `UPDATE cameras 
           SET is_active = true, updated_at = CURRENT_TIMESTAMP
           WHERE id = ANY($1::int[])`,
          [activeCameraIds]
        );
      }

      // Get updated active cameras count
      const countResult = await db.query(
        `SELECT COUNT(*) as active_count FROM cameras WHERE is_active = true`
      );

      res.json({
        success: true,
        message: 'Camera preferences updated',
        data: {
          activeCameraIds,
          activeCount: parseInt(countResult.rows[0].active_count),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update camera RTSP settings
   * PATCH /api/cameras/:id/rtsp
   */
  async updateCameraRTSP(req, res, next) {
    try {
      const { id } = req.params;
      const { rtsp_url, rtsp_username, rtsp_password, stream_type } = req.body;

      const result = await db.query(
        `UPDATE cameras 
         SET rtsp_url = $1,
             rtsp_username = $2,
             rtsp_password = $3,
             stream_type = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, name, rtsp_url, stream_type`,
        [rtsp_url, rtsp_username, rtsp_password, stream_type || 'hls', parseInt(id, 10)]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Camera not found',
        });
      }

      res.json({
        success: true,
        message: 'RTSP settings updated',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CameraController();