"use client";

import { useState, useCallback } from 'react';
import { useCourses } from '@/lib/context/CoursesContext';
import Link from 'next/link';
import CoursePodcastView from './CoursePodcastView';
import CourseImmersiveView from './CourseImmersiveView';
import CourseQuizView from './CourseQuizView';
import { useAuth } from '@/lib/context/AuthContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';

export default function CourseViewer() {
    const { user } = useAuth();
    const { addXP, showXPPopup } = useGamification();
    const {
        currentCourse,
        currentLesson,
        currentQuiz,
        learningMode,
        setLearningMode,
        selectLesson,
        selectQuiz,
        speak,
        stopSpeaking,
        isPlaying,
    } = useCourses();

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [mobileView, setMobileView] = useState<'sidebar' | 'content'>('sidebar');

    const handleMarkLessonComplete = useCallback(async () => {
        if (!currentLesson || completedLessons.has(currentLesson.id)) return;

        setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
        await addXP(XP_CONFIG.lesson, 'lesson', `Completed lesson: ${currentLesson.title}`);
        showXPPopup(XP_CONFIG.lesson);
    }, [currentLesson, completedLessons, addXP, showXPPopup]);

    if (!currentCourse) return null;

    const handleSaveCourse = async () => {
        if (!user || isSaved) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/courses/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: currentCourse.id,
                    userId: user.uid,
                }),
            });

            if (response.ok) {
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving course:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle lesson selection on mobile - switch to content view
    const handleLessonSelect = (lessonId: string) => {
        selectLesson(lessonId);
        setMobileView('content');
    };

    const handleQuizSelect = (quizId: string) => {
        selectQuiz(quizId);
        setMobileView('content');
    };

    // Render content based on mode
    const renderContent = () => {
        if (learningMode === 'quiz' && currentQuiz) {
            return <CourseQuizView quiz={currentQuiz} />;
        }

        if (!currentLesson) {
            return (
                <div className="flex items-center justify-center h-64 text-white/40">
                    Select a lesson to begin
                </div>
            );
        }

        switch (learningMode) {
            case 'explanation':
                return (
                    <div className="prose prose-invert max-w-none">
                        {currentLesson.readContent.sections.map((section, idx) => (
                            <div key={section.id} className="mb-8 group">
                                {/* Section Header with Voice Button */}
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-base sm:text-lg font-medium text-white/90">
                                        {idx + 1}. {section.title}
                                    </h2>
                                    <button
                                        onClick={() => isPlaying
                                            ? stopSpeaking()
                                            : speak(`${section.title}. ${section.content}. ${section.keyPoints.length > 0 ? 'Key points: ' + section.keyPoints.join('. ') + '. ' : ''}${section.examples.length > 0 ? 'Examples. ' + section.examples.map(e => `${e.title}: ${e.description}`).join('. ') : ''}`)
                                        }
                                        className={`p-2 rounded-lg transition-all ${isPlaying
                                            ? 'bg-sky-500/20 text-sky-400'
                                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 sm:opacity-0 sm:group-hover:opacity-100'
                                            }`}
                                        title={isPlaying ? 'Stop reading' : 'Read aloud'}
                                    >
                                        {isPlaying ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                <p className="text-sm sm:text-base text-white leading-relaxed mb-4">
                                    {section.content}
                                </p>

                                {section.keyPoints.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs sm:text-sm font-semibold text-white tracking-wide mb-2">Key points:</p>
                                        <ul className="space-y-1 pl-4">
                                            {section.keyPoints.map((point, i) => (
                                                <li key={i} className="text-xs sm:text-sm text-white list-disc">
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {section.examples.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs sm:text-sm font-semibold text-white tracking-wide mb-2">Examples:</p>
                                        <div className="space-y-2 pl-4">
                                            {section.examples.map((example, i) => (
                                                <div key={i}>
                                                    <p className="text-xs sm:text-sm font-medium text-white">{example.title}</p>
                                                    <p className="text-xs sm:text-sm text-white/90">{example.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Lesson completion button */}
                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                            <button
                                onClick={handleMarkLessonComplete}
                                disabled={completedLessons.has(currentLesson.id)}
                                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${completedLessons.has(currentLesson.id)
                                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                                    : 'bg-sky-500 text-white hover:bg-sky-600'
                                    }`}
                            >
                                {completedLessons.has(currentLesson.id) ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="hidden sm:inline">Lesson Completed (+{XP_CONFIG.lesson} XP)</span>
                                        <span className="sm:hidden">Done (+{XP_CONFIG.lesson} XP)</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden sm:inline">Mark as Complete (+{XP_CONFIG.lesson} XP)</span>
                                        <span className="sm:hidden">Complete (+{XP_CONFIG.lesson} XP)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 'podcast':
                return <CoursePodcastView script={currentLesson.podcastScript} />;

            case 'practice':
                return <CourseImmersiveView content={currentLesson.immersiveContent} />;

            default:
                return null;
        }
    };

    // Sidebar content component (reused for mobile and desktop)
    const SidebarContent = () => (
        <>
            {/* Back link - hidden on mobile (shown above tabs instead) */}
            <Link
                href="/dashboard/student/courses"
                className="hidden sm:flex items-center gap-2 text-sm text-white hover:text-white/80 transition-colors mb-6"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Courses
            </Link>

            {/* Course thumbnail */}
            <div className="aspect-video rounded-lg bg-[#14191f] flex items-center justify-center mb-3 sm:mb-4 overflow-hidden">
                {currentCourse.thumbnailUrl ? (
                    <img
                        src={currentCourse.thumbnailUrl}
                        alt={currentCourse.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                )}
            </div>

            {/* Course title */}
            <h1 className="text-base sm:text-lg font-semibold text-white mb-1">{currentCourse.title}</h1>
            <p className="text-xs sm:text-sm text-white/90 mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">{currentCourse.description}</p>

            {/* Save button */}
            {user && currentCourse.creatorId !== user.uid && (
                <button
                    onClick={handleSaveCourse}
                    disabled={isSaving || isSaved}
                    className={`w-full py-2 px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors mb-4 sm:mb-6 ${isSaved
                        ? 'bg-white/5 text-white/40 cursor-default'
                        : 'bg-white/10 text-white/80 hover:bg-white/15'
                        }`}
                >
                    {isSaved ? 'Saved to My Courses' : isSaving ? 'Saving...' : 'Save to My Courses'}
                </button>
            )}

            {/* Lessons list */}
            <div className="space-y-1">
                {currentCourse.lessons.map((lesson, index) => {
                    const isActive = currentLesson?.id === lesson.id;
                    const lessonQuiz = currentCourse.quizzes.find(q => q.lessonId === lesson.id);

                    return (
                        <div key={lesson.id}>
                            <button
                                onClick={() => handleLessonSelect(lesson.id)}
                                className={`w-full text-left py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm transition-colors ${isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <span className="text-white/80 text-xs mt-0.5">{index + 1}</span>
                                    <span className="flex-1 line-clamp-2">{lesson.title}</span>
                                </div>
                            </button>

                            {/* Lesson quiz */}
                            {lessonQuiz && (
                                <button
                                    onClick={() => handleQuizSelect(lessonQuiz.id)}
                                    className={`w-full text-left py-1.5 sm:py-2 px-3 pl-8 sm:pl-9 text-xs transition-colors ${currentQuiz?.id === lessonQuiz.id
                                        ? 'text-white'
                                        : 'text-white/90 hover:text-white'
                                        }`}
                                >
                                    Quiz
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Final Exam */}
                {currentCourse.quizzes.some(q => q.lessonId === 'final') && (
                    <button
                        onClick={() => {
                            const finalExam = currentCourse.quizzes.find(q => q.lessonId === 'final');
                            if (finalExam) handleQuizSelect(finalExam.id);
                        }}
                        className="w-full text-left py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm text-white hover:bg-white/5 transition-colors mt-4"
                    >
                        Final Exam
                    </button>
                )}
            </div>
        </>
    );

    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 h-[calc(100vh-120px)]">
            {/* Mobile: Back link above tabs */}
            <Link
                href="/dashboard/student/courses"
                className="sm:hidden flex items-center gap-2 text-sm text-white hover:text-white/80 transition-colors mb-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Courses
            </Link>

            {/* Mobile view toggle */}
            <div className="sm:hidden flex border-b border-white/10 mb-2">
                <button
                    onClick={() => setMobileView('sidebar')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${mobileView === 'sidebar' ? 'text-white border-b-2 border-sky-500' : 'text-white/60'}`}
                >
                    Lessons
                </button>
                <button
                    onClick={() => setMobileView('content')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${mobileView === 'content' ? 'text-white border-b-2 border-sky-500' : 'text-white/60'}`}
                >
                    Content
                </button>
            </div>

            {/* Sidebar - hidden on mobile when viewing content */}
            <div className={`${mobileView === 'sidebar' ? 'block' : 'hidden'} sm:block w-full sm:w-72 flex-shrink-0 overflow-y-auto sm:sticky sm:top-0`}>
                <SidebarContent />
            </div>

            {/* Main content - hidden on mobile when viewing sidebar */}
            <div className={`${mobileView === 'content' ? 'block' : 'hidden'} sm:block flex-1 min-w-0 overflow-y-auto`}>
                {/* Mode selector - sticky */}
                {currentLesson && learningMode !== 'quiz' && (
                    <div className="sticky top-0 z-10 bg-[#0a0f14] pb-3 sm:pb-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-white/10 overflow-x-auto">
                            {(['explanation', 'podcast', 'practice'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setLearningMode(mode)}
                                    className={`text-xs sm:text-sm whitespace-nowrap transition-colors ${learningMode === mode
                                        ? 'text-white font-medium'
                                        : 'text-white/90 hover:text-white'
                                        }`}
                                >
                                    {mode === 'explanation' ? 'Explanation' : mode === 'podcast' ? 'Podcast' : 'Practice'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="pb-20 sm:pb-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

