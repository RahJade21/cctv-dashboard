// backend/src/services/streamService.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

class StreamService {
  constructor() {
    this.activeStreams = new Map();
  }

  startStream(cameraId, rtspUrl) {
    if (this.activeStreams.has(cameraId)) {
      return; // Already streaming
    }

    const outputPath = path.join(__dirname, '../../public/streams', `camera${cameraId}`);
    
    const stream = ffmpeg(rtspUrl)
      .outputOptions([
        '-f hls',
        '-hls_time 2',
        '-hls_list_size 3',
        '-hls_flags delete_segments',
      ])
      .output(`${outputPath}/index.m3u8`)
      .on('start', () => console.log(`Stream started: Camera ${cameraId}`))
      .on('error', (err) => console.error(`Stream error: ${err.message}`))
      .run();

    this.activeStreams.set(cameraId, stream);
  }

  stopStream(cameraId) {
    const stream = this.activeStreams.get(cameraId);
    if (stream) {
      stream.kill();
      this.activeStreams.delete(cameraId);
    }
  }
}

module.exports = new StreamService();