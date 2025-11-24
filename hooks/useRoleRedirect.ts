// File: C:\Users\HP\Documents\cbc-ai-tutors\hooks\useRoleRedirect.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

/**
 * Hook to automatically redirect users based on their role and onboarding status.
 * 
 * Rules:
 * - No role → redirect to /onboarding/choose-role
 * - Role exists + onboarding incomplete → redirect to /onboarding/[role]
 * - Role exists + onboarding complete → redirect to /dashboard/[role]
 * 
 * The hook will not redirect if user is on a page they are allowed to access.
 */
export const useRoleRedirect = () => {
  const { user, role, onboardingComplete, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until auth state is resolved
    if (!user) return; // user not signed in yet, login page handles this

    const path = window.location.pathname;

    // 1️⃣ No role → choose-role
    if (!role && path !== '/onboarding/choose-role') {
      router.replace('/onboarding/choose-role');
      return;
    }

    // 2️⃣ Role exists, onboarding incomplete → onboarding page
    if (role && !onboardingComplete && !path.startsWith(`/onboarding/${role}`)) {
      router.replace(`/onboarding/${role}`);
      return;
    }

    // 3️⃣ Role exists, onboarding complete → dashboard page
    if (role && onboardingComplete && !path.startsWith(`/dashboard/${role}`)) {
      router.replace(`/dashboard/${role}`);
      return;
    }

    // Otherwise, allow current page (including choose-role if user wants to change role)
  }, [user, role, onboardingComplete, loading, router]);
};
