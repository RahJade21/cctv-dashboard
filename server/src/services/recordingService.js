// backend/src/services/recordingService.js
const ffmpeg = require('fluent-ffmpeg');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  region: 'ap-southeast-3'
});

class RecordingService {
  /**
   * Record a clip from RTSP camera
   * @param {number} cameraId 
   * @param {string} rtspUrl 
   * @param {number} incidentId 
   * @param {number} durationSeconds - How long to record (default: 180)
   */
  async recordIncident(cameraId, rtspUrl, incidentId, durationSeconds = 180) {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const filename = `camera_${cameraId}_incident_${incidentId}_${timestamp}.mp4`;
      const tempPath = path.join('/tmp', filename);
      
      console.log(`Recording started: ${filename}`);

      ffmpeg(rtspUrl)
        .outputOptions([
          '-t', durationSeconds.toString(),  // Duration
          '-c:v', 'libx264',                 // Video codec
          '-c:a', 'aac',                     // Audio codec
          '-b:v', '1M',                      // Video bitrate
          '-preset', 'fast',                 // Encoding speed
        ])
        .output(tempPath)
        .on('end', async () => {
          console.log(`Recording complete: ${filename}`);
          
          try {
            // Upload to S3
            const s3Key = await this.uploadToS3(tempPath, filename);
            
            // Save to database
            const recording = await this.saveRecordingMetadata({
              incidentId,
              cameraId,
              s3Key,
              filename,
              durationSeconds
            });

            // Delete temp file
            fs.unlinkSync(tempPath);

            resolve(recording);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          console.error(`Recording error: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Upload video to S3 Standard (will transition to Glacier automatically)
   */
  async uploadToS3(filePath, filename) {
    const fileContent = fs.readFileSync(filePath);
    const s3Key = `recordings/${new Date().toISOString().split('T')[0]}/${filename}`;

    const params = {
      Bucket: 'cctv-recordings-bucket',
      Key: s3Key,
      Body: fileContent,
      ContentType: 'video/mp4',
      StorageClass: 'STANDARD', // Will transition to Glacier via lifecycle policy
      Metadata: {
        'uploaded-at': new Date().toISOString()
      }
    };

    await s3.putObject(params).promise();
    console.log(`Uploaded to S3: ${s3Key}`);

    return s3Key;
  }

  /**
   * Save recording metadata to database
   */
  async saveRecordingMetadata(data) {
    const db = require('../config/database');
    
    const fileSizeMB = fs.statSync(data.filename).size / (1024 * 1024);
    
    const result = await db.query(
      `INSERT INTO recordings 
       (incident_id, camera_id, video_path, start_time, end_time, duration_seconds, file_size_mb)
       VALUES ($1, $2, $3, NOW() - INTERVAL '${data.durationSeconds} seconds', NOW(), $4, $5)
       RETURNING *`,
      [data.incidentId, data.cameraId, data.s3Key, data.durationSeconds, fileSizeMB]
    );

    return result.rows[0];
  }

  /**
   * Get signed URL for playback (retrieve from Glacier if needed)
   */
  async getRecordingUrl(recordingId) {
    const db = require('../config/database');
    
    const result = await db.query(
      `SELECT * FROM recordings WHERE id = $1`,
      [recordingId]
    );

    if (result.rows.length === 0) {
      throw new Error('Recording not found');
    }

    const recording = result.rows[0];

    // Check if file is in Glacier
    const headResult = await s3.headObject({
      Bucket: 'cctv-recordings-bucket',
      Key: recording.video_path
    }).promise();

    if (headResult.StorageClass === 'GLACIER' || headResult.StorageClass === 'DEEP_ARCHIVE') {
      // Need to restore from Glacier first
      await s3.restoreObject({
        Bucket: 'cctv-recordings-bucket',
        Key: recording.video_path,
        RestoreRequest: {
          Days: 1, // Make available for 1 day
          GlacierJobParameters: {
            Tier: 'Expedited' // 1-5 minutes retrieval
          }
        }
      }).promise();

      return {
        status: 'restoring',
        message: 'Video is being retrieved from archive. This may take a few minutes.'
      };
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'cctv-recordings-bucket',
      Key: recording.video_path,
      Expires: 3600
    });

    return {
      status: 'available',
      url: signedUrl
    };
  }
}

module.exports = new RecordingService();