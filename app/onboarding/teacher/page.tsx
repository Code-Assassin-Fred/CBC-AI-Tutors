'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackToRoleSelection from '@/components/shared/BackToRoleSelection';
import { useAuth } from '@/lib/context/AuthContext';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { setTeacherProfile } from '@/lib/api/onboarding';
import type { TeacherOnboardingData } from '@/types/onboarding';

type TeacherFormValues = {
  subject: string;
  school: string;
  api?: string;
};

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const { user, setOnboardingComplete, loading: authLoading } = useAuth();
  const { isLoading: guardLoading } = useOnboardingProtection();

  const [formErrors, setFormErrors] = useState<{ [key: string]: string | undefined }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await setTeacherProfile({
        userId: user.uid,
        name: user.displayName || 'Teacher',
        subject: '',
        school: '',
        yearsExperience: '0',
      });

      if (!response.success) throw new Error(response.message ?? 'Failed to complete onboarding');

      setOnboardingComplete(true);
      router.replace('/dashboard/teacher');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setFormErrors({ api: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || guardLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-between bg-white px-8 lg:px-16 py-8">
      <div className="w-full max-w-2xl">
        <p className="text-gray-600 mb-8 font-medium mt-12 text-xl">We're excited to have you join our teaching community. Click below to get started with your AI-powered teaching tools.</p>

        {formErrors.api && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {formErrors.api}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 ${isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-900 hover:bg-indigo-800'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Setting up...
              </>
            ) : (
              <>
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          <BackToRoleSelection />
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center w-full max-w-xl">
        <img src="/teacher_s628.svg" alt="Teacher workspace illustration" className="w-full h-auto" />
      </div>
    </div>
  );
}
