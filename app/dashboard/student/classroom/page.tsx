"use client";

import ClassroomLayout from '@/components/CBCStudent/Classroom/layout/ClassroomLayout';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function ClassroomPage() {
  // Keep dashboard protection for student roles
  useDashboardProtection(['individual-student', 'institution-student']);

  return (
    <DashboardLayout active="Classroom">
      <ClassroomLayout />
    </DashboardLayout>
  );
}
