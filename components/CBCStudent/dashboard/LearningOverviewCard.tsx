'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';

interface ChartPoint {
  day: string;
  thisWeek: number;
  lastWeek: number;
}

export default function LearningOverviewCard() {
  const [period, setPeriod] = useState('Weekly');

  // Mock data
  const chartData: ChartPoint[] = [
    { day: 'M', thisWeek: 20, lastWeek: 15 },
    { day: 'T', thisWeek: 34, lastWeek: 28 },
    { day: 'W', thisWeek: 82, lastWeek: 62 },
    { day: 'T', thisWeek: 64, lastWeek: 44 },
    { day: 'F', thisWeek: 55, lastWeek: 35 },
    { day: 'S', thisWeek: 90, lastWeek: 70 },
    { day: 'S', thisWeek: 76, lastWeek: 60 }
  ];

  const subjects = [
    { name: 'Mathematics', hours: 18, color: '#7c3aed', icon: '📐' },
    { name: 'English', hours: 12, color: '#06b6d4', icon: '📖' },
    { name: 'Science', hours: 9, color: '#10b981', icon: '🔬' }
  ];

  // Calculate SVG path for line chart
  const width = 600;
  const height = 180;
  const padding = 20;
  const maxValue = 120;

  const getX = (index: number) => padding + (index * (width - padding * 2)) / (chartData.length - 1);
  const getY = (value: number) => height - padding - ((value / maxValue) * (height - padding * 2));

  const createPath = (data: number[]) => {
    return data.map((value, index) => {
      const x = getX(index);
      const y = getY(value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  const createAreaPath = (data: number[]) => {
    const linePath = createPath(data);
    const lastX = getX(data.length - 1);
    const baseY = height - padding;
    return `${linePath} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
  };

  const thisWeekData = chartData.map(d => d.thisWeek);
  const lastWeekData = chartData.map(d => d.lastWeek);

  return (
    <Card className="h-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/95">Activity</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 text-xs font-medium bg-[#0b1113] border border-white/8 rounded-lg text-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-purple-400/40"
        >
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Big Stat */}
      <div className="mb-6">
        <p className="text-3xl font-extrabold tracking-tight text-white/95">834.6</p>
        <p className="text-sm text-[#9aa6b2] mt-1">Hours Spent</p>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 30, 60, 90, 120].map((value) => (
            <line
              key={value}
              x1={padding}
              y1={getY(value)}
              x2={width - padding}
              y2={getY(value)}
              stroke="#12171c"
              strokeWidth="1"
            />
          ))}

          {/* Area fills */}
          <path
            d={createAreaPath(lastWeekData)}
            fill="rgba(245, 158, 11, 0.06)"
          />
          <path
            d={createAreaPath(thisWeekData)}
            fill="rgba(124, 58, 237, 0.08)"
          />

          {/* Lines */}
          <path
            d={createPath(lastWeekData)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <path
            d={createPath(thisWeekData)}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
          />

          {/* Points */}
          {chartData.map((point, index) => (
            <g key={`points-${index}`}>
              <circle
                cx={getX(index)}
                cy={getY(point.lastWeek)}
                r="3"
                fill="#f59e0b"
              />
              <circle
                cx={getX(index)}
                cy={getY(point.thisWeek)}
                r="3"
                fill="#7c3aed"
              />
              {/* Hover area */}
              <rect
                x={getX(index) - 15}
                y={padding}
                width="30"
                height={height - padding * 2}
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{`${point.day}: This week ${point.thisWeek}h, Last week ${point.lastWeek}h`}</title>
              </rect>
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.map((point, index) => (
            <text
              key={`label-${index}`}
              x={getX(index)}
              y={height - 5}
              textAnchor="middle"
              className="text-xs fill-[#9aa6b2]"
            >
              {point.day}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7c3aed]"></div>
            <span className="text-xs text-[#9aa6b2]">This week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span className="text-xs text-[#9aa6b2]">Last week</span>
          </div>
        </div>
      </div>

      {/* By Subject */}
      <div className="mt-6 pt-6 border-t border-white/6">
        <h3 className="text-sm font-semibold text-white/95 mb-4">By Subject</h3>
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  {subject.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{subject.name}</p>
                  <p className="text-xs text-[#9aa6b2]">24 lessons</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-white/90">{subject.hours}h</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
