'use client';

import React, { useEffect, useState } from 'react';
import Card from '../shared/Card';
import ProgressCircle from '../shared/ProgressCircle';
import { useCourses } from '@/lib/context/CoursesContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProgressSummaryProps {
  isLoading?: boolean;
}

export default function ProgressSummary({ isLoading: initialLoading = false }: ProgressSummaryProps) {
  const { myCourses, currentCourse } = useCourses();
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [cbeData, setCbeData] = useState({
    totalSubstrands: 0,
    completedSubstrands: 0,
    averageQuizScore: 0,
  });

  // Fetch CBE Progress data
  useEffect(() => {
    if (!user) return;

    const fetchCbeProgress = async () => {
      setIsLoading(true);
      try {
        // 1. Get user grade
        const settingsRes = await fetch(`/api/user/${user.uid}/settings`);
        const settingsData = await settingsRes.json();
        const grade = settingsData.settings?.grade || '8'; // Default to 8 if not set

        // 2. Fetch curriculum for total substrands
        const curriculumRes = await fetch(`/api/curriculum?grade=${grade}`);
        const curriculum = await curriculumRes.json();

        // Count total substrands
        let totalCount = 0;
        Object.values(curriculum).forEach((subject: any) => {
          if (subject.Strands) {
            Object.values(subject.Strands).forEach((strand: any) => {
              if (strand.SubStrands) {
                totalCount += Object.keys(strand.SubStrands).length;
              }
            });
          }
        });

        // 3. Fetch user activities
        const activityRes = await fetch(`/api/user/activity?userId=${user.uid}`);
        const activityData = await activityRes.json();
        const activities = activityData.activities || [];

        // Identify unique substrands with activity
        const uniqueSubstrands = new Set();
        let totalQuizScore = 0;
        let quizCount = 0;

        activities.forEach((act: any) => {
          if (act.context?.substrand) {
            uniqueSubstrands.add(`${act.context.subject}_${act.context.substrand}`);
          }
          if (act.type === 'quiz' && typeof act.score === 'number') {
            totalQuizScore += act.score;
            quizCount++;
          }
        });

        const avgScore = quizCount > 0 ? Math.round(totalQuizScore / quizCount) : 0;

        setCbeData({
          totalSubstrands: Math.max(totalCount, 1),
          completedSubstrands: uniqueSubstrands.size,
          averageQuizScore: avgScore,
        });
      } catch (error) {
        console.error('Failed to fetch CBE progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCbeProgress();
  }, [user]);

  // Calculate Course metric
  const totalCourses = myCourses.length;
  const coursesCompleted = myCourses.filter(c => c.lessonCount > 0 && c.lessonCount === (currentCourse?.progress?.completedLessons?.length || 0)).length; // Simple heuristic
  const coursesProgress = totalCourses > 0 ? Math.round((coursesCompleted / totalCourses) * 100) : 0;

  // CBE Lesson Progress
  const cbeLessonProgress = Math.round((cbeData.completedSubstrands / cbeData.totalSubstrands) * 100);

  // CBE Performance: (Avg Quiz * 0.7) + (Lesson Progress * 0.3)
  const cbePerformance = Math.min(100, Math.round((cbeData.averageQuizScore * 0.7) + (cbeLessonProgress * 0.3)));

  // Progress circles data
  const progressData = [
    {
      value: coursesProgress,
      label: 'Courses',
      count: coursesCompleted,
      unit: 'completed',
      color: '#10b981'
    },
    {
      value: cbeLessonProgress,
      label: 'CBE Lessons',
      count: cbeData.completedSubstrands,
      unit: 'started',
      color: '#06b6d4'
    },
    {
      value: cbePerformance,
      label: 'CBE Performance',
      count: cbePerformance,
      unit: '% score',
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
        <h2 className="text-sm sm:text-base font-semibold text-white/95">Progress</h2>
        <p className="text-[10px] sm:text-xs text-[#9aa6b2] mt-0.5">Your learning journey</p>
      </div>

      {/* Mobile/Tablet: Stack, Desktop: Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        {/* Progress Circles - left side */}
        <div className="lg:col-span-3 min-w-0 h-full flex items-center">
          <div className="flex items-start justify-between sm:justify-around gap-2 sm:gap-3 w-full">
            {progressData.map((item, index) => (
              <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                {/* Mobile size - smaller circle */}
                <div className="sm:hidden">
                  <ProgressCircle
                    value={item.value}
                    size={60}
                    strokeWidth={4}
                    color={item.color}
                  />
                </div>
                {/* Desktop size - larger circle */}
                <div className="hidden sm:block">
                  <ProgressCircle
                    value={item.value}
                    size={80}
                    strokeWidth={5}
                    color={item.color}
                  />
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-white/90 mt-2">{item.label}</p>
                <p className="text-[9px] sm:text-[11px] text-[#9aa6b2] mt-0.5 text-center">
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
              <h3 className="text-xs sm:text-sm font-semibold text-white/95 leading-tight">
                {recentCourse ? 'Continue learning' : 'Get started'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#9aa6b2] mt-0.5 leading-tight">
                {recentCourse ? 'Resume your course' : 'Create your first course'}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#f59e0b] text-[#f59e0b] font-medium text-[10px] sm:text-[11px] shrink-0 hover:bg-linear-to-r hover:from-[#d97706] hover:to-[#f59e0b] hover:text-white hover:border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40"
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
