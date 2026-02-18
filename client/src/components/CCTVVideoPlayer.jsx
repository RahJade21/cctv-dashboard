import React, { useRef, useEffect } from 'react';
import { Video, VideoOff } from 'lucide-react';

const CCTVVideoPlayer = ({ videoUrl, cameraName, status }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Auto-play prevented:', error);
      });
    }
  }, [videoUrl]);

  const handleVideoError = () => {
    console.error('Video failed to load:', videoUrl);
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded overflow-hidden">
      {status === 'active' ? (
        <>
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
            onError={handleVideoError}
          />
          
          {/* Live Indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black bg-opacity-60 px-2 py-1 rounded">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-semibold">LIVE</span>
          </div>

          {/* Camera Name Overlay */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded">
            <span className="text-white text-xs font-semibold">{cameraName}</span>
          </div>
        </>
      ) : (
        /* Offline State */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
          <VideoOff className="text-gray-500 mb-2" size={48} />
          <span className="text-gray-400 text-sm">Camera Offline</span>
        </div>
      )}
    </div>
  );
};

export default CCTVVideoPlayer;