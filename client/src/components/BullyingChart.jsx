import React, { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const BullyingChart = ({ data, type = 'hourly', heightMode = 'fixed' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Find max value for scaling
  const maxIncidents = Math.max(...data.map(d => d.incidents || 0));
  
  // DYNAMIC HEIGHT MODE: Calculate container height based on max incidents
  const getContainerHeight = () => {
    if (heightMode === 'dynamic') {
      // Each incident gets 20px height, minimum 200px, maximum 500px
      const dynamicHeight = Math.min(Math.max(maxIncidents * 20, 200), 500);
      return dynamicHeight;
    }
    // FIXED MODE: Always 256px
    return 256;
  };

  const containerHeight = getContainerHeight();
  
  // Calculate bar height
  const getBarHeight = (incidents) => {
    if (heightMode === 'dynamic') {
      // In dynamic mode: each incident = fixed pixel height (20px)
      return incidents * 20;
    } else {
      // In fixed mode: scale as percentage of container
      if (maxIncidents === 0) return 0;
      return (incidents / maxIncidents) * containerHeight;
    }
  };

  // Get color based on severity or incident count
  const getBarColor = (item) => {
    if (item.severity) {
      switch (item.severity) {
        case 'high': return '#ef4444'; // red-500
        case 'medium': return '#eab308'; // yellow-500
        case 'low': return '#22c55e'; // green-500
        default: return '#3b82f6'; // blue-500
      }
    }
    
    // For data without severity, use incident count
    const incidents = item.incidents || 0;
    if (incidents >= 6) return '#ef4444';
    if (incidents >= 3) return '#eab308';
    return '#22c55e';
  };

  const totalIncidents = data.reduce((sum, item) => sum + (item.incidents || 0), 0);
  const avgIncidents = totalIncidents / data.length;
  const peakIncidents = maxIncidents;

  // Y-axis labels (adjusted for mode)
  const getYAxisLabels = () => {
    if (heightMode === 'dynamic') {
      return [maxIncidents, Math.floor(maxIncidents * 0.75), Math.floor(maxIncidents * 0.5), Math.floor(maxIncidents * 0.25), 0];
    } else {
      return [maxIncidents, Math.floor(maxIncidents * 0.75), Math.floor(maxIncidents * 0.5), Math.floor(maxIncidents * 0.25), 0];
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      {/* Chart Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {type === 'hourly' ? 'Hourly Incidents' : 'Weekly Summary'}
            </h3>
            <p className="text-sm text-gray-500">
              {type === 'hourly' 
                ? 'Bullying incidents detected throughout the day' 
                : 'Incident summary for the past 7 days'}
            </p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Low (0-2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }}></div>
            <span>Medium (3-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span>High (6+)</span>
          </div>
          {heightMode === 'dynamic' && (
            <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
              Dynamic Height
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div 
          className="absolute left-0 top-0 w-10 flex flex-col justify-between text-xs text-gray-500 text-right pr-2"
          style={{ height: `${containerHeight}px` }}
        >
          {getYAxisLabels().map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="ml-12">
          <div className="relative border-l-2 border-b-2 border-gray-300 pl-4 pr-4 pb-12">
            {/* Horizontal grid lines */}
            <div 
              className="absolute left-0 right-0 top-0 pointer-events-none"
              style={{ height: `${containerHeight}px` }}
            >
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute left-0 right-0 border-t border-gray-200"
                  style={{ bottom: `${percent}%` }}
                ></div>
              ))}
            </div>

            {/* Bars */}
            <div 
              className="flex items-end justify-between gap-1 relative"
              style={{ height: `${containerHeight}px` }}
            >
              {data.map((item, index) => {
                const barHeight = getBarHeight(item.incidents);
                const barColor = getBarColor(item);
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Bar */}
                    <div className="w-full flex flex-col justify-end items-center h-full">
                      <div
                        className="w-full rounded-t transition-all duration-300 cursor-pointer"
                        style={{ 
                          height: `${barHeight}px`,
                          backgroundColor: barColor,
                          minHeight: item.incidents > 0 ? '4px' : '0px',
                          opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                          transform: hoveredIndex === index ? 'scaleY(1.05)' : 'scaleY(1)',
                          transformOrigin: 'bottom'
                        }}
                      >
                        {/* Value label on top of bar when hovered */}
                        {hoveredIndex === index && item.incidents > 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold rounded px-2 py-1 whitespace-nowrap z-10">
                            {item.incidents}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4" style={{ paddingLeft: '0.25rem', paddingRight: '0.25rem' }}>
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className="flex-1 flex justify-center"
                >
                  <span className="text-xs text-gray-600 mt-2">
                    {item.hour || item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">
            {totalIncidents}
          </div>
          <div className="text-sm text-gray-500 mt-1">Total Incidents</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {avgIncidents.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Average per Period</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {peakIncidents}
          </div>
          <div className="text-sm text-gray-500 mt-1">Peak Incidents</div>
        </div>
      </div>

      {/* Additional insights */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="text-blue-600 mt-0.5" size={20} />
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Peak Time: </span>
            {data.reduce((max, item, idx) => 
              item.incidents > data[max].incidents ? idx : max, 0
            ) !== -1 && (
              <span>
                {data[data.reduce((max, item, idx) => 
                  item.incidents > data[max].incidents ? idx : max, 0
                )].hour || data[data.reduce((max, item, idx) => 
                  item.incidents > data[max].incidents ? idx : max, 0
                )].day}
                {' '}with {peakIncidents} incidents
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mode indicator */}
      {heightMode === 'dynamic' && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Chart height: {containerHeight}px (min: 200px, max: 500px) • Each incident = 20px
        </div>
      )}
    </div>
  );
};

export default BullyingChart;