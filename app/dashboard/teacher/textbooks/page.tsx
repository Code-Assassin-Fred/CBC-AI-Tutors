"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import { CustomTextbooksProvider } from '@/lib/context/CustomTextbooksContext';
import CustomTextbooksPage from '@/components/CBCTeacher/CustomTextbooks/CustomTextbooksPage';

export default function TextbooksRoute() {
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Custom Textbooks">
            <CustomTextbooksProvider>
                <CustomTextbooksPage />
            </CustomTextbooksProvider>
        </DashboardLayout>
    );
}
