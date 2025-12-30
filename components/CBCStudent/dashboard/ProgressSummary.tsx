'use client';

import React from 'react';
import Card from '../shared/Card';
import ProgressCircle from '../shared/ProgressCircle';
import { useCourses } from '@/lib/context/CoursesContext';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { useRouter } from 'next/navigation';

interface ProgressSummaryProps {
  isLoading?: boolean;
}

export default function ProgressSummary({ isLoading = false }: ProgressSummaryProps) {
  const { myCourses, currentCourse } = useCourses();
  const { streak, weeklySchedule } = useSchedule();
  const router = useRouter();

  // Calculate progress metrics from real data
  const totalCourses = myCourses.length;

  // For now, use lessonCount as a proxy for progress
  // In a real implementation, we'd track CourseProgress per user
  const inProgressCount = myCourses.filter(c => c.lessonCount > 0).length;
  const completedCount = 0; // Would come from CourseProgress.isCompleted

  // Study streak
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  // Weekly study time
  const plannedMinutes = weeklySchedule?.totalPlannedMinutes || 0;
  const completedMinutes = weeklySchedule?.totalCompletedMinutes || 0;
  const weeklyProgress = plannedMinutes > 0
    ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
    : 0;

  // Progress circles data - now showing more meaningful metrics
  const progressData = [
    {
      value: totalCourses > 0 ? Math.round((inProgressCount / Math.max(totalCourses, 1)) * 100) : 0,
      label: 'Active',
      count: inProgressCount,
      unit: 'courses',
      color: '#10b981'
    },
    {
      value: currentStreak > 0 ? Math.min(100, currentStreak * 14) : 0, // Scale: 7 days = 100%
      label: 'Streak',
      count: currentStreak,
      unit: 'days',
      color: '#06b6d4'
    },
    {
      value: weeklyProgress,
      label: 'Weekly Goal',
      count: Math.round(completedMinutes / 60),
      unit: 'hours',
      color: '#f59e0b'
    }
  ];

  // Get the most recently accessed course for "Continue Learning"
  const recentCourse = myCourses[0]; // Would sort by lastAccessedAt
  const continueProgress = recentCourse
    ? Math.round((recentCourse.lessonCount > 1 ? 78 : 25)) // Placeholder until real progress tracking
    : 0;
  const currentLessonTitle = recentCourse?.title || 'Start a course';

  const handleContinue = () => {
    if (recentCourse) {
      router.push(`/dashboard/student/courses/${recentCourse.id}`);
    } else {
      router.push('/dashboard/student/courses');
    }
  };

  if (isLoading) {
    return (
      <Card className="flex-1 min-w-0">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-white/5 rounded w-24"></div>
          <div className="flex justify-between gap-4">
            <div className="w-20 h-20 bg-white/5 rounded-full"></div>
            <div className="w-20 h-20 bg-white/5 rounded-full"></div>
            <div className="w-20 h-20 bg-white/5 rounded-full"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 min-w-0">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white/95">Progress</h2>
        <p className="text-xs text-[#9aa6b2] mt-0.5">Your learning journey</p>
      </div>

      {/* Two-column layout: Circles (60%) | Continue Learning (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        {/* Progress Circles - left side */}
        <div className="lg:col-span-3 min-w-0 h-full flex items-center">
          <div className="flex items-start justify-between gap-3 w-full">
            {progressData.map((item, index) => (
              <div key={index} className="flex flex-col items-center min-w-0">
                <ProgressCircle
                  value={item.value}
                  size={80}
                  strokeWidth={5}
                  color={item.color}
                />
                <p className="text-xs font-medium text-white/90 mt-2">{item.label}</p>
                <p className="text-[11px] text-[#9aa6b2] mt-0.5">
                  {item.count} {item.unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Learning - right side */}
        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-white/8 pt-4 lg:pt-0 lg:pl-5 min-w-0 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white/95 leading-tight">
                {recentCourse ? 'Continue learning' : 'Get started'}
              </h3>
              <p className="text-[11px] text-[#9aa6b2] mt-0.5 leading-tight">
                {recentCourse ? 'Resume your course' : 'Create your first course'}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="px-2.5 py-1.5 rounded-lg border border-[#f59e0b] text-[#f59e0b] font-medium text-[11px] shrink-0 hover:bg-linear-to-r hover:from-[#d97706] hover:to-[#f59e0b] hover:text-white hover:border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              aria-label="Continue learning"
            >
              {recentCourse ? 'Continue →' : 'Browse →'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#0b0f12] border border-white/8 ring-1 ring-white/5">
            <div className="flex flex-col gap-2.5">

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-[#9aa6b2]">
                    {recentCourse ? 'Course Progress' : 'No active course'}
                  </p>
                  {recentCourse && (
                    <p className="text-[11px] font-semibold text-white/90">{continueProgress}%</p>
                  )}
                </div>
                <div className="relative w-full h-1.5 bg-[#0a0f14] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-[#059669] via-[#10b981] to-[#34d399] rounded-full"
                    style={{ width: `${continueProgress}%` }}
                  >
                    {continueProgress > 0 && (
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson meta */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-[#9aa6b2] mb-0.5">Current Course</p>
                  <p className="text-sm text-white/90 leading-tight truncate max-w-[140px]">
                    {currentLessonTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
