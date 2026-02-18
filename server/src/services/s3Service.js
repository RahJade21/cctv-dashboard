const { GetObjectCommand, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/aws');

class S3Service {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET;
    this.urlExpiration = parseInt(process.env.S3_URL_EXPIRATION) || 3600;
  }

  /**
   * Generate a pre-signed URL for video streaming
   * @param {string} videoKey - S3 object key (e.g., 'videos/camera-01-front-hall.mp4')
   * @returns {Promise<string>} Pre-signed URL
   */
  async getVideoUrl(videoKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: videoKey,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: this.urlExpiration,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating video URL:', error);
      throw new Error(`Failed to generate video URL: ${error.message}`);
    }
  }

  /**
   * Generate pre-signed URLs for multiple videos
   * @param {Array<string>} videoKeys - Array of S3 object keys
   * @returns {Promise<Array<{key: string, url: string}>>}
   */
  async getMultipleVideoUrls(videoKeys) {
    try {
      const urlPromises = videoKeys.map(async (key) => ({
        key,
        url: await this.getVideoUrl(key),
      }));

      return await Promise.all(urlPromises);
    } catch (error) {
      console.error('Error generating multiple video URLs:', error);
      throw new Error(`Failed to generate video URLs: ${error.message}`);
    }
  }

  /**
   * List all videos in the videos/ folder
   * @returns {Promise<Array<string>>} Array of video keys
   */
  async listVideos() {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'videos/',
      });

      const response = await s3Client.send(command);
      
      if (!response.Contents) {
        return [];
      }

      // Filter out folder itself and return only .mp4 files
      return response.Contents
        .filter(item => item.Key.endsWith('.mp4'))
        .map(item => item.Key);
    } catch (error) {
      console.error('Error listing videos:', error);
      throw new Error(`Failed to list videos: ${error.message}`);
    }
  }

  /**
   * Get thumbnail URL
   * @param {string} thumbnailKey - S3 object key for thumbnail
   * @returns {Promise<string>} Pre-signed URL
   */
  async getThumbnailUrl(thumbnailKey) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: thumbnailKey,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: this.urlExpiration,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating thumbnail URL:', error);
      // Return null instead of throwing - thumbnails are optional
      return null;
    }
  }

  /**
   * Upload a file to S3 (for future incident recording)
   * @param {Buffer} fileBuffer - File data
   * @param {string} key - S3 object key
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} S3 object key
   */
  async uploadFile(fileBuffer, key, contentType = 'video/mp4') {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await s3Client.send(command);
      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

module.exports = new S3Service();