"use client";

import { Suspense } from 'react';
import ClassroomLayout from '@/components/CBCStudent/Classroom/layout/ClassroomLayout';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useDashboardProtection';

function ClassroomContent() {
  return <ClassroomLayout />;
}

export default function ClassroomPage() {
  // Keep dashboard protection for student roles
  useDashboardProtection(['student']);

  return (
    <DashboardLayout active="Classroom">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-white/50">Loading classroom...</div>
        </div>
      }>
        <ClassroomContent />
      </Suspense>
    </DashboardLayout>
  );
}
