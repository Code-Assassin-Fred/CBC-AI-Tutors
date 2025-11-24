'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthUser, useAuthActions } from '@/lib/hooks';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import { setRole } from '@/lib/api';
import type { UserRole } from '@/lib/types';

type RoleOption = {
  id: UserRole;
  title: string;
  description: string;
  fallbackRedirect: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'individual-student',
    title: 'Individual Student',
    description:
      'Learn independently with AI-personalised study plans and real-time feedback.',
    fallbackRedirect: '/onboarding/student',
  },
  {
    id: 'upskill-individual',
    title: 'Upskill Individual',
    description:
      'Accelerate your career with curated skill paths and adaptive AI learning tools.',
    fallbackRedirect: '/onboarding/upskill',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    description:
      'Create and manage AI-assisted lessons, monitor student progress, and personalise learning experiences.',
    fallbackRedirect: '/onboarding/teacher',
  },
];

const ROLE_REDIRECT: Record<UserRole, string> = {
  'individual-student': '/onboarding/student',
  'institution-student': '/onboarding/student',
  'institution-admin': '/onboarding/institution',
  'upskill-individual': '/onboarding/upskill',
  teacher: '/onboarding/teacher',
};

export default function ChooseRolePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, error: profileError, refreshProfile } = useAuthUser();
  const { isLoading: guardLoading } = useOnboardingProtection();
  const { loading: actionLoading, error: actionError, clearError, withErrorHandling } =
    useAuthActions();
  const { setIsLoading } = useOnboarding();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Redirect to /auth if not authenticated
  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  const pageLoading = authLoading || guardLoading;

  const handleNext = async () => {
    if (!user || actionLoading || !selectedRole) return;

    clearError();
    setIsLoading(true);

    try {
      const response = await withErrorHandling(() => setRole(user.uid, { role: selectedRole }));
      if (!response) return;

      await refreshProfile();

      const destination =
        response.redirectUrl ||
        ROLE_REDIRECT[selectedRole] ||
        ROLE_OPTIONS.find((option) => option.id === selectedRole)?.fallbackRedirect;

      if (destination) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        router.replace(destination);
      }
    } catch (err) {
      console.error('Role selection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOADING STATE =====
  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  // ===== PROFILE ERROR =====
  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">We ran into an issue</h1>
          <p className="text-gray-600">
            We couldn't load your profile information. Please retry in a few moments.
          </p>
        </div>
      </div>
    );
  }

  // ===== MAIN CONTENT =====
  return (
    <div className="min-h-screen flex items-center justify-between bg-white px-8 lg:px-16 py-8">
      {/* Left Section - Form */}
      <div className="w-full max-w-2xl">
        {actionError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {actionError}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.id;
            const isCurrentRole = profile?.role === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedRole(option.id)}
                disabled={actionLoading}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 relative
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-gray-300 border-dashed bg-white hover:border-gray-400'
                  }
                  ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">{option.title}</h3>
                    {isCurrentRole && (
                      <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-snug">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={!selectedRole || actionLoading}
          className={`
            px-8 py-3 rounded-lg font-medium text-white transition-all duration-200
            flex items-center gap-2
            ${
              !selectedRole || actionLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-900 hover:bg-indigo-800'
            }
          `}
        >
          {actionLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Setting up...
            </>
          ) : (
            <>
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:flex items-center justify-center w-full max-w-xl">
        <img
          src="/choose role.svg"
          alt="Choose your role illustration"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
