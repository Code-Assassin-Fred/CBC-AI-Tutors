"use client";

import { useCourses } from '@/lib/context/CoursesContext';
import CourseSidebar from './CourseSidebar';
import CourseLessonView from './CourseLessonView';
import CourseQuizView from './CourseQuizView';

export default function CourseViewer() {
    const { currentCourse, currentLesson, currentQuiz, learningMode } = useCourses();

    if (!currentCourse) return null;

    return (
        <div className="flex gap-6 min-h-[calc(100vh-120px)]">
            {/* Sidebar */}
            <CourseSidebar />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Course Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {currentCourse.title}
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed">
                        {currentCourse.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {currentCourse.lessonCount} lessons
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {currentCourse.estimatedTime}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${currentCourse.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                currentCourse.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                            }`}>
                            {currentCourse.difficulty}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-[#0b0f12] rounded-2xl border border-white/5 p-6">
                    {learningMode === 'quiz' && currentQuiz ? (
                        <CourseQuizView quiz={currentQuiz} />
                    ) : currentLesson ? (
                        <CourseLessonView lesson={currentLesson} />
                    ) : (
                        <div className="text-center py-12 text-white/50">
                            <p>Select a lesson from the sidebar to begin learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
