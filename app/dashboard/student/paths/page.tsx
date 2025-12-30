'use client';

import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CareerProvider } from '@/lib/context/CareerContext';
import CareerPathDiscovery from '@/components/CBCStudent/Careerpaths/CareerPathDiscovery';

export default function CareerPathsPage() {
    return (
        <DashboardLayout active="Career Paths">
            <CareerProvider>
                <div className="min-h-screen pb-12">
                    <CareerPathDiscovery />
                </div>
            </CareerProvider>
        </DashboardLayout>
    );
}
