/**
 * Course Save API
 * 
 * POST /api/courses/save
 * Saves a course to the user's "My Courses" collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { courseId, userId, careerPathId } = body;

        if (!courseId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: courseId, userId' },
                { status: 400 }
            );
        }

        // Check if course exists
        const courseRef = adminDb.collection('courses').doc(courseId);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Save to user's saved courses collection
        const userSavedRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('savedCourses')
            .doc(courseId);

        await userSavedRef.set({
            courseId,
            savedAt: FieldValue.serverTimestamp(),
            careerPathId: careerPathId || null,  // Link to career path if provided
        });

        // Update course's save count (optional, for popularity tracking)
        await courseRef.update({
            saveCount: FieldValue.increment(1),
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving course:', error);
        return NextResponse.json(
            { error: 'Failed to save course' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');
        const userId = searchParams.get('userId');

        if (!courseId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: courseId, userId' },
                { status: 400 }
            );
        }

        // Remove from user's saved courses collection
        await adminDb
            .collection('users')
            .doc(userId)
            .collection('savedCourses')
            .doc(courseId)
            .delete();

        // Optionally decrement save count
        const courseRef = adminDb.collection('courses').doc(courseId);
        // We use a safe update here - if course doesn't exist, we just ignore
        try {
            await courseRef.update({
                saveCount: FieldValue.increment(-1),
            });
        } catch (e) {
            // Course might have been deleted already
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error unsaving course:', error);
        return NextResponse.json(
            { error: 'Failed to unsave course' },
            { status: 500 }
        );
    }
}
