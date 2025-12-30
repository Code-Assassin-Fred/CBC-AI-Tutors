"use client";

import { Course } from '@/types/course';
import Link from 'next/link';

interface MyCoursesProps {
    courses: Course[];
    isLoading: boolean;
}

export default function MyCourses({ courses, isLoading }: MyCoursesProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-40 rounded-xl bg-white/5" />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-white/70 font-medium mb-2">No courses yet</h3>
                <p className="text-white/40 text-sm">
                    Generate your first course by entering a topic above
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
                <Link
                    key={course.id}
                    href={`/dashboard/student/courses/${course.id}`}
                    className="group block p-4 rounded-xl bg-[#0b0f12] border border-white/5 hover:border-sky-500/30 transition-all"
                >
                    {/* Thumbnail placeholder */}
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-sky-500/20 to-cyan-600/20 mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-sky-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>

                    {/* Content */}
                    <h3 className="font-medium text-white group-hover:text-sky-300 transition-colors line-clamp-2 mb-2">
                        {course.title}
                    </h3>

                    <p className="text-white/40 text-sm line-clamp-2 mb-3">
                        {course.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {course.lessonCount} lessons
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.estimatedTime}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${course.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {course.difficulty}
                        </span>
                    </div>

                    {/* Tags */}
                    {course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {course.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </Link>
            ))}
        </div>
    );
}
