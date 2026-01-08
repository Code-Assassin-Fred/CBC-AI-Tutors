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
      {/* Sidebar - hidden on mobile via SidebarNav component */}
      <SidebarNav active={active} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar />

        {/* Main Content - scrollable, with bottom padding for mobile nav */}
        <main className="flex-1 px-3 sm:px-4 md:px-6 lg:px-10 py-4 md:py-6 pb-20 md:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
