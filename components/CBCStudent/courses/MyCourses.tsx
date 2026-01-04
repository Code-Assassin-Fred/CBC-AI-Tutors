import { Course } from '@/types/course';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useCourses } from '@/lib/context/CoursesContext';
import { useState } from 'react';

interface MyCoursesProps {
    courses: Course[];
    isLoading: boolean;
}

export default function MyCourses({ courses, isLoading }: MyCoursesProps) {
    const { user } = useAuth();
    const { deleteCourse } = useCourses();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, courseId: string, creatorId: string) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        if (!confirm('Are you sure you want to remove this course?')) return;

        setDeletingId(courseId);
        const isCreator = user?.uid === creatorId;
        await deleteCourse(courseId, isCreator);
        setDeletingId(null);
    };

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
                <div key={course.id} className="relative group">
                    <Link
                        href={`/dashboard/student/courses/${course.id}`}
                        className="flex items-center gap-6 py-5 px-4 hover:bg-white/[0.02] transition-all pr-16"
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
                    </Link>

                    {/* Delete Action - Pushed to right, outside of Link */}
                    {course.careerPathId ? (
                        <div
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/10 cursor-not-allowed group/lock z-10"
                            title="Part of a career path. Delete the career path to remove this course."
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => handleDelete(e, course.id, course.creatorId)}
                            disabled={deletingId === course.id}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                            title="Remove course"
                        >
                            {deletingId === course.id ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
