/**
 * My Saved Courses API
 * 
 * GET /api/courses/my-saved
 * Returns courses that the user has saved to their collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Course } from '@/types/course';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        // Get saved course IDs from user's collection
        const savedCoursesSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('savedCourses')
            .orderBy('savedAt', 'desc')
            .limit(50)
            .get();

        if (savedCoursesSnapshot.empty) {
            return NextResponse.json({ courses: [] });
        }

        // Fetch the actual course documents
        const courseIds = savedCoursesSnapshot.docs.map(doc => doc.data().courseId);

        const courses: Course[] = [];

        // Fetch courses in batches (Firestore 'in' query limit is 10)
        for (let i = 0; i < courseIds.length; i += 10) {
            const batch = courseIds.slice(i, i + 10);
            const coursesSnapshot = await adminDb
                .collection('courses')
                .where('__name__', 'in', batch)
                .get();

            coursesSnapshot.docs.forEach(doc => {
                courses.push({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                } as Course);
            });
        }

        return NextResponse.json({ courses });

    } catch (error) {
        console.error('Error fetching saved courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved courses' },
            { status: 500 }
        );
    }
}
