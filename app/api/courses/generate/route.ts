/**
 * Course Generation API
 * 
 * POST /api/courses/generate
 * Generates a complete course on-demand with streaming progress updates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCourse, GenerationCallback } from '@/lib/agents/courseGeneratorAgent';
import { CourseGenerationRequest, GenerationEvent } from '@/types/course';
import { adminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for course generation

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, userId, preferences } = body as CourseGenerationRequest;

        if (!topic || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: topic, userId' },
                { status: 400 }
            );
        }

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: GenerationEvent) => {
                    const data = JSON.stringify(event);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                };

                try {
                    // Generate the course with streaming callbacks
                    const result = await generateCourse(
                        { topic, userId, preferences },
                        sendEvent
                    );

                    // Save to Firestore
                    const batch = adminDb.batch();

                    // Save course
                    const courseRef = adminDb.collection('courses').doc(result.course.id);
                    batch.set(courseRef, {
                        ...result.course,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });

                    // Save lessons as subcollection
                    for (const lesson of result.lessons) {
                        const lessonRef = courseRef.collection('lessons').doc(lesson.id);
                        batch.set(lessonRef, lesson);
                    }

                    // Save quizzes as subcollection
                    for (const quiz of result.quizzes) {
                        const quizRef = courseRef.collection('quizzes').doc(quiz.id);
                        batch.set(quizRef, quiz);
                    }

                    await batch.commit();

                    // Send final success event
                    sendEvent({
                        type: 'done',
                        message: 'Course saved successfully!',
                        percentage: 100,
                        data: {
                            courseId: result.course.id,
                            courseTitle: result.course.title,
                            lessonCount: result.lessons.length,
                        },
                    });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    sendEvent({
                        type: 'error',
                        error: errorMessage,
                    });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Course generation error:', error);
        return NextResponse.json(
            { error: 'Failed to start course generation' },
            { status: 500 }
        );
    }
}
