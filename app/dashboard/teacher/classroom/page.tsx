"use client";

import ClassroomLayout from '@/components/Teacher/Classroom/layout/ClassroomLayout';
import DashboardLayout from '@/components/Teacher/layout/DashboardLayout';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';

export default function ClassroomPage() {
  // Keep dashboard protection for student roles (mapped to cbc-student)
  useDashboardProtection(['cbc-student']);

  return (
    <DashboardLayout active="Classroom">
      <ClassroomLayout />
    </DashboardLayout>
  );
}
