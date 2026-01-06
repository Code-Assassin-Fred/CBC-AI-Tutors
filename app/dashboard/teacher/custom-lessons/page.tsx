"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import { CustomLessonsProvider } from '@/lib/context/CustomLessonsContext';
import CustomLessonsPage from '@/components/CBCTeacher/CustomLessons/CustomLessonsPage';

export default function CustomLessonsRoute() {
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Custom Lessons">
            <CustomLessonsProvider>
                <CustomLessonsPage />
            </CustomLessonsProvider>
        </DashboardLayout>
    );
}
