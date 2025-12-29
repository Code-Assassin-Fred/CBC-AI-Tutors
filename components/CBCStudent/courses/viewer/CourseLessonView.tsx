"use client";

import { CourseLesson, LearningMode } from '@/types/course';
import { useCourses } from '@/lib/context/CoursesContext';
import CourseExplanationView from './CourseExplanationView';
import CoursePodcastView from './CoursePodcastView';
import CourseImmersiveView from './CourseImmersiveView';

interface CourseLessonViewProps {
    lesson: CourseLesson;
}

export default function CourseLessonView({ lesson }: CourseLessonViewProps) {
    const { learningMode, setLearningMode, currentCourse, selectQuiz } = useCourses();

    // Find the quiz for this lesson
    const lessonQuiz = currentCourse?.quizzes.find(q => q.lessonId === lesson.id);

    const modes: { id: LearningMode; label: string; icon: React.ReactNode }[] = [
        {
            id: 'explanation',
            label: 'Explanation',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            id: 'podcast',
            label: 'Podcast',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            ),
        },
        {
            id: 'immersive',
            label: 'Immersive',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
    ];

    return (
        <div>
            {/* Lesson Header */}
            <div className="mb-6 pb-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white mb-2">
                    {lesson.title}
                </h2>
                <p className="text-white/50 text-sm">
                    {lesson.description}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {lesson.estimatedTime}
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2 mb-6">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => setLearningMode(mode.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${learningMode === mode.id
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/80'
                            }`}
                    >
                        {mode.icon}
                        {mode.label}
                    </button>
                ))}

                {/* Quiz button */}
                {lessonQuiz && (
                    <button
                        onClick={() => selectQuiz(lessonQuiz.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/80 transition-all ml-auto"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Take Quiz
                    </button>
                )}
            </div>

            {/* Content based on mode */}
            <div className="min-h-[400px]">
                {learningMode === 'explanation' && (
                    <CourseExplanationView content={lesson.readContent} />
                )}
                {learningMode === 'podcast' && (
                    <CoursePodcastView script={lesson.podcastScript} />
                )}
                {learningMode === 'immersive' && (
                    <CourseImmersiveView content={lesson.immersiveContent} />
                )}
            </div>
        </div>
    );
}
