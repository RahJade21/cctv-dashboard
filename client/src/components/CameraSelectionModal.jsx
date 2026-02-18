import React, { useState } from 'react';
import { X, Check, Video, Minus } from 'lucide-react';

const CameraSelectionModal = ({ 
  isOpen, 
  onClose, 
  availableCameras, 
  activeCameras, 
  onUpdateCameras 
}) => {
  const [selectedCameras, setSelectedCameras] = useState(
    activeCameras.map(cam => cam.id)
  );

  if (!isOpen) return null;

  const MIN_CAMERAS = 4;

  const toggleCamera = (cameraId) => {
    setSelectedCameras(prev => {
      if (prev.includes(cameraId)) {
        // Prevent removing if at minimum
        if (prev.length <= MIN_CAMERAS) {
          return prev;
        }
        return prev.filter(id => id !== cameraId);
      } else {
        // No maximum limit - can add unlimited cameras
        return [...prev, cameraId];
      }
    });
  };

  const handleSave = () => {
    onUpdateCameras(selectedCameras);
    onClose();
  };

  const isSelected = (cameraId) => selectedCameras.includes(cameraId);
  const canRemove = selectedCameras.length > MIN_CAMERAS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manage CCTV Cameras</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select at least {MIN_CAMERAS} cameras to display 
              <span className="ml-2 font-semibold text-indigo-600">
                ({selectedCameras.length} selected)
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Camera Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableCameras.map((camera) => {
              const selected = isSelected(camera.id);
              const disabled = selected ? !canRemove : false; // Can always add, only restrict removal

              return (
                <div
                  key={camera.id}
                  onClick={() => !disabled && toggleCamera(camera.id)}
                  className={`
                    relative border-2 rounded-lg p-4 cursor-pointer transition-all
                    ${selected 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                    ${disabled && !selected ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-2 right-2">
                    {selected ? (
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>

                  {/* Camera Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    selected ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    <Video size={24} className={selected ? 'text-indigo-600' : 'text-gray-600'} />
                  </div>

                  {/* Camera Info */}
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">
                    {camera.name}
                  </h3>
                  <p className="text-xs text-gray-500">{camera.location}</p>

                  {/* Status Badge */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                      camera.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        camera.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      {camera.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Messages */}
          <div className="mt-6 space-y-2">
            {selectedCameras.length < MIN_CAMERAS && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <Minus className="text-yellow-600 mt-0.5" size={18} />
                <p className="text-sm text-yellow-800">
                  Please select at least <strong>{MIN_CAMERAS} cameras</strong> to display in the dashboard.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{selectedCameras.length}</span> cameras selected
            {selectedCameras.length < MIN_CAMERAS && (
              <span className="ml-2 text-yellow-600">
                (minimum {MIN_CAMERAS} required)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedCameras.length < MIN_CAMERAS}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedCameras.length >= MIN_CAMERAS
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraSelectionModal;