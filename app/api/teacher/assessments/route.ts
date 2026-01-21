/**
 * Assessments CRUD API
 * 
 * GET /api/teacher/assessments - Fetch all assessments for a teacher
 * DELETE /api/teacher/assessments?assessmentId=xxx&teacherId=xxx - Delete an assessment
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Assessment } from '@/types/assessment';

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

        const assessmentsRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('assessments')
            .orderBy('createdAt', 'desc');

        const snapshot = await assessmentsRef.get();
        const assessments: Assessment[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            assessments.push({
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate(),
            } as Assessment);
        });

        return NextResponse.json({ assessments });

    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assessments' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const assessmentId = searchParams.get('assessmentId');
        const teacherId = searchParams.get('teacherId');

        if (!assessmentId || !teacherId) {
            return NextResponse.json(
                { error: 'Missing assessmentId or teacherId parameter' },
                { status: 400 }
            );
        }

        const assessmentRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('assessments')
            .doc(assessmentId);

        await assessmentRef.delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting assessment:', error);
        return NextResponse.json(
            { error: 'Failed to delete assessment' },
            { status: 500 }
        );
    }
}
