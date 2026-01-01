/**
 * Course Progress API
 * 
 * POST /api/courses/progress - Save/update course progress (quiz scores, practice sessions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, courseId, type } = body;

        if (!userId || !courseId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, courseId' },
                { status: 400 }
            );
        }

        const progressDocId = `${userId}_${courseId}`;
        const progressRef = adminDb.collection('courseProgress').doc(progressDocId);
        const progressDoc = await progressRef.get();
        const now = new Date();

        // Handle QUIZ type
        if (type === undefined || body.quizId) {
            const { quizId, score, passed, totalQuestions, answers } = body;

            if (!quizId) {
                return NextResponse.json(
                    { error: 'Missing quizId for quiz progress' },
                    { status: 400 }
                );
            }

            const quizScoreEntry = {
                quizId,
                score,
                passed,
                lastAttemptAt: now,
                attempts: 1,
                bestScore: score,
            };

            if (progressDoc.exists) {
                const existingData = progressDoc.data();
                const existingQuizScores = existingData?.quizScores || {};
                const existingQuizScore = existingQuizScores[quizId];

                if (existingQuizScore) {
                    quizScoreEntry.attempts = (existingQuizScore.attempts || 0) + 1;
                    quizScoreEntry.bestScore = Math.max(existingQuizScore.bestScore || 0, score);
                }

                await progressRef.update({
                    [`quizScores.${quizId}`]: quizScoreEntry,
                    lastAccessedAt: now,
                });
            } else {
                await progressRef.set({
                    userId,
                    courseId,
                    startedAt: now,
                    lastAccessedAt: now,
                    completedLessons: [],
                    lessonProgress: {},
                    quizScores: { [quizId]: quizScoreEntry },
                    practiceResults: {},
                    isCompleted: false,
                    overallProgress: 0,
                });
            }

            // Log to userActivities
            try {
                await adminDb.collection('userActivities').add({
                    userId,
                    type: 'course_quiz',
                    context: { courseId, quizId },
                    score,
                    totalQuestions,
                    answers,
                    passed,
                    timestamp: FieldValue.serverTimestamp(),
                });
            } catch (e) {
                console.error('Failed to log quiz activity:', e);
            }

            return NextResponse.json({ success: true, quizScore: quizScoreEntry });
        }

        // Handle PRACTICE type
        if (type === 'practice') {
            const { assessments, averageScore, totalChunks, completedAt } = body;

            const practiceEntry = {
                assessments,
                averageScore,
                totalChunks,
                completedAt,
                attempts: 1,
                bestScore: averageScore,
            };

            if (progressDoc.exists) {
                const existingData = progressDoc.data();
                const existingPractice = existingData?.practiceResults?.latest;

                if (existingPractice) {
                    practiceEntry.attempts = (existingPractice.attempts || 0) + 1;
                    practiceEntry.bestScore = Math.max(existingPractice.bestScore || 0, averageScore);
                }

                await progressRef.update({
                    practiceResults: {
                        latest: practiceEntry,
                        history: FieldValue.arrayUnion({
                            ...practiceEntry,
                            completedAt,
                        }),
                    },
                    lastAccessedAt: now,
                });
            } else {
                await progressRef.set({
                    userId,
                    courseId,
                    startedAt: now,
                    lastAccessedAt: now,
                    completedLessons: [],
                    lessonProgress: {},
                    quizScores: {},
                    practiceResults: {
                        latest: practiceEntry,
                        history: [{ ...practiceEntry, completedAt }],
                    },
                    isCompleted: false,
                    overallProgress: 0,
                });
            }

            // Log to userActivities
            try {
                await adminDb.collection('userActivities').add({
                    userId,
                    type: 'course_practice',
                    context: { courseId },
                    assessments,
                    averageScore,
                    totalChunks,
                    timestamp: FieldValue.serverTimestamp(),
                });
            } catch (e) {
                console.error('Failed to log practice activity:', e);
            }

            return NextResponse.json({ success: true, practiceResult: practiceEntry });
        }

        return NextResponse.json(
            { error: 'Invalid request type' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error saving course progress:', error);
        return NextResponse.json(
            { error: 'Failed to save progress' },
            { status: 500 }
        );
    }
}
