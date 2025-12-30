"use client";

import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { ResourcesProvider } from '@/lib/context/ResourcesContext';
import ResourceHub from '@/components/CBCStudent/Resources/ResourceHub';

export default function ResourcesPage() {
    return (
        <DashboardLayout active="Resources">
            <ResourcesProvider>
                <ResourceHub />
            </ResourcesProvider>
        </DashboardLayout>
    );
}
