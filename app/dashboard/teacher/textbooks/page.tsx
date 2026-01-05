"use client";

import { useDashboardProtection } from '@/hooks/useDashboardProtection';
import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import GeneratePage from '@/components/shared/textbookGenerator';

export default function TextbookGeneratorPage() {
    useDashboardProtection(['teacher']);

    // We wrap GeneratePage in a div to ensure it doesn't conflict with layout styles if it has absolute positioning
    // But usually it's fine.

    return (
        <DashboardLayout active="Custom Textbooks">
            <div className="h-full">
                <GeneratePage />
            </div>
        </DashboardLayout>
    );
}
