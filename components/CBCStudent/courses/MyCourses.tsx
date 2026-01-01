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
            <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 border-b border-white/5" />
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
                    Generate your first course using the topic stream
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-white/5">
            {courses.map((course) => (
                <Link
                    key={course.id}
                    href={`/dashboard/student/courses/${course.id}`}
                    className="group flex items-center gap-6 py-5 px-4 hover:bg-white/[0.02] transition-all"
                >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-[#14191f] border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-sky-500/30 transition-colors">
                        {course.thumbnailUrl ? (
                            <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-8 h-8 text-white/20 group-hover:text-sky-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-white/90 group-hover:text-sky-400 transition-colors mb-1 truncate">
                            {course.title}
                        </h3>

                        <p className="text-sm text-white/40 line-clamp-1 group-hover:text-white/60 transition-colors mb-2">
                            {course.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-white/30">
                            <span>{course.lessonCount} lessons</span>
                            <span>•</span>
                            <span>{course.estimatedTime}</span>
                            <span>•</span>
                            <span className="capitalize">{course.difficulty}</span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <span className="flex items-center gap-2 text-sm font-medium text-sky-400">
                            Create
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </div>

                    {/* Chevron static backup */}
                    <div className="flex-shrink-0 text-white/20 group-hover:opacity-0 transition-opacity">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </Link>
            ))}
        </div>
    );
}
