'use client';

import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { useCourses } from '@/lib/context/CoursesContext';
import { useAuth } from '@/lib/context/AuthContext';

interface LearningOverviewCardProps {
  isLoading?: boolean;
}

export default function LearningOverviewCard({ isLoading: initialLoading = false }: LearningOverviewCardProps) {
  const [period, setPeriod] = useState('Weekly');
  const { daySchedules, weeklySchedule } = useSchedule();
  const { myCourses } = useCourses();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [automatedMinutes, setAutomatedMinutes] = useState<{ [day: string]: number }>({});

  // Fetch manual sessions / activity logs that weren't scheduled
  useEffect(() => {
    if (!user) return;

    const fetchAutomatedDurations = async () => {
      try {
        const res = await fetch(`/api/user/activity?userId=${user.uid}`);
        const data = await res.json();
        const activities = data.activities || [];

        // Group additional minutes by day for the current week
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        weekStart.setHours(0, 0, 0, 0);

        const dailyMinutes: { [day: string]: number } = {};

        activities.forEach((act: any) => {
          const actDate = new Date(act.timestamp);
          if (actDate >= weekStart) {
            const dayKey = actDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);

            // Extract duration
            let mins = 0;
            if (act.type === 'study_session' && act.durationSeconds) {
              mins = act.durationSeconds / 60;
            } else if (act.type === 'quiz') {
              mins = 10; // Assume 10 mins for a quiz if not tracked
            } else if (act.type === 'chat') {
              mins = 5; // Assume 5 mins for a chat if not tracked
            }

            dailyMinutes[dayKey] = (dailyMinutes[dayKey] || 0) + mins;
          }
        });

        setAutomatedMinutes(dailyMinutes);
      } catch (err) {
        console.error('Failed to fetch automated durations:', err);
      }
    };

    fetchAutomatedDurations();
  }, [user]);

  // Calculate total hours from schedule data + automated data
  const totalScheduleMinutes = weeklySchedule?.totalCompletedMinutes || 0;
  const totalAutomatedMinutes = Object.values(automatedMinutes).reduce((a, b) => a + b, 0);
  const totalHours = ((totalScheduleMinutes + totalAutomatedMinutes) / 60).toFixed(1);

  // Build chart data from day schedules + automated data
  const chartData = daySchedules.map(day => {
    const dayKey = day.dayName.charAt(0);
    const scheduledMins = day.totalMinutes;
    const autoMins = automatedMinutes[dayKey] || 0;

    return {
      day: dayKey,
      thisWeek: Math.round((scheduledMins + autoMins) / 60 * 10) / 10,
      lastWeek: 0,
    };
  });

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
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-lg font-semibold text-white/95">Activity</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-[#0b1113] border border-white/8 rounded-lg text-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* Big Stat */}
      <div className="mb-4 sm:mb-6">
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/95">
          {hasScheduleData ? totalHours : '0'}
        </p>
        <p className="text-xs sm:text-sm text-[#9aa6b2] mt-1">Hours Spent</p>
      </div>

      {/* Chart */}
      <div className="mb-4 sm:mb-6">
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
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#0ea5e9]"></div>
            <span className="text-[10px] sm:text-xs text-[#9aa6b2]">This week</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#f59e0b]"></div>
            <span className="text-[10px] sm:text-xs text-[#9aa6b2]">Last week</span>
          </div>
        </div>
      </div>

      {/* By Subject / Courses */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/6">
        <h3 className="text-xs sm:text-sm font-semibold text-white/95 mb-3 sm:mb-4">
          {subjects.length > 0 ? 'My Courses' : 'By Subject'}
        </h3>
        <div className="space-y-2.5 sm:space-y-3">
          {displaySubjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-lg"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  {subject.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white/90">{subject.name}</p>
                  <p className="text-[10px] sm:text-xs text-[#9aa6b2]">
                    {subject.lessonCount > 0 ? `${subject.lessonCount} lessons` : 'Get started'}
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white/90">
                {subject.hours > 0 ? `${subject.hours}h` : '-'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
