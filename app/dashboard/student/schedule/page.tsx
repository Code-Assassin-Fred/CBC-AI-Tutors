"use client";

import { useEffect } from 'react';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { ScheduleProvider, useSchedule } from '@/lib/context/ScheduleContext';
import { CoursesProvider } from '@/lib/context/CoursesContext';
import WeeklyCalendar from '@/components/CBCStudent/Schedule/WeeklyCalendar';
import StudyBlockModal from '@/components/CBCStudent/Schedule/StudyBlockModal';


function ScheduleContent() {
    const { loadWeeklySchedule, isLoading } = useSchedule();

    useEffect(() => {
        loadWeeklySchedule();
    }, [loadWeeklySchedule]);

    return (
        <div className="max-w-7xl mx-auto pt-8 px-4 pb-16">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6" />
                    <p className="text-white/40 font-bold animate-pulse">Syncing your schedule...</p>
                </div>
            ) : (
                <div className="w-full">
                    <WeeklyCalendar />
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
