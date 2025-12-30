"use client";

import { useEffect } from 'react';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { ScheduleProvider, useSchedule } from '@/lib/context/ScheduleContext';
import WeeklyCalendar from '@/components/CBCStudent/Schedule/WeeklyCalendar';
import StudyBlockModal from '@/components/CBCStudent/Schedule/StudyBlockModal';
import LearningGoals from '@/components/CBCStudent/Schedule/LearningGoals';
import StreakReminders from '@/components/CBCStudent/Schedule/StreakReminders';

function ScheduleContent() {
    const { loadWeeklySchedule, isLoading } = useSchedule();

    useEffect(() => {
        loadWeeklySchedule();
    }, [loadWeeklySchedule]);

    return (
        <div className="max-w-5xl mx-auto pt-8 px-4 pb-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">My Schedule</h1>
                <p className="text-white/50">Plan your study sessions and track your progress</p>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 mx-auto mb-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/50">Loading schedule...</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main content - Calendar and Goals */}
                    <div className="lg:col-span-2 space-y-6">
                        <WeeklyCalendar />
                        <LearningGoals />
                    </div>

                    {/* Sidebar - Streak and Reminders */}
                    <div className="lg:col-span-1">
                        <StreakReminders />
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
            <ScheduleProvider>
                <ScheduleContent />
            </ScheduleProvider>
        </DashboardLayout>
    );
}
