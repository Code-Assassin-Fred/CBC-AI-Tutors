"use client";

import { useState } from 'react';
import { useCourses } from '@/lib/context/CoursesContext';
import Link from 'next/link';
import CoursePodcastView from './CoursePodcastView';
import CourseImmersiveView from './CourseImmersiveView';
import CourseQuizView from './CourseQuizView';
import { useAuth } from '@/lib/context/AuthContext';

export default function CourseViewer() {
    const { user } = useAuth();
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
                                    <h2 className="text-lg font-medium text-white/90">
                                        {idx + 1}. {section.title}
                                    </h2>
                                    <button
                                        onClick={() => isPlaying
                                            ? stopSpeaking()
                                            : speak(`${section.title}. ${section.content}. ${section.keyPoints.length > 0 ? 'Key points: ' + section.keyPoints.join('. ') : ''}`)
                                        }
                                        className={`p-2 rounded-lg transition-all ${isPlaying
                                                ? 'bg-sky-500/20 text-sky-400'
                                                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70 opacity-0 group-hover:opacity-100'
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

                                <p className="text-white/70 leading-relaxed mb-4">
                                    {section.content}
                                </p>

                                {section.keyPoints.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-white/40 mb-2">Key points:</p>
                                        <ul className="space-y-1 pl-4">
                                            {section.keyPoints.map((point, i) => (
                                                <li key={i} className="text-sm text-white/60 list-disc">
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {section.examples.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-white/40 mb-2">Examples:</p>
                                        <div className="space-y-2 pl-4">
                                            {section.examples.map((example, i) => (
                                                <div key={i}>
                                                    <p className="text-sm font-medium text-white/70">{example.title}</p>
                                                    <p className="text-sm text-white/50">{example.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
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

    return (
        <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-72 flex-shrink-0">
                {/* Back link */}
                <Link
                    href="/dashboard/student/courses"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-6"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    All Courses
                </Link>

                {/* Course thumbnail placeholder */}
                <div className="aspect-video rounded-lg bg-[#14191f] flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>

                {/* Course title */}
                <h1 className="text-lg font-semibold text-white mb-1">{currentCourse.title}</h1>
                <p className="text-sm text-white/50 mb-4">{currentCourse.description}</p>

                {/* Save button */}
                {user && currentCourse.creatorId !== user.uid && (
                    <button
                        onClick={handleSaveCourse}
                        disabled={isSaving || isSaved}
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors mb-6 ${isSaved
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
                                    onClick={() => selectLesson(lesson.id)}
                                    className={`w-full text-left py-2.5 px-3 rounded-lg text-sm transition-colors ${isActive
                                        ? 'bg-white/5 text-white'
                                        : 'text-white/60 hover:text-white/80 hover:bg-white/[0.02]'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-white/30 text-xs mt-0.5">{index + 1}</span>
                                        <span className="flex-1 line-clamp-2">{lesson.title}</span>
                                    </div>
                                </button>

                                {/* Lesson quiz */}
                                {lessonQuiz && (
                                    <button
                                        onClick={() => selectQuiz(lessonQuiz.id)}
                                        className={`w-full text-left py-2 px-3 pl-9 text-xs transition-colors ${currentQuiz?.id === lessonQuiz.id
                                            ? 'text-white/70'
                                            : 'text-white/40 hover:text-white/60'
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
                                if (finalExam) selectQuiz(finalExam.id);
                            }}
                            className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.02] transition-colors mt-4"
                        >
                            Final Exam
                        </button>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
                {/* Mode selector */}
                {currentLesson && learningMode !== 'quiz' && (
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                        {(['explanation', 'podcast', 'practice'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setLearningMode(mode)}
                                className={`text-sm transition-colors ${learningMode === mode
                                    ? 'text-white font-medium'
                                    : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {mode === 'explanation' ? 'Explanation' : mode === 'podcast' ? 'Podcast' : 'Practice'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
