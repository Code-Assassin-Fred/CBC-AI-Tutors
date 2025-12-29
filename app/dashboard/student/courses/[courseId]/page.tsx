"use client";

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CoursesProvider, useCourses } from '@/lib/context/CoursesContext';
import CourseViewer from '@/components/CBCStudent/courses/viewer/CourseViewer';

interface CoursePageProps {
    params: Promise<{ courseId: string }>;
}

function CoursePageContent({ courseId }: { courseId: string }) {
    const router = useRouter();
    const { currentCourse, isLoadingCourse, loadCourse } = useCourses();

    useEffect(() => {
        if (courseId) {
            loadCourse(courseId);
        }
    }, [courseId, loadCourse]);

    if (isLoadingCourse) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/20 mb-4 animate-pulse">
                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-white/60">Loading course...</p>
                </div>
            </div>
        );
    }

    if (!currentCourse) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Course Not Found</h3>
                    <p className="text-white/60 mb-6">This course may have been deleted or doesn&apos;t exist.</p>
                    <button
                        onClick={() => router.push('/dashboard/student/courses')}
                        className="px-6 py-2.5 rounded-full bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return <CourseViewer />;
}

export default function CoursePage({ params }: CoursePageProps) {
    const resolvedParams = use(params);

    return (
        <DashboardLayout active="Courses">
            <CoursesProvider>
                <CoursePageContent courseId={resolvedParams.courseId} />
            </CoursesProvider>
        </DashboardLayout>
    );
}
