/**
 * Custom Lesson Generation API
 * 
 * POST /api/teacher/lessons/generate
 * Generates a custom lesson for teachers with streaming progress updates.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    CustomLesson,
    CustomLessonRequest,
    CustomLessonGenerationEvent,
    CustomLessonContent,
} from '@/types/customLesson';

export const runtime = 'nodejs';
export const maxDuration = 120;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, audienceAge, specifications, teacherId } = body as CustomLessonRequest;

        if (!topic || !audienceAge || !teacherId) {
            return NextResponse.json(
                { error: 'Missing required fields: topic, audienceAge, teacherId' },
                { status: 400 }
            );
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: CustomLessonGenerationEvent) => {
                    const data = JSON.stringify(event);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                };

                try {
                    // Step 1: Analyzing topic
                    sendEvent({
                        type: 'progress',
                        step: 'analyzing',
                        message: 'Analyzing topic and audience...',
                        percentage: 10,
                    });

                    // Step 2: Generate lesson content
                    sendEvent({
                        type: 'progress',
                        step: 'generating-content',
                        message: 'Generating lesson content...',
                        percentage: 30,
                    });

                    const lessonPrompt = `You are an expert educator creating a lesson for teachers.

Topic: ${topic}
Target Audience Age: ${audienceAge}
${specifications ? `Additional Specifications: ${specifications}` : ''}

Create a comprehensive lesson plan with the following structure:
1. An engaging introduction that hooks the audience
2. 3-4 main sections covering key concepts
3. 2-3 practical examples with explanations
4. 2-3 classroom activities
5. A concise summary

Format your response as JSON matching this structure:
{
    "title": "Lesson title",
    "estimatedDuration": "e.g., 45 minutes",
    "introduction": "Engaging intro paragraph",
    "sections": [
        {
            "title": "Section title",
            "content": "Section content",
            "keyPoints": ["point 1", "point 2"]
        }
    ],
    "examples": [
        {
            "title": "Example title",
            "description": "What this example demonstrates",
            "explanation": "Detailed explanation"
        }
    ],
    "activities": [
        {
            "title": "Activity name",
            "description": "How to conduct this activity",
            "duration": "10 minutes"
        }
    ],
    "summary": "Key takeaways paragraph"
}`;

                    const completion = await openai.chat.completions.create({
                        model: MODEL,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert curriculum designer. Always respond with valid JSON only.',
                            },
                            { role: 'user', content: lessonPrompt },
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.7,
                    });

                    sendEvent({
                        type: 'progress',
                        step: 'adding-examples',
                        message: 'Adding examples and activities...',
                        percentage: 70,
                    });

                    const responseText = completion.choices[0]?.message?.content || '{}';
                    const lessonData = JSON.parse(responseText);

                    sendEvent({
                        type: 'progress',
                        step: 'finalizing',
                        message: 'Finalizing lesson...',
                        percentage: 90,
                    });

                    // Build the lesson object
                    const lessonId = uuidv4();
                    const content: CustomLessonContent = {
                        introduction: lessonData.introduction || '',
                        sections: lessonData.sections || [],
                        examples: lessonData.examples || [],
                        summary: lessonData.summary || '',
                        activities: lessonData.activities || [],
                    };

                    const lesson: CustomLesson = {
                        id: lessonId,
                        teacherId,
                        title: lessonData.title || `Lesson: ${topic}`,
                        topic,
                        audienceAge,
                        specifications,
                        content,
                        estimatedDuration: lessonData.estimatedDuration || '45 minutes',
                        createdAt: new Date(),
                    };

                    // Save to Firestore
                    const lessonRef = adminDb
                        .collection('teachers')
                        .doc(teacherId)
                        .collection('customLessons')
                        .doc(lessonId);

                    await lessonRef.set({
                        ...lesson,
                        createdAt: new Date(),
                    });

                    // Send success event
                    sendEvent({
                        type: 'done',
                        step: 'complete',
                        message: 'Lesson created successfully!',
                        percentage: 100,
                        data: lesson,
                    });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Lesson generation error:', errorMessage);
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
        console.error('Custom lesson generation error:', error);
        return NextResponse.json(
            { error: 'Failed to start lesson generation' },
            { status: 500 }
        );
    }
}
