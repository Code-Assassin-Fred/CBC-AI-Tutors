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
        const { courseId, userId } = body;

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
