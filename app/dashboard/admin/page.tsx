"use client";

import { useDashboardProtection } from "@/hooks/useDashboardProtection";
import GeneratePage from "@/components/shared/textbookGenerator";

export default function AdminPage() {
  // Require admin role
  useDashboardProtection(["admin"]); 

  return <GeneratePage />;
}
