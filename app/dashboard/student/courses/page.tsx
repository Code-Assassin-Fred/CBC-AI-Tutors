"use client";

import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CoursesProvider, useCourses } from '@/lib/context/CoursesContext';
import CoursePromptInput from '@/components/CBCStudent/courses/CoursePromptInput';
import TopicSuggestions from '@/components/CBCStudent/courses/TopicSuggestions';
import MyCourses from '@/components/CBCStudent/courses/MyCourses';
import GeneratingState from '@/components/CBCStudent/courses/GeneratingState';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CoursesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {
        isGenerating,
        generationProgress,
        generationError,
        generateCourse,
        suggestions,
        loadSuggestions,
        myCourses,
        loadMyCourses,
        isLoadingMyCourses,
        enrollInCourse,
    } = useCourses();

    const [activeTab, setActiveTab] = useState<'create' | 'my-courses'>('create');
    const enrollCheckedRef = useRef(false);

    // Handle enrollment from career path
    useEffect(() => {
        const enrollTopic = searchParams.get('enroll');
        const careerPathId = searchParams.get('careerPathId') || undefined;

        // Wait until myCourses is loaded, and only run once
        if (enrollTopic && !enrollCheckedRef.current && !isGenerating && !isLoadingMyCourses) {
            enrollCheckedRef.current = true;

            const handleEnrollment = async () => {
                const enrollTopicLower = enrollTopic.toLowerCase();

                // Helper: check if course matches (contains search term or vice versa)
                const matchesTopic = (title: string) => {
                    const titleLower = title.toLowerCase();
                    return titleLower.includes(enrollTopicLower) ||
                        enrollTopicLower.includes(titleLower) ||
                        titleLower === enrollTopicLower;
                };

                // 1. Check if user already has a matching course
                const existingInMyCourses = myCourses.find(c => matchesTopic(c.title));
                if (existingInMyCourses) {
                    router.push(`/dashboard/student/courses/${existingInMyCourses.id}`);
                    return;
                }

                // 2. Generate it (with career path link)
                handleGenerate(enrollTopic, careerPathId);
            };

            handleEnrollment();
        }
    }, [searchParams, isGenerating, isLoadingMyCourses, myCourses, enrollInCourse, router]);

    useEffect(() => {
        loadSuggestions();
        loadMyCourses();
    }, [loadSuggestions, loadMyCourses]);

    const handleGenerate = async (topic: string, careerPathId?: string) => {
        const courseId = await generateCourse(topic, careerPathId);
        if (courseId) {
            router.push(`/dashboard/student/courses/${courseId}`);
        }
    };

    const handleSelectSuggestion = (topic: string) => {
        handleGenerate(topic);
    };

    // Show generating state when course is being created
    if (isGenerating) {
        return (
            <GeneratingState
                progress={generationProgress}
                error={generationError}
            />
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center pt-6 sm:pt-12 pb-4 sm:pb-8 px-4">
                {/* Mascot/Icon */}
                <div className="mb-4 sm:mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-sky-600 to-cyan-700 border border-sky-400">
                        <svg className="w-7 h-7 sm:w-10 sm:h-10 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                    What do you want to learn about?
                </h1>
                <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-8 px-2">
                    Enter any topic and we&apos;ll create a personalized course just for you
                </p>

                {/* Input */}
                <CoursePromptInput onSubmit={handleGenerate} />
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4">
                <div className="flex items-center gap-4 sm:gap-6 border-b border-white/10 mb-4 sm:mb-6">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-colors relative ${activeTab === 'create'
                            ? 'text-sky-400'
                            : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        Suggested Topics
                        {activeTab === 'create' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('my-courses')}
                        className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium transition-colors relative ${activeTab === 'my-courses'
                            ? 'text-sky-400'
                            : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        My Courses
                        {myCourses.length > 0 && (
                            <span className="ml-1.5 sm:ml-2 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs bg-white/10 rounded-full">
                                {myCourses.length}
                            </span>
                        )}
                        {activeTab === 'my-courses' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'create' && (
                    <TopicSuggestions
                        suggestions={suggestions}
                        onSelect={handleSelectSuggestion}
                    />
                )}

                {activeTab === 'my-courses' && (
                    <MyCourses
                        courses={myCourses}
                        isLoading={isLoadingMyCourses}
                    />
                )}
            </div>
        </div>
    );
}

export default function CoursesPage() {
    return (
        <DashboardLayout active="Courses">
            <CoursesProvider>
                <Suspense fallback={<div className="min-h-screen animate-pulse bg-white/5" />}>
                    <CoursesPageContent />
                </Suspense>
            </CoursesProvider>
        </DashboardLayout>
    );
}
