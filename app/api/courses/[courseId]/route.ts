/**
 * Course Fetch/Update API
 * 
 * GET /api/courses/[courseId] - Fetch course with lessons and quizzes
 * PATCH /api/courses/[courseId] - Update course (e.g., toggle public/private)
 * DELETE /api/courses/[courseId] - Delete course
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Course, CourseLesson, CourseQuiz, FullCourse, CourseProgress } from '@/types/course';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Fetch course document
        const courseDoc = await adminDb.collection('courses').doc(courseId).get();

        if (!courseDoc.exists) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        const courseData = courseDoc.data() as Course;

        // Fetch lessons subcollection
        const lessonsSnapshot = await adminDb
            .collection('courses')
            .doc(courseId)
            .collection('lessons')
            .orderBy('order')
            .get();

        const lessons: CourseLesson[] = lessonsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as CourseLesson));

        // Fetch quizzes subcollection
        const quizzesSnapshot = await adminDb
            .collection('courses')
            .doc(courseId)
            .collection('quizzes')
            .get();

        const quizzes: CourseQuiz[] = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as CourseQuiz));

        // Check for user progress (optional - from query param)
        const userId = request.nextUrl.searchParams.get('userId');
        let progress: CourseProgress | undefined = undefined;

        if (userId) {
            const progressDoc = await adminDb
                .collection('courseProgress')
                .doc(`${userId}_${courseId}`)
                .get();

            if (progressDoc.exists) {
                progress = progressDoc.data() as CourseProgress;
            }
        }

        const fullCourse: FullCourse = {
            ...courseData,
            id: courseId,
            lessons,
            quizzes,
            progress,
        };

        return NextResponse.json(fullCourse);

    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;
        const body = await request.json();

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Only allow updating certain fields
        const allowedFields = ['isPublic', 'title', 'description', 'tags'];
        const updates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        updates.updatedAt = new Date();

        await adminDb.collection('courses').doc(courseId).update(updates);

        return NextResponse.json({ success: true, updated: Object.keys(updates) });

    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json(
            { error: 'Failed to update course' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Delete subcollections first
        const courseRef = adminDb.collection('courses').doc(courseId);

        // Delete lessons
        const lessonsSnapshot = await courseRef.collection('lessons').get();
        const batch1 = adminDb.batch();
        lessonsSnapshot.docs.forEach(doc => batch1.delete(doc.ref));
        await batch1.commit();

        // Delete quizzes
        const quizzesSnapshot = await courseRef.collection('quizzes').get();
        const batch2 = adminDb.batch();
        quizzesSnapshot.docs.forEach(doc => batch2.delete(doc.ref));
        await batch2.commit();

        // Delete course document
        await courseRef.delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'Failed to delete course' },
            { status: 500 }
        );
    }
}
