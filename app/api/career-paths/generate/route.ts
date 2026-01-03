/**
 * Career Path Generation API
 * 
 * POST - Generate a new career path
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCareerPath } from '@/lib/career/generateCareerPath';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
    try {
        const { careerTitle, userId } = await request.json();

        if (!careerTitle || !userId) {
            return NextResponse.json(
                { error: 'Career title and userId are required' },
                { status: 400 }
            );
        }

        // Generate the career path
        const careerPath = await generateCareerPath(careerTitle, userId);

        // Save to Firestore
        const pathRef = adminDb.collection('career-paths').doc(careerPath.id);
        await pathRef.set({
            ...careerPath,
            createdAt: new Date().toISOString(),
        });

        // Also save to user's saved paths
        const userPathRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('career-paths')
            .doc(careerPath.id);

        await userPathRef.set({
            pathId: careerPath.id,
            title: careerPath.title,
            savedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            careerPath,
        });
    } catch (error) {
        console.error('Error generating career path:', error);
        return NextResponse.json(
            { error: 'Failed to generate career path' },
            { status: 500 }
        );
    }
}
