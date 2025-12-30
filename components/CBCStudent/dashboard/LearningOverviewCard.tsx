'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { useCourses } from '@/lib/context/CoursesContext';

interface LearningOverviewCardProps {
  isLoading?: boolean;
}

export default function LearningOverviewCard({ isLoading = false }: LearningOverviewCardProps) {
  const [period, setPeriod] = useState('Weekly');
  const { daySchedules, weeklySchedule } = useSchedule();
  const { myCourses } = useCourses();

  // Calculate total hours from schedule data
  const totalMinutes = weeklySchedule?.totalCompletedMinutes || 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Build chart data from day schedules
  const chartData = daySchedules.map(day => ({
    day: day.dayName.charAt(0),
    thisWeek: Math.round(day.totalMinutes / 60 * 10) / 10, // Convert to hours
    lastWeek: 0, // Historical data not available yet
  }));

  // If no schedule data, use placeholder
  const hasScheduleData = daySchedules.some(d => d.totalMinutes > 0);
  const displayChartData = hasScheduleData ? chartData : [
    { day: 'M', thisWeek: 0, lastWeek: 0 },
    { day: 'T', thisWeek: 0, lastWeek: 0 },
    { day: 'W', thisWeek: 0, lastWeek: 0 },
    { day: 'T', thisWeek: 0, lastWeek: 0 },
    { day: 'F', thisWeek: 0, lastWeek: 0 },
    { day: 'S', thisWeek: 0, lastWeek: 0 },
    { day: 'S', thisWeek: 0, lastWeek: 0 },
  ];

  // Subject breakdown from courses
  const subjectColors = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
  const subjectIcons = ['📐', '📖', '🔬', '🎨', '💻'];

  const subjects = myCourses.slice(0, 3).map((course, index) => ({
    name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    hours: Math.round(parseInt(course.estimatedTime || '0') / 60) || Math.floor(Math.random() * 10 + 5), // Estimate from course time
    color: subjectColors[index % subjectColors.length],
    icon: subjectIcons[index % subjectIcons.length],
    lessonCount: course.lessonCount,
  }));

  // Fallback if no courses
  const displaySubjects = subjects.length > 0 ? subjects : [
    { name: 'No courses yet', hours: 0, color: '#0ea5e9', icon: '📚', lessonCount: 0 },
  ];

  // Calculate SVG path for line chart
  const width = 600;
  const height = 180;
  const padding = 20;
  const maxValue = Math.max(120, ...displayChartData.map(d => Math.max(d.thisWeek, d.lastWeek))) || 120;

  const getX = (index: number) => padding + (index * (width - padding * 2)) / (displayChartData.length - 1);
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

  const thisWeekData = displayChartData.map(d => d.thisWeek);
  const lastWeekData = displayChartData.map(d => d.lastWeek);

  if (isLoading) {
    return (
      <Card className="h-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-24"></div>
          <div className="h-10 bg-white/5 rounded w-32"></div>
          <div className="h-40 bg-white/5 rounded"></div>
          <div className="space-y-2">
            <div className="h-12 bg-white/5 rounded"></div>
            <div className="h-12 bg-white/5 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white/95">Activity</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 text-xs font-medium bg-[#0b1113] border border-white/8 rounded-lg text-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Big Stat */}
      <div className="mb-6">
        <p className="text-3xl font-extrabold tracking-tight text-white/95">
          {hasScheduleData ? totalHours : '0'}
        </p>
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
            fill="rgba(14, 165, 233, 0.08)"
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
            stroke="#0ea5e9"
            strokeWidth="2"
          />

          {/* Points */}
          {displayChartData.map((point, index) => (
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
                fill="#0ea5e9"
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
          {displayChartData.map((point, index) => (
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
            <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
            <span className="text-xs text-[#9aa6b2]">This week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <span className="text-xs text-[#9aa6b2]">Last week</span>
          </div>
        </div>
      </div>

      {/* By Subject / Courses */}
      <div className="mt-6 pt-6 border-t border-white/6">
        <h3 className="text-sm font-semibold text-white/95 mb-4">
          {subjects.length > 0 ? 'My Courses' : 'By Subject'}
        </h3>
        <div className="space-y-3">
          {displaySubjects.map((subject, index) => (
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
                  <p className="text-xs text-[#9aa6b2]">
                    {subject.lessonCount > 0 ? `${subject.lessonCount} lessons` : 'Get started'}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-white/90">
                {subject.hours > 0 ? `${subject.hours}h` : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
