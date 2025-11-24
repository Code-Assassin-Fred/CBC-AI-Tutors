'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackToRoleSelection from '@/components/shared/BackToRoleSelection';
import { useAuth } from '@/lib/context/AuthContext';
import { useOnboardingProtection } from '@/hooks/useRoleRedirect';

type TeacherFormValues = {
  name: string;
  subject: string;
  school: string;
  api?: string;
};

const TEACHER_FEATURES = [
  'AI-powered lesson plan generation for any topic',
  'Create quizzes and exams with customizable difficulty',
  'Personalized dashboard with your curriculum and schedule',
  'Resource library to save and organize all your materials',
  'Interactive classroom workspace with AI tutor assistant',
  'Track student progress with intelligent analytics',
  'Browse CBC curriculum-aligned content',
  'Download and share your teaching materials easily',
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const { user, setOnboardingComplete, loading: authLoading } = useAuth();
  const { isLoading: guardLoading } = useOnboardingProtection();

  const form = useFormState<TeacherFormValues>({
    name: '',
    subject: '',
    school: '',
  });

  const [step, setStep] = useState(1);
  const totalSteps = 2;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !guardLoading && !user) {
      router.replace('/auth');
    }
  }, [authLoading, guardLoading, user, router]);

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
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    form.setError('api', undefined);

    try {
      const response = await setTeacherProfile(user.uid, {
        name: form.values.name.trim(),
        subject: form.values.subject.trim(),
        school: form.values.school.trim(),
        curriculum: 'CBC',
        yearsExperience: '0',
      });

      if (!response.success) {
        throw new Error(response.message ?? 'Failed to complete onboarding');
      }

      // Update onboarding completion
      setOnboardingComplete(true);

      // Redirect to teacher dashboard
      router.replace('/dashboard/teacher');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding';
      form.setError('api', message);
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
      {/* Left Section */}
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-5">Tell us about yourself</h1>
            <div className="space-y-4 mb-6">
              <div>
                <input
                  value={form.values.name}
                  onChange={(e) => form.setValue('name', e.target.value)}
                  placeholder="Full Name"
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                />
                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
              </div>
              <div>
                <input
                  value={form.values.subject}
                  onChange={(e) => form.setValue('subject', e.target.value)}
                  placeholder="Subject you teach"
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                />
                {form.errors.subject && <p className="mt-1 text-sm text-red-600">{form.errors.subject}</p>}
              </div>
              <div>
                <input
                  value={form.values.school}
                  onChange={(e) => form.setValue('school', e.target.value)}
                  placeholder="School / Institution"
                  className={`w-full rounded-xl border-2 px-6 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    form.errors.school ? 'border-red-400 bg-red-50' : 'border-gray-300 border-dashed'
                  }`}
                />
                {form.errors.school && <p className="mt-1 text-sm text-red-600">{form.errors.school}</p>}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-5">Teacher features at a glance</h1>
            <ul className="space-y-3 mb-10">
              {TEACHER_FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
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
              className="px-6 py-3 rounded-lg font-medium text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
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
          )}
        </div>

        {step === 1 && (
          <div className="mt-6">
            <BackToRoleSelection />
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex items-center justify-center w-full max-w-xl">
        <img src="/educator.svg" alt="Teacher workspace illustration" className="w-full h-auto" />
      </div>
    </div>
  );
}
