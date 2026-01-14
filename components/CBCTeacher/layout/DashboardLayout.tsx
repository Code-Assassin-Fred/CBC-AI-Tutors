'use client';

import React from 'react';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    active?: string;
}

export default function DashboardLayout({ children, active }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen overflow-hidden bg-gradient-to-br from-[#0a0f14] via-[#0b1113] to-[#0a0f14]">
            {/* Sidebar */}
            <SidebarNav active={active} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* TopBar */}
                <TopBar />

                {/* Main Content - scrollable, with bottom padding for mobile nav if applicable */}
                <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 pb-20 md:pb-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
