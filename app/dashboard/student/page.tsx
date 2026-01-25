"use client";

import { useEffect } from 'react';
import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import LearningOverviewCard from '@/components/CBCStudent/dashboard/LearningOverviewCard';
import ProgressSummary from '@/components/CBCStudent/dashboard/ProgressSummary';
import UpcomingLessons from '@/components/CBCStudent/dashboard/UpcomingLessons';
import { GamificationHeader } from '@/components/gamification';
import { useAuth } from '@/lib/context/AuthContext';
import { ScheduleProvider, useSchedule } from '@/lib/context/ScheduleContext';
import { CoursesProvider, useCourses } from '@/lib/context/CoursesContext';

// Inner dashboard component that uses the contexts
function DashboardContent() {
    const { user } = useAuth();
    const { loadWeeklySchedule, isLoading: isScheduleLoading } = useSchedule();
    const { loadMyCourses, isLoadingMyCourses } = useCourses();

    const displayName = user?.displayName?.split(' ')[0] || 'Student';

    // Load data on mount
    useEffect(() => {
        loadWeeklySchedule();
        loadMyCourses();
    }, [loadWeeklySchedule, loadMyCourses]);

    // Date formatting
    const today = new Date();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateText = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const isLoading = isScheduleLoading || isLoadingMyCourses;

    return (
        <DashboardLayout active="Dashboard">
            {/* Page header chips */}
            <div className="max-w-7xl mx-auto mb-4 flex flex-row items-center justify-between gap-2 px-0">
                <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] min-w-0">
                    <span className="text-[10px] sm:text-xs text-[#9aa6b2] hidden sm:inline">Welcome Back!</span>
                    <span className="text-white/95 text-sm sm:text-base font-semibold leading-none truncate">
                        {displayName}
                    </span>
                </div>
                <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] min-w-0">
                    <span className="text-white/90 text-[11px] sm:text-base font-medium leading-none whitespace-nowrap">
                        {weekday.slice(0, 3)}
                    </span>
                    <span className="text-[#9aa6b2] text-[10px] sm:text-sm leading-none whitespace-nowrap">
                        {dateText}
                    </span>
                </div>
            </div>

            {/* Gamification Header - XP, Level, Streak, Neurons */}
            <div className="max-w-7xl mx-auto mb-6">
                <GamificationHeader />
            </div>

            {/* Main dashboard grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
                {/* Left: Activity column */}
                <div className="lg:col-span-5 space-y-6 min-w-0">
                    <LearningOverviewCard isLoading={isLoading} />
                </div>

                {/* Right */}
                <div className="lg:col-span-7 space-y-6 min-w-0">
                    <ProgressSummary isLoading={isLoading} />
                    <UpcomingLessons />
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function Page() {
    // Allow student role only
    useDashboardProtection(['student']);

    return (
        <ScheduleProvider>
            <CoursesProvider>
                <DashboardContent />
            </CoursesProvider>
        </ScheduleProvider>
    );
}
