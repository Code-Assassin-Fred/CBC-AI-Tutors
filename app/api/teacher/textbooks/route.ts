/**
 * Custom Textbooks API
 * 
 * GET /api/teacher/textbooks - Fetch all custom textbooks for a teacher
 * DELETE /api/teacher/textbooks?textbookId=xxx&teacherId=xxx - Delete a textbook
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { CustomTextbook } from '@/types/customTextbook';

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

        const textbooksRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('customTextbooks')
            .orderBy('createdAt', 'desc');

        const snapshot = await textbooksRef.get();
        const textbooks: CustomTextbook[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            textbooks.push({
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate(),
            } as CustomTextbook);
        });

        return NextResponse.json({ textbooks });

    } catch (error) {
        console.error('Error fetching custom textbooks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch textbooks' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const textbookId = searchParams.get('textbookId');
        const teacherId = searchParams.get('teacherId');

        if (!textbookId || !teacherId) {
            return NextResponse.json(
                { error: 'Missing textbookId or teacherId parameter' },
                { status: 400 }
            );
        }

        const textbookRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('customTextbooks')
            .doc(textbookId);

        await textbookRef.delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting custom textbook:', error);
        return NextResponse.json(
            { error: 'Failed to delete textbook' },
            { status: 500 }
        );
    }
}
