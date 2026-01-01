/**
 * Course Progress API
 * 
 * POST /api/courses/progress - Save/update course progress (quiz scores, lesson completion)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, courseId, quizId, score, passed, totalQuestions, answers } = body;

        if (!userId || !courseId || !quizId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, courseId, quizId' },
                { status: 400 }
            );
        }

        const progressDocId = `${userId}_${courseId}`;
        const progressRef = adminDb.collection('courseProgress').doc(progressDocId);
        const progressDoc = await progressRef.get();

        const now = new Date();

        // Build the quiz score entry
        const quizScoreEntry = {
            quizId,
            score,
            passed,
            lastAttemptAt: now,
            attempts: 1,
            bestScore: score,
        };

        if (progressDoc.exists) {
            // Update existing progress
            const existingData = progressDoc.data();
            const existingQuizScores = existingData?.quizScores || {};
            const existingQuizScore = existingQuizScores[quizId];

            if (existingQuizScore) {
                // Update with new attempt
                quizScoreEntry.attempts = (existingQuizScore.attempts || 0) + 1;
                quizScoreEntry.bestScore = Math.max(existingQuizScore.bestScore || 0, score);
            }

            await progressRef.update({
                [`quizScores.${quizId}`]: quizScoreEntry,
                lastAccessedAt: now,
            });
        } else {
            // Create new progress document
            await progressRef.set({
                userId,
                courseId,
                startedAt: now,
                lastAccessedAt: now,
                completedLessons: [],
                lessonProgress: {},
                quizScores: {
                    [quizId]: quizScoreEntry,
                },
                isCompleted: false,
                overallProgress: 0,
            });
        }

        // Also save to userActivities for analytics (optional, mirrors existing pattern)
        try {
            await adminDb.collection('userActivities').add({
                userId,
                type: 'course_quiz',
                context: {
                    courseId,
                    quizId,
                },
                score,
                totalQuestions,
                answers,
                passed,
                timestamp: FieldValue.serverTimestamp(),
            });
        } catch (activityError) {
            // Non-fatal: activity logging failed but progress was saved
            console.error('Failed to log quiz activity:', activityError);
        }

        return NextResponse.json({
            success: true,
            quizScore: quizScoreEntry,
        });

    } catch (error) {
        console.error('Error saving course progress:', error);
        return NextResponse.json(
            { error: 'Failed to save progress' },
            { status: 500 }
        );
    }
}
