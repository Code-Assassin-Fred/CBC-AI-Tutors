/**
 * Career Path API - Get saved paths
 * 
 * GET - Get user's saved career paths
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Get user's saved paths
        const userPathsRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('career-paths');

        const snapshot = await userPathsRef.orderBy('savedAt', 'desc').get();

        const pathIds = snapshot.docs.map(doc => doc.data().pathId);

        // Fetch full career paths
        const paths = await Promise.all(
            pathIds.map(async (pathId) => {
                const pathDoc = await adminDb.collection('career-paths').doc(pathId).get();
                return pathDoc.exists ? { id: pathDoc.id, ...pathDoc.data() } : null;
            })
        );

        return NextResponse.json({
            paths: paths.filter(Boolean),
        });
    } catch (error) {
        console.error('Error fetching career paths:', error);
        return NextResponse.json(
            { error: 'Failed to fetch career paths' },
            { status: 500 }
        );
    }
}
