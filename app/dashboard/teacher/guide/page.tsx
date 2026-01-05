"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import TeachersGuideLayout from '@/components/CBCTeacher/TeachersGuide/TeachersGuideLayout';

export default function TeachersGuidePage() {
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Teachers Guide">
            <TeachersGuideLayout />
        </DashboardLayout>
    );
}
