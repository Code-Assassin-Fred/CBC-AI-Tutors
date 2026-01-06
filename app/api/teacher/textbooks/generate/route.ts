/**
 * Custom Textbook Generation API
 * 
 * POST /api/teacher/textbooks/generate
 * Generates a custom textbook for teachers with streaming progress updates.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    CustomTextbook,
    CustomTextbookRequest,
    CustomTextbookGenerationEvent,
    CustomTextbookContent,
} from '@/types/customTextbook';

export const runtime = 'nodejs';
export const maxDuration = 180;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, audienceAge, specifications, teacherId } = body as CustomTextbookRequest;

        if (!topic || !audienceAge || !teacherId) {
            return NextResponse.json(
                { error: 'Missing required fields: topic, audienceAge, teacherId' },
                { status: 400 }
            );
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: CustomTextbookGenerationEvent) => {
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

                    // Step 2: Outlining
                    sendEvent({
                        type: 'progress',
                        step: 'outlining',
                        message: 'Creating textbook outline...',
                        percentage: 20,
                    });

                    // Step 3: Generate textbook content
                    sendEvent({
                        type: 'progress',
                        step: 'generating-chapters',
                        message: 'Generating textbook chapters...',
                        percentage: 40,
                    });

                    const textbookPrompt = `You are an expert textbook author creating educational content for teachers.

Topic: ${topic}
Target Audience Age: ${audienceAge}
${specifications ? `Additional Specifications: ${specifications}` : ''}

Create a comprehensive textbook with the following structure:
1. An engaging introduction explaining what students will learn
2. 3-4 learning objectives
3. 3-4 chapters, each with:
   - Clear explanations
   - Key points
   - Practice exercises
4. 5-8 practice questions with answers
5. A summary of key concepts
6. A glossary of important terms

Format your response as JSON matching this structure:
{
    "title": "Textbook title",
    "estimatedReadingTime": "e.g., 30 minutes",
    "introduction": "Engaging intro paragraph",
    "learningObjectives": ["objective 1", "objective 2"],
    "chapters": [
        {
            "title": "Chapter title",
            "content": "Chapter content with explanations",
            "keyPoints": ["point 1", "point 2"],
            "exercises": [
                {
                    "question": "Exercise question",
                    "type": "open-ended"
                }
            ]
        }
    ],
    "practiceQuestions": [
        {
            "question": "Question text",
            "answer": "Expected answer"
        }
    ],
    "summary": "Key takeaways paragraph",
    "glossary": [
        {
            "term": "Important term",
            "definition": "Definition"
        }
    ]
}`;

                    const completion = await openai.chat.completions.create({
                        model: MODEL,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert textbook author. Always respond with valid JSON only.',
                            },
                            { role: 'user', content: textbookPrompt },
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.7,
                    });

                    sendEvent({
                        type: 'progress',
                        step: 'adding-exercises',
                        message: 'Adding exercises and practice questions...',
                        percentage: 75,
                    });

                    const responseText = completion.choices[0]?.message?.content || '{}';
                    const textbookData = JSON.parse(responseText);

                    sendEvent({
                        type: 'progress',
                        step: 'finalizing',
                        message: 'Finalizing textbook...',
                        percentage: 90,
                    });

                    // Build the textbook object
                    const textbookId = uuidv4();
                    const content: CustomTextbookContent = {
                        introduction: textbookData.introduction || '',
                        learningObjectives: textbookData.learningObjectives || [],
                        chapters: textbookData.chapters || [],
                        practiceQuestions: textbookData.practiceQuestions || [],
                        summary: textbookData.summary || '',
                        glossary: textbookData.glossary || [],
                    };

                    const textbook: CustomTextbook = {
                        id: textbookId,
                        teacherId,
                        title: textbookData.title || `Textbook: ${topic}`,
                        topic,
                        audienceAge,
                        specifications,
                        content,
                        estimatedReadingTime: textbookData.estimatedReadingTime || '30 minutes',
                        createdAt: new Date(),
                    };

                    // Save to Firestore
                    const textbookRef = adminDb
                        .collection('teachers')
                        .doc(teacherId)
                        .collection('customTextbooks')
                        .doc(textbookId);

                    await textbookRef.set({
                        ...textbook,
                        createdAt: new Date(),
                    });

                    // Send success event
                    sendEvent({
                        type: 'done',
                        step: 'complete',
                        message: 'Textbook created successfully!',
                        percentage: 100,
                        data: textbook,
                    });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Textbook generation error:', errorMessage);
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
        console.error('Custom textbook generation error:', error);
        return NextResponse.json(
            { error: 'Failed to start textbook generation' },
            { status: 500 }
        );
    }
}
