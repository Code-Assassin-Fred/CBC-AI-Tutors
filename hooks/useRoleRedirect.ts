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
    if (loading) return;
    if (!user) return;

    const path = window.location.pathname;

    if (!role && path !== '/onboarding/choose-role') {
      router.replace('/onboarding/choose-role');
      return;
    }

    if (role && !onboardingComplete && !path.startsWith(`/onboarding/${role}`) && path !== '/onboarding/choose-role') {
      router.replace(`/onboarding/${role}`);
      return;
    }

    if (role && onboardingComplete && !path.startsWith(`/dashboard/${role}`)) {
      router.replace(`/dashboard/${role}`);
      return;
    }
  }, [user, role, onboardingComplete, loading, router]);
};

/**
 * Re-export hook for backward compatibility.
 */
export const useOnboardingProtection = () => {
  const { loading } = useAuth();
  return { isLoading: loading };
};