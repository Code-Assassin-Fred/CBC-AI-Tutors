"use client";

import { useEffect, useState } from 'react';
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
        discoverCourses,
        enrollInCourse,
    } = useCourses();

    const [activeTab, setActiveTab] = useState<'create' | 'my-courses' | 'discover'>('create');
    const [hasCheckedEnroll, setHasCheckedEnroll] = useState(false);

    // Handle enrollment from career path
    useEffect(() => {
        const enrollTopic = searchParams.get('enroll');
        if (enrollTopic && !hasCheckedEnroll && !isGenerating && myCourses.length >= 0) {
            setHasCheckedEnroll(true);

            const handleEnrollment = async () => {
                // 1. Check if user already has it
                const existingInMyCourses = myCourses.find(c => c.title.toLowerCase() === enrollTopic.toLowerCase());
                if (existingInMyCourses) {
                    router.push(`/dashboard/student/courses/${existingInMyCourses.id}`);
                    return;
                }

                // 2. Check if it exists globally
                const globalCourses = await discoverCourses(enrollTopic);
                const exactMatch = globalCourses.find(c => c.title.toLowerCase() === enrollTopic.toLowerCase());

                if (exactMatch) {
                    // Auto-enroll and navigate
                    const enrolled = await enrollInCourse(exactMatch.id);
                    if (enrolled) {
                        router.push(`/dashboard/student/courses/${exactMatch.id}`);
                    }
                } else {
                    // 3. Generate it
                    // The generateCourse API could be enhanced to use the syllabus if we pass it
                    // For now, we'll just use the topic
                    handleGenerate(enrollTopic);
                }
            };

            handleEnrollment();
        }
    }, [searchParams, hasCheckedEnroll, isGenerating, myCourses, discoverCourses, enrollInCourse, router]);

    useEffect(() => {
        loadSuggestions();
        loadMyCourses();
    }, [loadSuggestions, loadMyCourses]);

    const handleGenerate = async (topic: string) => {
        const courseId = await generateCourse(topic);
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
            <div className="max-w-4xl mx-auto text-center pt-12 pb-8">
                {/* Mascot/Icon */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-600/20 border border-sky-500/30">
                        <svg className="w-10 h-10 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    What do you want to learn about?
                </h1>
                <p className="text-white/60 text-base mb-8">
                    Enter any topic and we&apos;ll create a personalized course just for you
                </p>

                {/* Input */}
                <CoursePromptInput onSubmit={handleGenerate} />
            </div>

            {/* Tabs */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-6 border-b border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'create'
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
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my-courses'
                            ? 'text-sky-400'
                            : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        My Courses
                        {myCourses.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/10 rounded-full">
                                {myCourses.length}
                            </span>
                        )}
                        {activeTab === 'my-courses' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('discover')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'discover'
                            ? 'text-sky-400'
                            : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        Discover
                        {activeTab === 'discover' && (
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

                {activeTab === 'discover' && (
                    <div className="text-center py-12 text-white/50">
                        <p>Discover courses from other learners</p>
                        <p className="text-sm mt-2">Coming soon...</p>
                    </div>
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
