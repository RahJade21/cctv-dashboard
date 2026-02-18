import React from 'react';
import { Download, Video, Calendar } from 'lucide-react';

export default function SaveRecording() {
  const recordings = [
    {
      id: 1,
      title: 'Incident - Classroom A',
      date: '2024-02-04',
      time: '10:45 AM',
      duration: '5:30',
      size: '250 MB',
      camera: 'Camera 3'
    },
    {
      id: 2,
      title: 'Incident - Hallway B',
      date: '2024-02-04',
      time: '09:30 AM',
      duration: '3:15',
      size: '180 MB',
      camera: 'Camera 7'
    },
    {
      id: 3,
      title: 'Incident - Playground',
      date: '2024-02-04',
      time: '08:15 AM',
      duration: '8:45',
      size: '420 MB',
      camera: 'Camera 12'
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Saved Recordings</h1>
      
      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search recordings..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All Cameras</option>
          <option>Camera 1-6</option>
          <option>Camera 7-12</option>
        </select>
      </div>

      {/* Recordings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recording
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Camera
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recordings.map((recording) => (
              <tr key={recording.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Video className="text-indigo-600 mr-3" size={20} />
                    <span className="font-medium text-gray-900">{recording.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{recording.date}</div>
                  <div className="text-sm text-gray-500">{recording.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recording.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recording.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {recording.camera}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                    View
                  </button>
                  <button className="text-green-600 hover:text-green-900 inline-flex items-center gap-1">
                    <Download size={16} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}