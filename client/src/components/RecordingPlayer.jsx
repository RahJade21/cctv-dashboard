// frontend/src/components/RecordingPlayer.jsx
import React, { useState, useEffect } from 'react';
import { Play, Download, Archive } from 'lucide-react';

export default function RecordingPlayer({ incidentId }) {
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const loadRecording = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/recordings/incident/${incidentId}`
      );
      const data = await response.json();
      
      if (data.status === 'restoring') {
        setStatus('Retrieving from archive...');
        // Poll every 30 seconds
        setTimeout(loadRecording, 30000);
      } else {
        setRecording(data);
        setStatus('Ready');
      }
    } catch (err) {
      setStatus('Error loading recording');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Incident Recording</h3>
      
      {!recording && (
        <button
          onClick={loadRecording}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {loading ? 'Loading...' : 'Load Recording'}
        </button>
      )}

      {status && (
        <div className="flex items-center gap-2 text-yellow-600 mt-2">
          <Archive size={16} />
          <span className="text-sm">{status}</span>
        </div>
      )}

      {recording && recording.status === 'available' && (
        <div>
          <video
            src={recording.url}
            controls
            className="w-full rounded-lg mb-4"
          />
          <div className="flex gap-2">
            <a
              href={recording.url}
              download
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}