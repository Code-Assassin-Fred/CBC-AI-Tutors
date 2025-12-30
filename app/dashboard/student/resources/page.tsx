'use client';

import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { ResourcesProvider } from '@/lib/context/ResourcesContext';
import ResourceHub from '@/components/CBCStudent/Resources/ResourceHub';

export default function ResourcesPage() {
    return (
        <DashboardLayout active="Resources">
            <ResourcesProvider>
                <div className="min-h-screen pb-12">
                    <ResourceHub />
                </div>
            </ResourcesProvider>
        </DashboardLayout>
    );
}
