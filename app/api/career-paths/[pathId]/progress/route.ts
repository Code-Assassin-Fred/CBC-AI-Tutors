/**
 * Career Path Progress API
 * 
 * GET /api/career-paths/[pathId]/progress?userId=xxx
 * Returns progress for each course in the career path
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

interface CourseProgressInfo {
    title: string;
    enrolled: boolean;
    isCompleted: boolean;
    overallProgress: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { pathId: string } }
) {
    try {
        const { pathId } = params;
        const userId = request.nextUrl.searchParams.get('userId');

        if (!pathId || !userId) {
            return NextResponse.json(
                { error: 'Missing pathId or userId' },
                { status: 400 }
            );
        }

        // Get the career path
        const pathDoc = await adminDb.collection('careerPaths').doc(pathId).get();
        if (!pathDoc.exists) {
            return NextResponse.json(
                { error: 'Career path not found' },
                { status: 404 }
            );
        }

        const pathData = pathDoc.data();
        const courses = pathData?.courses || [];

        // Get user's saved courses
        const savedCoursesSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('savedCourses')
            .get();

        const savedCourseIds = new Set(
            savedCoursesSnapshot.docs.map(doc => doc.data().courseId)
        );

        // Get course details and progress
        const progressList: CourseProgressInfo[] = [];

        for (const course of courses) {
            // Try to find matching course in database
            const coursesSnapshot = await adminDb
                .collection('courses')
                .where('title', '==', course.title)
                .limit(1)
                .get();

            if (coursesSnapshot.empty) {
                progressList.push({
                    title: course.title,
                    enrolled: false,
                    isCompleted: false,
                    overallProgress: 0,
                });
                continue;
            }

            const courseDoc = coursesSnapshot.docs[0];
            const courseId = courseDoc.id;
            const isEnrolled = savedCourseIds.has(courseId);

            if (!isEnrolled) {
                progressList.push({
                    title: course.title,
                    enrolled: false,
                    isCompleted: false,
                    overallProgress: 0,
                });
                continue;
            }

            // Get progress for this course
            const progressDoc = await adminDb
                .collection('courses')
                .doc(courseId)
                .collection('progress')
                .doc(userId)
                .get();

            if (progressDoc.exists) {
                const progressData = progressDoc.data();
                progressList.push({
                    title: course.title,
                    enrolled: true,
                    isCompleted: progressData?.isCompleted || false,
                    overallProgress: progressData?.overallProgress || 0,
                });
            } else {
                progressList.push({
                    title: course.title,
                    enrolled: true,
                    isCompleted: false,
                    overallProgress: 0,
                });
            }
        }

        return NextResponse.json({
            progress: progressList,
            completedCount: progressList.filter(p => p.isCompleted).length,
            enrolledCount: progressList.filter(p => p.enrolled).length,
        });

    } catch (error) {
        console.error('Error fetching career path progress:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}
