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
        const body = await request.json();
        const { userId, type, context, ...data } = body;

        if (!userId || !type || !context) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let finalData = { ...data };

        // If it's a quiz and summary is missing, generate it
        if (type === 'quiz' && !data.aiSummary) {
            const summary = await generateQuizSummary({
                score: data.score,
                totalQuestions: data.totalQuestions,
                context
            });
            finalData.aiSummary = summary;
        }

        // Save to Firestore
        const activityRef = collection(db, 'userActivities');
        const docRef = await addDoc(activityRef, {
            userId,
            type,
            context,
            ...finalData,
            timestamp: Timestamp.now(),
        });

        return NextResponse.json({
            success: true,
            id: docRef.id,
            aiSummary: finalData.aiSummary
        });
    } catch (error: any) {
        console.error('[User Activity API] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to save activity', details: error.message },
            { status: 500 }
        );
    }
}
