// frontend/src/components/CCTVVideoPlayer.jsx
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function CCTVVideoPlayer({ camera, onClick }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const cancelledRef = useRef(false); // ← useRef so it's accessible everywhere
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!camera || !videoRef.current) {
      setLoading(false);
      return;
    }

    // Reset cancelled flag on each new effect run
    cancelledRef.current = false;

    setLoading(true);
    setError(null);

    // Priority 1: Check for RTSP URL (real-time streaming)
    if (camera.rtsp_url) {
      console.log('Using RTSP stream for camera:', camera.id);
      setupRTSPStream();
      return;
    }

    // Priority 2: Check for HLS stream URL
    if (camera.stream_type === 'hls' && camera.stream_url) {
      console.log('Using HLS stream for camera:', camera.id);
      setupHLSStream(camera.stream_url);
      return;
    }

    // Priority 3: Fall back to mock S3 video (current setup)
    if (camera.videoUrl) {
      console.log('Using S3 video for camera:', camera.id);
      setupS3Video();
      return;
    }

    // No video source available
    setError('No video source configured');
    setLoading(false);

    // Cleanup: cancel and destroy HLS on re-run or unmount
    return () => {
      cancelledRef.current = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [camera]);

  const setupRTSPStream = () => {
    const hlsUrl = `http://localhost:8888/camera${camera.id}/index.m3u8`;
    console.log('Attempting HLS conversion at:', hlsUrl);
    setupHLSStream(hlsUrl);
  };

  const setupHLSStream = (hlsUrl) => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,   // false is more stable for RTSP
        backBufferLength: 30,
        maxBufferLength: 10,
        maxBufferHole: 2,
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelledRef.current) return; // ← guard against double-render

        videoRef.current.play()
          .then(() => {
            setIsLive(true);
            setLoading(false);
          })
          .catch(err => {
            if (err.name === 'AbortError') return; // ← harmless, ignore
            console.error('Playback error:', err);
            fallbackToS3();
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              setTimeout(() => {
                if (!isLive) fallbackToS3();
              }, 10000); // increased from 3s to 10s
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              fallbackToS3();
              break;
          }
        }
      });

    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = hlsUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play()
          .then(() => {
            setIsLive(true);
            setLoading(false);
          })
          .catch(() => fallbackToS3());
      });
      videoRef.current.addEventListener('error', () => {
        fallbackToS3();
      });
    } else {
      fallbackToS3();
    }
  };

  const setupS3Video = () => {
    if (!camera.videoUrl) {
      setError('No video available');
      setLoading(false);
      return;
    }

    videoRef.current.src = camera.videoUrl;
    videoRef.current.load();

    videoRef.current.addEventListener('loadeddata', () => {
      videoRef.current.play()
        .then(() => {
          setIsLive(true);
          setLoading(false);
        })
        .catch(err => {
          console.error('S3 video playback error:', err);
          setError('Failed to play video');
          setLoading(false);
        });
    });

    videoRef.current.addEventListener('error', (e) => {
      console.error('S3 video error:', e);
      setError('Video unavailable');
      setLoading(false);
    });
  };

  const fallbackToS3 = () => {
    console.log('Falling back to S3 video for camera:', camera.id);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (camera.videoUrl) {
      setupS3Video();
    } else {
      setError('Stream unavailable');
      setLoading(false);
    }
  };

  if (!camera) {
    return (
      <div
        className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center"
        onClick={onClick}
      >
        <p className="text-gray-500 text-sm">No camera selected</p>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white text-xs">Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
          <div className="text-center px-4">
            <p className="text-white text-sm font-semibold mb-2">{error}</p>
            <p className="text-white text-xs opacity-75">{camera.name}</p>
          </div>
        </div>
      )}

      {/* Camera Name Overlay */}
      <div className="absolute top-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm">
        <span className="text-white text-sm font-semibold">
          {camera.name || `Camera ${camera.id}`}
        </span>
      </div>

      {/* Live Indicator */}
      {isLive && camera.rtsp_url && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-semibold">LIVE</span>
        </div>
      )}

      {/* Recording Indicator */}
      {isLive && !camera.rtsp_url && camera.videoUrl && (
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 bg-white rounded-full" />
          <span className="text-white text-xs font-semibold">RECORDED</span>
        </div>
      )}

      {/* Location Badge */}
      {camera.location && (
        <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <span className="text-white text-xs">{camera.location}</span>
        </div>
      )}

      {/* Status Indicator */}
      <div className={`absolute bottom-3 right-3 w-3 h-3 rounded-full ${
        camera.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
      }`} />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
    </div>
  );
}