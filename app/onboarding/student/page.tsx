'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackToRoleSelection from '@/components/shared/BackToRoleSelection';
import { useAuth } from '@/lib/context/AuthContext';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';

type StudentFormValues = {
  name: string;
  curriculum: CurriculumType;
  api?: string;
};

const CURRICULA: { value: CurriculumType; label: string; description: string }[] = [
  {
    value: 'CBC',
    label: 'CBC (Competency-Based Curriculum)',
    description: "Kenya's current curriculum focusing on competency development",
  },
];

const CURRICULUM_GUIDES: Record<CurriculumType, string[]> = {
  CBC: [
    'Master all CBC competencies with AI-powered guidance',
    'Prepare for CBC assessments and national exams',
    'Access interactive lessons aligned with the Kenyan curriculum',
    'Track your progress across all learning areas',
    'Get personalized homework help and tutoring',
    'Use our immersive classroom enhanced with AI',
  ],
};

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, setOnboardingComplete, loading: authLoading } = useAuth();
  const { isLoading: guardLoading } = useOnboardingProtection();

  const form = useFormState<StudentFormValues>({ name: '', curriculum: 'CBC' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    form.setError('api', undefined);

    try {
      const response = await onboardStudent(user.uid, {
        name: form.values.name.trim(),
        age: 15, // Optional default
        curriculum: form.values.curriculum,
      });

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      // Update onboarding status in context
      setOnboardingComplete(true);

      // Redirect to dashboard
      router.replace('/dashboard/student');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
      form.setError('api', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const guideItems = form.values.curriculum ? CURRICULUM_GUIDES[form.values.curriculum] : [];

  if (authLoading || guardLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-between bg-white px-8 lg:px-16 py-8">
      {/* Left Section */}
      <div className="w-full max-w-2xl">
        {/* Name */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">What is your name?</h1>
        <div className="mb-8">
          <input
            type="text"
            value={form.values.name}
            onChange={(e) => form.setValue('name', e.target.value)}
            placeholder="Enter your name"
            className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              form.errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
            }`}
          />
          {form.errors.name && <p className="mt-2 text-sm text-red-600">{form.errors.name}</p>}
        </div>

        {/* Curriculum */}
        <h1 className="text-3xl font-bold text-gray-900 mb-5">Which curriculum do you follow?</h1>
        <div className="space-y-3 mb-6">
          {CURRICULA.map((curriculum) => {
            const isSelected = form.values.curriculum === curriculum.value;
            return (
              <button
                key={curriculum.value}
                type="button"
                onClick={() => form.setValue('curriculum', curriculum.value)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-300 border-dashed bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-0.5">{curriculum.label}</h3>
                    <p className="text-xs text-gray-600">{curriculum.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {form.errors.curriculum && <p className="mb-4 text-sm text-red-600">{form.errors.curriculum}</p>}

        {/* Guide */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">What you can do with the CBC curriculum</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your AI-powered learning experience is tailored to help you succeed.
        </p>
        <ul className="space-y-3 mb-10">
          {guideItems.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700">
              <span className="text-blue-500 font-bold mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {form.errors.api && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {form.errors.api}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <BackToRoleSelection />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 ${
              isSubmitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-900 hover:bg-indigo-800'
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
        </div>
      </div>

      {/* Right Illustration */}
      <div className="hidden lg:flex items-center justify-center w-full max-w-xl">
        <img src="/choose role.svg" alt="Student learning illustration" className="w-full h-auto" />
      </div>
    </div>
  );
}
