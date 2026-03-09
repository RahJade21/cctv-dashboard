// backend/test-recording.js
const recordingService = require('./src/services/recordingService');

async function testRecording() {
  try {
    const recording = await recordingService.recordIncident(
      1, // camera ID
      'rtsp://admin:telkomiot123@36.92.47.218:11754/cam/realmonitor?channel=1&subtype=0',
      999, // test incident ID
      10 // 10 seconds for testing
    );
    
    console.log('Recording created:', recording);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRecording();