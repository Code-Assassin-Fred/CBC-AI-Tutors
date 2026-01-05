"use client";

import { useDashboardProtection } from "@/hooks/useDashboardProtection";
import DashboardLayout from "@/components/CBCStudent/layout/DashboardLayout";
import GeneratePage from "@/components/shared/textbookGenerator";
import { ScheduleProvider } from "@/lib/context/ScheduleContext";
import { CoursesProvider } from "@/lib/context/CoursesContext";
import { SidebarProvider } from "@/lib/context/SidebarContext";

function AdminDashboardContent() {
  return (
    <DashboardLayout active="Admin">
      {/* Page header chips - Inspired by student dashboard */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between gap-4 px-0">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <span className="text-xs text-[#9aa6b2]">Admin Control Center</span>
          <span className="text-white/95 text-base font-semibold leading-none">
            Content Generation
          </span>
        </div>
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f12] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <span className="text-white/90 text-sm font-medium leading-none">
            CBC AI Tutors
          </span>
        </div>
      </div>

      <GeneratePage />
    </DashboardLayout>
  );
}

export default function AdminPage() {
  // Require admin role
  useDashboardProtection(["admin"]);

  return (
    <SidebarProvider>
      <ScheduleProvider>
        <CoursesProvider>
          <AdminDashboardContent />
        </CoursesProvider>
      </ScheduleProvider>
    </SidebarProvider>
  );
}
