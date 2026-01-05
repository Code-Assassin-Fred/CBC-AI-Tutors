"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import QuickActionsCard from '@/components/CBCTeacher/dashboard/QuickActionsCard';
import { useAuth } from '@/lib/context/AuthContext';

export default function Page() {
    // Allow teacher role only
    useDashboardProtection(['teacher']);
    const { user } = useAuth();

    const displayName = user?.displayName || 'Teacher';

    // Date formatting
    const today = new Date();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateText = today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <DashboardLayout active="Dashboard">
            {/* Page header chips */}
            <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between gap-4 px-0">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <span className="text-xs text-[#9aa6b2]">Welcome Back!</span>
                    <span className="text-white/95 text-base font-semibold leading-none">
                        {displayName}
                    </span>
                </div>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <span className="text-white/90 text-base font-medium leading-none">
                        {weekday}
                    </span>
                    <span className="text-[#9aa6b2] text-sm leading-none">
                        {dateText}
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Main dashboard grid */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 items-start pb-6">
                    {/* Full width Quick Actions for now, can be split later if we have more widgets */}
                    <div className="space-y-6 min-w-0">
                        <QuickActionsCard />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
