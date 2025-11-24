'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser, useAuthActions, useFormState } from '@/lib/hooks';
import { useOnboarding } from '@/lib/context/OnboardingContext';
import { setTeacherProfile } from '@/lib/api';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';
import BackToRoleSelection from '@/components/onboarding/BackToRoleSelection';

type TeacherFormValues = {
  name: string;
  subject: string;
  curriculum: 'CBC' | 'GCSE' | 'Other' | '';
  school: string;
  otherCurriculum?: string;
};

const TEACHER_FEATURES = [
  'AI-powered lesson plan generation for any topic',
  'Create quizzes and exams with customizable difficulty',
  'Personalized dashboard with your curriculum and schedule',
  'Resource library to save and organize all your materials',
  'Interactive classroom workspace with AI tutor assistant',
  'Track student progress with intelligent analytics',
  'Browse curriculum-aligned content (CBC/GCSE)',
  'Download and share your teaching materials easily',
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  const { setIsLoading } = useOnboarding();
  const { loading: actionLoading, setError: setGlobalError } = useAuthActions();
  const { isLoading: guardLoading } = useOnboardingProtection();

  const form = useFormState<TeacherFormValues>({
    name: '',
    subject: '',
    curriculum: '',
    school: '',
    otherCurriculum: '',
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

  if (authLoading || guardLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  const validateStep = (currentStep: number) => {
    form.clearErrors();

    if (currentStep === 1) {
      let valid = true;
      if (!form.values.name.trim()) {
        form.setError('name', 'Please enter your full name');
        valid = false;
      }
      if (!form.values.subject.trim()) {
        form.setError('subject', 'Please enter your subject');
        valid = false;
      }
      if (!form.values.school.trim()) {
        form.setError('school', 'Please enter your school name');
        valid = false;
      }
      return valid;
    }

    if (currentStep === 2) {
      if (!form.values.curriculum) {
        form.setError('curriculum', 'Please select a curriculum');
        return false;
      }
      if (form.values.curriculum === 'Other' && !form.values.otherCurriculum?.trim()) {
        form.setError('otherCurriculum', 'Please specify your curriculum');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(totalSteps)) {
      return;
    }

    setIsLoading(true);
    form.setSubmitting(true);

    try {
      const response = await setTeacherProfile(user.uid, {
        name: form.values.name.trim(),
        subject: form.values.subject.trim(),
        school: form.values.school.trim(),
        curriculum: form.values.curriculum === 'Other'
          ? (form.values.otherCurriculum || '')
          : form.values.curriculum,
        yearsExperience: '0',
      });

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      if (form.values.curriculum === 'CBC') {
        router.replace('/dashboard/teacher/cbc');
      } else if (form.values.curriculum === 'GCSE') {
        router.replace('/dashboard/teacher/gcse');
      } else {
        router.replace('/dashboard/teacher/other');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
      form.setError('api', message);
      setGlobalError(message);
    } finally {
      setIsLoading(false);
      form.setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-between bg-white px-8 lg:px-16 py-8">
      {/* Left Section - Form */}
      <div className="w-full max-w-2xl">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-5">
              Tell us about yourself
            </h1>

            <div className="space-y-4 mb-6">
              <div>
                <input
                  value={form.values.name}
                  onChange={(e) => form.setValue('name', e.target.value)}
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                  placeholder="Full Name"
                />
                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
              </div>

              <div>
                <input
                  value={form.values.subject}
                  onChange={(e) => form.setValue('subject', e.target.value)}
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                  placeholder="Subject you teach (e.g., Mathematics, English)"
                />
                {form.errors.subject && <p className="mt-1 text-sm text-red-600">{form.errors.subject}</p>}
              </div>

              <div>
                <input
                  value={form.values.school}
                  onChange={(e) => form.setValue('school', e.target.value)}
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.school ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                  placeholder="School / Institution"
                />
                {form.errors.school && <p className="mt-1 text-sm text-red-600">{form.errors.school}</p>}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Curriculum */}
        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-5">
              Which curriculum do you teach?
            </h1>

            <div className="space-y-3 mb-6">
              {(['CBC', 'GCSE', 'Other'] as const).map((curriculum) => {
                const isSelected = form.values.curriculum === curriculum;
                return (
                  <button
                    key={curriculum}
                    type="button"
                    onClick={() => form.setValue('curriculum', curriculum)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50'
                          : 'border-gray-300 border-dashed bg-white hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-base font-semibold text-gray-900">{curriculum}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {form.errors.curriculum && (
              <p className="mb-4 text-sm text-red-600">{form.errors.curriculum}</p>
            )}

            {form.values.curriculum === 'Other' && (
              <div className="mb-6">
                <input
                  value={form.values.otherCurriculum}
                  onChange={(e) => form.setValue('otherCurriculum', e.target.value)}
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.otherCurriculum ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                  placeholder="Specify your curriculum"
                />
                {form.errors.otherCurriculum && (
                  <p className="mt-1 text-sm text-red-600">{form.errors.otherCurriculum}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 3: Features Guide */}
        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-5">
              Teacher features at a glance
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Everything you need to create engaging lessons and manage your classroom effectively.
            </p>

            <ul className="space-y-3 mb-10">
              {TEACHER_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {form.errors.api && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {form.errors.api}
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button
              onClick={handlePrev}
              disabled={actionLoading}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
            >
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={actionLoading}
              className="px-8 py-3 rounded-lg font-medium text-white bg-indigo-900 hover:bg-indigo-800 transition-all duration-200 flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={actionLoading || form.isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 ${
                actionLoading || form.isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-900 hover:bg-indigo-800'
              }`}
            >
              {form.isSubmitting ? (
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
          )}
        </div>

        {step === 1 && (
          <div className="mt-6">
            <BackToRoleSelection />
          </div>
        )}
      </div>

      {/* Right Section - Illustration */}
      <div className="hidden lg:flex items-center justify-center w-full max-w-xl">
        <img
          src="/educator.svg"
          alt="Teacher workspace illustration"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}