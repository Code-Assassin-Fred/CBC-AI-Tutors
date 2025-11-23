"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import LearningOverviewCard from '@/components/CBCStudent/dashboard/LearningOverviewCard';
import ProgressSummary from '@/components/CBCStudent/dashboard/ProgressSummary';
import UpcomingLessons from '@/components/CBCStudent/dashboard/UpcomingLessons';
import { useAuthUser } from '@/lib/hooks';
import { formatDateParts } from '@/lib/date';

export default function Page() {
    // Allow student-type roles only; must be onboarded
    useDashboardProtection(['individual-student', 'institution-student']);
    const { user, profile } = useAuthUser();
    const displayName = profile?.displayName || user?.displayName || 'Student';
    const today = new Date();
    const { weekday, dateText } = formatDateParts(today);

    return (
        <DashboardLayout active="Dashboard">
            {/* Page header chips */}
            <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between gap-4 px-0">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <span className="text-xs text-[#9aa6b2]">Welcome Back!</span>
                    <span className="text-white/95 text-base font-semibold leading-none">{displayName}</span>
                </div>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <span className="text-white/90 text-base font-medium leading-none">{weekday}</span>
                    <span className="text-[#9aa6b2] text-sm leading-none">{dateText}</span>
                </div>
            </div>

            {/* Main dashboard grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 lg:auto-rows-fr gap-6 items-start">
                {/* Left: Activity column (spans two rows) */}
                <div className="lg:col-span-5 lg:row-span-2 space-y-6 min-w-0">
                    <LearningOverviewCard />
                </div>

                {/* Right: Two cards stacked to match Activity height */}
                <div className="lg:col-span-7 space-y-6 min-w-0">
                    {/* Top: Progress Summary fills remaining width */}
                    <ProgressSummary />
                    {/* Bottom: Upcoming Lessons */}
                    <UpcomingLessons />
                </div>
            </div>
        </DashboardLayout>
    );
}