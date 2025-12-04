"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

/**
 * Protects dashboard routes based on allowed roles.
 * Example:
 *   useDashboardProtection(["admin"])
 *   useDashboardProtection(["student"])
 *   useDashboardProtection(["teacher"])
 */
export function useDashboardProtection(allowedRoles: Array<"student" | "teacher" | "admin">) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // still loading auth state

    // No user → send to login
    if (!user) {
      router.replace("/auth");
      return;
    }

    // If user has no role assigned yet → redirect to onboarding
    if (!role) {
      router.replace("/onboarding/choose-role");
      return;
    }

    // Role mismatch → redirect to the correct dashboard
    if (!allowedRoles.includes(role)) {
      if (role === "student") router.replace("/dashboard/student");
      else if (role === "teacher") router.replace("/dashboard/teacher");
      else if (role === "admin") router.replace("/dashboard/admin");

      return;
    }

  }, [user, role, loading, allowedRoles, router]);
}
