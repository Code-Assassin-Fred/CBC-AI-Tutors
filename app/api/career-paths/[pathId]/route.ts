/**
 * Career Path  API
 * 
 * GET /api/career-paths/[pathId]
 * Fetches a single career path by ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pathId: string }> }
) {
    try {
        const { pathId } = await params;

        if (!pathId) {
            return NextResponse.json(
                { error: 'Missing pathId' },
                { status: 400 }
            );
        }

        const pathDoc = await adminDb.collection('careerPaths').doc(pathId).get();

        if (!pathDoc.exists) {
            return NextResponse.json(
                { error: 'Career path not found' },
                { status: 404 }
            );
        }

        const data = pathDoc.data();
        const path = {
            id: pathDoc.id,
            ...data,
            createdAt: data?.createdAt?.toDate?.() || data?.createdAt,
        };

        return NextResponse.json({ path });

    } catch (error) {
        console.error('Error fetching career path:', error);
        return NextResponse.json(
            { error: 'Failed to fetch career path' },
            { status: 500 }
        );
    }
}
