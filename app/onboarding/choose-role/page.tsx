'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/context/AuthContext';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { saveRoleToDb } from '@/lib/api/onboarding';
import type { UserRole } from '@/types/onboarding';

// Unified CBC role options
const ROLE_OPTIONS: {
  id: UserRole;
  title: string;
  description: string;
  redirect: string;
}[] = [
  {
    id: 'student',
    title: 'CBC Student',
    description:
      'Learn independently with AI-personalised study plans and real-time feedback aligned to the CBC.',
    redirect: '/onboarding/student',
  },
  {
    id: 'teacher',
    title: 'CBC Teacher',
    description:
      'Create and manage AI-assisted lessons, monitor student progress, and personalise learning experiences.',
    redirect: '/onboarding/teacher',
  },
];

export default function ChooseRolePage() {
  const router = useRouter();

  const {
    user,
    role,
    onboardingComplete,
    setRole: setAuthRole,
    loading: authLoading,
  } = useAuth();

  // Call role redirect hook (side effect only)
  useRoleRedirect();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(role || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force login if user not present
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, user, router]);

  const handleNext = async () => {
    if (!user || !selectedRole || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Save role → API expects userId + role
      await saveRoleToDb(user.uid, selectedRole);

      // Update AuthContext
      setAuthRole(selectedRole);

      // Redirect to onboarding or dashboard
      if (!onboardingComplete) {
        const next = ROLE_OPTIONS.find((o) => o.id === selectedRole)?.redirect;
        if (next) router.replace(next);
      } else {
        router.replace(`/dashboard/${selectedRole}`);
      }
    } catch (err) {
      console.error('Failed to save role:', err);
      setError('Unable to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-between bg-white px-8 lg:px-16 py-8">
      <div className="w-full max-w-2xl space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.id;
            const isCurrentRole = role === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedRole(option.id)}
                disabled={loading}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 relative
                  ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 border-dashed bg-white hover:border-gray-400'}
                  ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
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
          disabled={!selectedRole || loading}
          className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 ${
            !selectedRole || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-900 hover:bg-indigo-800'
          }`}
        >
          {loading ? (
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
