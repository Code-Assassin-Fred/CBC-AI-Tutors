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

// Helper: flexible title matching
function matchesTopic(title: string, searchTerm: string): boolean {
    const titleLower = title.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return titleLower.includes(searchLower) ||
        searchLower.includes(titleLower) ||
        titleLower === searchLower;
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
        const careerCourses = pathData?.courses || [];

        // Get user's saved courses with their details
        const savedCoursesSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('savedCourses')
            .get();

        const savedCourseIds = savedCoursesSnapshot.docs.map(doc => doc.data().courseId);

        // Get all saved course details
        const courseDetailsMap = new Map<string, { id: string; title: string }>();
        for (const courseId of savedCourseIds) {
            const courseDoc = await adminDb.collection('courses').doc(courseId).get();
            if (courseDoc.exists) {
                const data = courseDoc.data();
                courseDetailsMap.set(courseId, { id: courseId, title: data?.title || '' });
            }
        }

        // Build progress list
        const progressList: CourseProgressInfo[] = [];

        for (const careerCourse of careerCourses) {
            // Find matching course using flexible matching
            let matchedCourseId: string | null = null;
            let matchedCourseTitle: string | null = null;

            for (const [id, details] of courseDetailsMap.entries()) {
                if (matchesTopic(details.title, careerCourse.title)) {
                    matchedCourseId = id;
                    matchedCourseTitle = details.title;
                    break;
                }
            }

            if (!matchedCourseId) {
                // User hasn't enrolled in this course yet
                progressList.push({
                    title: careerCourse.title,
                    enrolled: false,
                    isCompleted: false,
                    overallProgress: 0,
                });
                continue;
            }

            // Get progress for this course
            const progressDoc = await adminDb
                .collection('courses')
                .doc(matchedCourseId)
                .collection('progress')
                .doc(userId)
                .get();

            if (progressDoc.exists) {
                const progressData = progressDoc.data();
                progressList.push({
                    title: careerCourse.title,
                    enrolled: true,
                    isCompleted: progressData?.isCompleted || false,
                    overallProgress: progressData?.overallProgress || 0,
                });
            } else {
                // Enrolled but no progress tracked yet
                progressList.push({
                    title: careerCourse.title,
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
