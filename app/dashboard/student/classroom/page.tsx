"use client";

import ClassroomLayout from '@/components/CBCStudent/Classroom/layout/ClassroomLayout';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useDashboardProtection';

export default function ClassroomPage() {
  // Keep dashboard protection for student roles
  useDashboardProtection(['student']);

  return (
    <DashboardLayout active="Classroom">
      <ClassroomLayout />
    </DashboardLayout>
  );
}
