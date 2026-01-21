"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import { AssessmentsProvider } from '@/lib/context/AssessmentsContext';
import AssessmentsPage from '@/components/CBCTeacher/Assessments/AssessmentsPage';

export default function AssessmentsRoute() {
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Create Assessments">
            <AssessmentsProvider>
                <AssessmentsPage />
            </AssessmentsProvider>
        </DashboardLayout>
    );
}
