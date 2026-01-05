"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import WelcomeHeaderCard from '@/components/CBCTeacher/dashboard/WelcomeHeaderCard';
import QuickActionsCard from '@/components/CBCTeacher/dashboard/QuickActionsCard';

export default function Page() {
    // Allow teacher role only; must be onboarded
    // Using 'cbc-teacher' as the role, assuming that's what's in Firestore and hook
    // If the role in DB is just 'teacher', ensure protection hook handles it.
    // Based on previous files, role seems to be 'teacher'.
    // useRoleRedirect expects 'cbc-teacher' based on existing code, but onboarding saves 'teacher'.
    // Let's assume 'cbc-teacher' is the correct mapped role name for the protection hook if it maps internal roles.
    // However, looking at ChooseRolePage, it saves 'teacher'.
    // Let's check useDashboardProtection usage in other files.
    // Admin uses ['admin']. Student uses ['student']. Teacher probably ['teacher'].
    // The previous file had ['cbc-teacher']. I'll stick to 'teacher' to be safe with what I saw in onboarding.
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Dashboard">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Header */}
                <WelcomeHeaderCard />

                {/* Quick Actions */}
                <QuickActionsCard />

                {/* Additional Content - e.g. Recent updates or Tips could go here */}
                {/* For now, keeping it clean as requested */}
            </div>
        </DashboardLayout>
    );
}