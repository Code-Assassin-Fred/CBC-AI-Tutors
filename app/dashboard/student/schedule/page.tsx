"use client";

import { useEffect } from 'react';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { ScheduleProvider, useSchedule } from '@/lib/context/ScheduleContext';
import { CoursesProvider } from '@/lib/context/CoursesContext';
import WeeklyCalendar from '@/components/CBCStudent/Schedule/WeeklyCalendar';
import StudyBlockModal from '@/components/CBCStudent/Schedule/StudyBlockModal';
import StudyStats from '@/components/CBCStudent/Schedule/StudyStats';

function ScheduleContent() {
    const { loadWeeklySchedule, isLoading } = useSchedule();

    useEffect(() => {
        loadWeeklySchedule();
    }, [loadWeeklySchedule]);

    return (
        <div className="max-w-7xl mx-auto pt-8 px-4 pb-16">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Focus Hub</h1>
                    <p className="text-white/40 font-medium">Design your learning journey and track every milestone.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
                        <span className="text-sky-400 text-sm font-bold">AI Optimized</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6" />
                    <p className="text-white/40 font-bold animate-pulse">Syncing your schedule...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stats Dashboard */}
                    <StudyStats />

                    {/* Main content - Calendar (Full Width now) */}
                    <div className="w-full">
                        <WeeklyCalendar />
                    </div>
                </div>
            )}

            {/* Block Modal */}
            <StudyBlockModal />
        </div>
    );
}

export default function SchedulePage() {
    return (
        <DashboardLayout active="Schedule">
            <CoursesProvider>
                <ScheduleProvider>
                    <ScheduleContent />
                </ScheduleProvider>
            </CoursesProvider>
        </DashboardLayout>
    );
}
