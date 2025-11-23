"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import DashboardLayout from '@/components/Teacher/layout/DashboardLayout';
import WelcomeHeaderCard from '@/components/Teacher/dashboard/WelcomeHeaderCard';
import QuickActionsCard from '@/components/Teacher/dashboard/QuickActionsCard';
import RecentLessonsCard from '@/components/Teacher/dashboard/RecentLessonsCard';
import UpcomingScheduleCard from '@/components/Teacher/dashboard/UpcomingScheduleCard';

export default function Page() {
    // Allow teacher role only; must be onboarded
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Dashboard">
            {/* Welcome Header */}
            <div className="max-w-7xl mx-auto">
                <WelcomeHeaderCard />
            </div>

            {/* Main dashboard grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left column: Quick Actions (spans 5 columns) */}
                <div className="lg:col-span-5 space-y-6 min-w-0">
                    <QuickActionsCard />
                </div>

                {/* Right column: Recent Lessons & Schedule (spans 7 columns) */}
                <div className="lg:col-span-7 space-y-6 min-w-0">
                    <RecentLessonsCard />
                    <UpcomingScheduleCard />
                </div>
            </div>
        </DashboardLayout>
    );
}