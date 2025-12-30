"use client";

import { useCourses } from '@/lib/context/CoursesContext';
import Link from 'next/link';

export default function CourseSidebar() {
    const { currentCourse, currentLesson, currentQuiz, selectLesson, selectQuiz, learningMode } = useCourses();

    if (!currentCourse) return null;

    // Find lesson quizzes
    const getLessonQuiz = (lessonId: string) => {
        return currentCourse.quizzes.find(q => q.lessonId === lessonId);
    };

    // Find final exam
    const finalExam = currentCourse.quizzes.find(q => q.type === 'final');

    return (
        <div className="w-64 shrink-0">
            <div className="sticky top-6">
                {/* Back link */}
                <Link
                    href="/dashboard/student/courses"
                    className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    All Courses
                </Link>

                {/* Course thumbnail */}
                <div className="aspect-video rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-600/20 mb-4 flex items-center justify-center border border-white/5">
                    <svg className="w-12 h-12 text-sky-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>

                {/* Course title */}
                <h2 className="font-semibold text-white text-sm mb-4 line-clamp-2">
                    {currentCourse.title}
                </h2>

                {/* Lessons list */}
                <div className="space-y-1">
                    {currentCourse.lessons.map((lesson) => {
                        const isActive = currentLesson?.id === lesson.id && learningMode !== 'quiz';
                        const quiz = getLessonQuiz(lesson.id);
                        const isQuizActive = currentQuiz?.id === quiz?.id;

                        return (
                            <div key={lesson.id}>
                                {/* Lesson item */}
                                <button
                                    onClick={() => selectLesson(lesson.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${isActive
                                        ? 'bg-sky-500/20 text-sky-300 border-l-2 border-sky-500'
                                        : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border ${isActive ? 'border-sky-500 text-sky-400' : 'border-white/20 text-white/40'
                                            }`}>
                                            {lesson.order}
                                        </span>
                                        <span className="line-clamp-2 leading-tight">{lesson.title}</span>
                                    </div>
                                </button>

                                {/* Lesson quiz (nested) */}
                                {quiz && (
                                    <button
                                        onClick={() => selectQuiz(quiz.id)}
                                        className={`w-full text-left pl-10 pr-3 py-1.5 rounded-lg text-xs transition-all ${isQuizActive
                                            ? 'bg-sky-500/20 text-sky-300'
                                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Quiz
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Final Exam */}
                    {finalExam && (
                        <div className="pt-3 mt-3 border-t border-white/10">
                            <button
                                onClick={() => selectQuiz(finalExam.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentQuiz?.id === finalExam.id
                                    ? 'bg-sky-500/20 text-sky-300 border-l-2 border-sky-500'
                                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <span>Final Exam</span>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress indicator */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                        <span>Progress</span>
                        <span>0%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '0%' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
