import React, { useState } from 'react';
import { BarChart3, Activity } from 'lucide-react';

const AnalyticsChart = ({ data, type = 'today', showComparison = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('incidents');

  // Determine which data field to display
  const getDataValue = (item) => {
    return item[selectedMetric] || 0;
  };

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => getDataValue(d)));
  
  // Calculate bar height
  const getBarHeight = (value) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  // Get color based on metric
  const getBarColor = (metric) => {
    switch (metric) {
      case 'incidents': return '#3b82f6'; // blue
      case 'resolved': return '#22c55e'; // green
      case 'pending': return '#f59e0b'; // orange
      case 'falsePositives': return '#ef4444'; // red
      default: return '#6366f1'; // indigo
    }
  };

  const containerHeight = 280;

  // Get label based on type
  const getLabel = (item) => {
    if (type === 'today') return item.hour;
    if (type === 'weekly') return item.day;
    if (type === 'monthly') return item.week;
    return '';
  };

  const totalValue = data.reduce((sum, item) => sum + getDataValue(item), 0);
  const avgValue = totalValue / data.length;
  const peakValue = maxValue;

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      {/* Chart Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-indigo-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {type === 'today' && 'Today\'s Incidents'}
              {type === 'weekly' && 'Weekly Analysis'}
              {type === 'monthly' && 'Monthly Overview'}
            </h3>
            <p className="text-sm text-gray-500">
              {type === 'today' && 'Hourly breakdown of incidents'}
              {type === 'weekly' && 'Last 7 days performance'}
              {type === 'monthly' && 'Last 30 days grouped by week'}
            </p>
          </div>
        </div>
        
        {/* Metric Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedMetric('incidents')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              selectedMetric === 'incidents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Incidents
          </button>
          {showComparison && (
            <>
              <button
                onClick={() => setSelectedMetric('resolved')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  selectedMetric === 'resolved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setSelectedMetric('pending')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  selectedMetric === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
            </>
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
          <span>{maxValue}</span>
          <span>{Math.floor(maxValue * 0.75)}</span>
          <span>{Math.floor(maxValue * 0.5)}</span>
          <span>{Math.floor(maxValue * 0.25)}</span>
          <span>0</span>
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
                const value = getDataValue(item);
                const barHeightPercent = getBarHeight(value);
                const barHeightPx = (barHeightPercent / 100) * containerHeight;
                const barColor = getBarColor(selectedMetric);
                
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
                          height: `${barHeightPx}px`,
                          backgroundColor: barColor,
                          minHeight: value > 0 ? '4px' : '0px',
                          opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                          transform: hoveredIndex === index ? 'scaleY(1.05)' : 'scaleY(1)',
                          transformOrigin: 'bottom'
                        }}
                      >
                        {/* Tooltip */}
                        {hoveredIndex === index && value > 0 && (
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                            <div className="font-bold mb-1">{getLabel(item)}</div>
                            <div>Total: {item.incidents || 0}</div>
                            {showComparison && (
                              <>
                                <div>Resolved: {item.resolved || 0}</div>
                                <div>Pending: {item.pending || 0}</div>
                              </>
                            )}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
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
              {data.map((item, index) => {
                // Show fewer labels if there are many data points
                const showLabel = type === 'today' 
                  ? index % 2 === 0 // Show every other label for hourly
                  : true; // Show all labels for weekly/monthly
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex justify-center"
                  >
                    {showLabel && (
                      <span className="text-xs text-gray-600 mt-2">
                        {getLabel(item)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: getBarColor(selectedMetric) }}>
            {Math.round(totalValue)}
          </div>
          <div className="text-sm text-gray-500 mt-1 capitalize">Total {selectedMetric}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-700">
            {avgValue.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Average</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600">
            {peakValue}
          </div>
          <div className="text-sm text-gray-500 mt-1">Peak</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;