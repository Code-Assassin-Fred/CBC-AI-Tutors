/**
 * Custom Lessons API
 * 
 * GET /api/teacher/lessons - Fetch all custom lessons for a teacher
 * DELETE /api/teacher/lessons?lessonId=xxx&teacherId=xxx - Delete a lesson
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { CustomLesson } from '@/types/customLesson';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');

        if (!teacherId) {
            return NextResponse.json(
                { error: 'Missing teacherId parameter' },
                { status: 400 }
            );
        }

        const lessonsRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('customLessons')
            .orderBy('createdAt', 'desc');

        const snapshot = await lessonsRef.get();
        const lessons: CustomLesson[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            lessons.push({
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate(),
            } as CustomLesson);
        });

        return NextResponse.json({ lessons });

    } catch (error) {
        console.error('Error fetching custom lessons:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lessons' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');
        const teacherId = searchParams.get('teacherId');

        if (!lessonId || !teacherId) {
            return NextResponse.json(
                { error: 'Missing lessonId or teacherId parameter' },
                { status: 400 }
            );
        }

        const lessonRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('customLessons')
            .doc(lessonId);

        await lessonRef.delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting custom lesson:', error);
        return NextResponse.json(
            { error: 'Failed to delete lesson' },
            { status: 500 }
        );
    }
}
