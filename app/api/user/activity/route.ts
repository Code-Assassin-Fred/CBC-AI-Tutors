import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { generateQuizSummary } from '@/lib/agents/summaryAgent';
import { UserActivity, QuizActivity } from '@/lib/types/agents';

/**
 * User Activity Persistence API
 * 
 * POST: Save user activity (quiz results, immersive sessions, chat)
 */

export async function POST(request: NextRequest) {
    try {
        console.log('[User Activity API] Received request');
        const body = await request.json();
        console.log('[User Activity API] Body:', JSON.stringify(body, null, 2));

        const { userId, type, context, ...data } = body;

        if (!userId || !type || !context) {
            console.error('[User Activity API] Missing fields:', { userId: !!userId, type: !!type, context: !!context });
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let finalData = { ...data };

        // If it's a quiz and summary is missing, generate it
        if (type === 'quiz' && !data.aiSummary) {
            console.log('[User Activity API] Generating AI summary...');
            try {
                const summary = await generateQuizSummary({
                    score: data.score,
                    totalQuestions: data.totalQuestions,
                    context
                });
                finalData.aiSummary = summary;
                console.log('[User Activity API] AI Summary generated');
            } catch (summaryError) {
                console.error('[User Activity API] Summary generation failed (non-fatal):', summaryError);
                // Continue without summary if it fails
            }
        }

        // Save to Firestore
        console.log('[User Activity API] Saving to Firestore...');
        const activityRef = collection(db, 'userActivities');
        const docRef = await addDoc(activityRef, {
            userId,
            type,
            context,
            ...finalData,
            timestamp: Timestamp.now(),
        });
        console.log('[User Activity API] Saved successfully, ID:', docRef.id);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            aiSummary: finalData.aiSummary
        });
    } catch (error: any) {
        console.error('[User Activity API] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to save activity', details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const activityRef = adminDb.collection('userActivities');
        const snapshot = await activityRef
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }));

        return NextResponse.json({ success: true, activities });
    } catch (error: any) {
        console.error('[User Activity API] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch activities' },
            { status: 500 }
        );
    }
}
