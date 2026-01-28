'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackToRoleSelection from '@/components/shared/BackToRoleSelection';
import { useAuth } from '@/lib/context/AuthContext';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import { onboardStudent } from '@/lib/api/onboarding';
import type { StudentOnboardingData } from '@/types/onboarding';

type StudentFormValues = {
  grade: string;
};

const GRADES = [
  'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7 (JSS 1)', 'Grade 8 (JSS 2)', 'Grade 9 (JSS 3)',
  'Grade 10 (SSS 1)', 'Grade 11 (SSS 2)', 'Grade 12 (SSS 3)'
];

const STUDENT_FEATURES = [
  'Interactive Classroom - Get real-time feedback and assistance from your AI tutor',
  'Personalized Courses - AI-generated study plans and materials for your specific needs',
  'Curated Resources - Access a rich library of learning materials for every topic',
  'Career Pathing - Discover and prepare for your future career opportunities',
  'Learning Community - Connect and learn with other students in a safe environment',
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, setOnboardingComplete, loading: authLoading } = useAuth();
  const { isLoading: guardLoading } = useOnboardingProtection();

  const [formValues, setFormValues] = useState<StudentFormValues>({ grade: '' });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | undefined }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!formValues.grade) {
      setFormErrors({ grade: 'Please select your grade' });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await onboardStudent({
        userId: user.uid,
        name: user.displayName || 'Student',
        grade: formValues.grade,
      });

      if (!response.success) throw new Error(response.message ?? 'Failed to complete onboarding');

      setOnboardingComplete(true);
      router.replace('/dashboard/student');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-5">Welcome to Curio</h1>
        <p className="text-gray-600 mb-8">We're excited to have you join our learning community. Here's what you can do:</p>

        <ul className="space-y-3 mb-10">
          {STUDENT_FEATURES.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-700">
              <span className="text-blue-500 font-bold mt-1">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select your grade to get started</label>
          <select
            value={formValues.grade}
            onChange={(e) => setFormValues({ ...formValues, grade: e.target.value })}
            className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${formErrors.grade ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
              }`}
          >
            <option value="" disabled>Select your grade</option>
            {GRADES.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          {formErrors.grade && <p className="mt-2 text-sm text-red-600">{formErrors.grade}</p>}
        </div>

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
        <img src="/choose role.svg" alt="Student learning illustration" className="w-full h-auto" />
      </div>
    </div>
  );
}
