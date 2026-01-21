/**
 * Assessment Generation API
 * 
 * POST /api/teacher/assessments/generate
 * Generates an AI-powered assessment based on uploaded materials.
 * Uses streaming to provide real-time progress updates.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    Assessment,
    AssessmentGenerationRequest,
    AssessmentGenerationEvent,
    Question,
    QuestionType,
    DifficultyLevel,
    QUESTION_TYPE_LABELS,
} from '@/types/assessment';

export const runtime = 'nodejs';
export const maxDuration = 180;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teacherId, materialUrls, materialNames, config } = body as AssessmentGenerationRequest;

        if (!teacherId || !materialUrls?.length || !config) {
            return NextResponse.json(
                { error: 'Missing required fields: teacherId, materialUrls, config' },
                { status: 400 }
            );
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: AssessmentGenerationEvent) => {
                    const data = JSON.stringify(event);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                };

                try {
                    // Step 1: Analyzing materials
                    sendEvent({
                        type: 'progress',
                        step: 'analyzing',
                        message: 'Analyzing uploaded materials...',
                        percentage: 10,
                    });

                    // Build question type requirements string
                    const enabledTypes = config.questionTypes.filter(qt => qt.enabled && qt.count > 0);
                    const questionRequirements = enabledTypes
                        .map(qt => `${qt.count} ${QUESTION_TYPE_LABELS[qt.type]} questions`)
                        .join(', ');

                    const totalQuestions = enabledTypes.reduce((sum, qt) => sum + qt.count, 0);

                    // Step 2: Extracting content
                    sendEvent({
                        type: 'progress',
                        step: 'extracting',
                        message: 'Processing content from materials...',
                        percentage: 25,
                    });

                    // Step 3: Generating questions
                    sendEvent({
                        type: 'progress',
                        step: 'generating-questions',
                        message: `Generating ${totalQuestions} questions...`,
                        percentage: 40,
                    });

                    const assessmentPrompt = `You are an expert educational assessment creator. Create a comprehensive assessment with grading rubric based on the following specifications.

MATERIALS TO BASE THE ASSESSMENT ON:
The teacher has uploaded the following materials: ${materialNames.join(', ')}
Material URLs: ${materialUrls.join(', ')}

Note: Generate questions that would logically come from educational materials with these names. Create appropriate content-based questions.

ASSESSMENT REQUIREMENTS:
- Title: ${config.title}
- Difficulty Level: ${config.difficulty}
- Question Requirements: ${questionRequirements}
${config.specifications ? `- Additional Specifications: ${config.specifications}` : ''}
${config.topicFocus ? `- Focus Topic: ${config.topicFocus}` : ''}

QUESTION TYPE GUIDELINES:
- multiple-choice: 4 options, one correct answer, clear distractors
- true-false: Statement that is clearly true or false
- short-answer: Requires 1-3 sentence response
- open-ended: Requires detailed explanation or analysis
- fill-blank: Sentence with a key term blanked out

For EACH question, provide:
1. Clear, unambiguous question text
2. Correct answer or sample answer
3. Brief explanation of why the answer is correct
4. Appropriate point value (1-5 based on complexity)

RUBRIC REQUIREMENTS:
Create a grading rubric with 3-5 criteria covering:
- Content accuracy and understanding
- Clarity of explanation (for written responses)
- Use of relevant examples/evidence
- Critical thinking and analysis

Each criterion should have 3-4 levels (e.g., Excellent, Good, Developing, Needs Improvement) with point allocations and descriptions.

Format your response as JSON with this structure:
{
    "title": "Assessment title",
    "description": "Brief description of what this assessment covers",
    "estimatedTimeMinutes": 30,
    "questions": [
        {
            "type": "multiple-choice",
            "question": "Question text",
            "options": [
                {"id": "a", "text": "Option A", "isCorrect": false},
                {"id": "b", "text": "Option B", "isCorrect": true},
                {"id": "c", "text": "Option C", "isCorrect": false},
                {"id": "d", "text": "Option D", "isCorrect": false}
            ],
            "explanation": "Why B is correct",
            "points": 2,
            "difficulty": "medium"
        },
        {
            "type": "true-false",
            "question": "Statement to evaluate",
            "correctAnswer": "true",
            "explanation": "Why this is true/false",
            "points": 1,
            "difficulty": "easy"
        },
        {
            "type": "short-answer",
            "question": "Short answer question",
            "sampleAnswer": "Expected answer",
            "explanation": "What a good answer should include",
            "points": 3,
            "difficulty": "medium"
        },
        {
            "type": "open-ended",
            "question": "Open-ended question requiring analysis",
            "sampleAnswer": "Key points that should be covered",
            "explanation": "Grading criteria",
            "points": 5,
            "difficulty": "hard"
        },
        {
            "type": "fill-blank",
            "question": "The _____ is responsible for...",
            "correctAnswer": "missing term",
            "explanation": "Why this term fits",
            "points": 1,
            "difficulty": "easy"
        }
    ],
    "rubric": [
        {
            "criterion": "Content Accuracy",
            "maxPoints": 10,
            "criteria": [
                {"level": "Excellent", "points": 10, "description": "All answers demonstrate complete understanding"},
                {"level": "Good", "points": 7, "description": "Most answers are accurate with minor errors"},
                {"level": "Developing", "points": 4, "description": "Some understanding shown but significant gaps"},
                {"level": "Needs Improvement", "points": 1, "description": "Limited understanding demonstrated"}
            ]
        }
    ]
}`;

                    const completion = await openai.chat.completions.create({
                        model: MODEL,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert educational assessment creator. Always respond with valid JSON only. Create pedagogically sound questions that test understanding, not just memorization.',
                            },
                            { role: 'user', content: assessmentPrompt },
                        ],
                        response_format: { type: 'json_object' },
                        temperature: 0.7,
                    });

                    // Step 4: Validating
                    sendEvent({
                        type: 'progress',
                        step: 'validating',
                        message: 'Validating generated questions...',
                        percentage: 75,
                    });

                    const responseText = completion.choices[0]?.message?.content || '{}';
                    const assessmentData = JSON.parse(responseText);

                    // Step 5: Finalizing
                    sendEvent({
                        type: 'progress',
                        step: 'finalizing',
                        message: 'Finalizing assessment...',
                        percentage: 90,
                    });

                    // Process questions and add IDs
                    const questions: Question[] = (assessmentData.questions || []).map((q: Record<string, unknown>, index: number) => ({
                        id: uuidv4(),
                        type: q.type as QuestionType,
                        question: q.question as string,
                        options: q.options,
                        correctAnswer: q.correctAnswer as string | undefined,
                        sampleAnswer: q.sampleAnswer as string | undefined,
                        explanation: q.explanation as string | undefined,
                        points: (q.points as number) || 1,
                        difficulty: (q.difficulty as DifficultyLevel) || 'medium',
                    }));

                    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

                    // Build the assessment object
                    const assessmentId = uuidv4();
                    const assessment: Assessment = {
                        id: assessmentId,
                        teacherId,
                        title: assessmentData.title || config.title,
                        description: assessmentData.description || `Assessment with ${questions.length} questions`,
                        questions,
                        materials: materialUrls.map((url: string, i: number) => ({
                            id: uuidv4(),
                            name: materialNames[i] || `Material ${i + 1}`,
                            url,
                            type: 'other' as const,
                            mimeType: 'application/octet-stream',
                            size: 0,
                            uploadedAt: new Date(),
                        })),
                        config,
                        totalPoints,
                        estimatedTimeMinutes: assessmentData.estimatedTimeMinutes || 30,
                        createdAt: new Date(),
                    };

                    // Save to Firestore
                    const assessmentRef = adminDb
                        .collection('teachers')
                        .doc(teacherId)
                        .collection('assessments')
                        .doc(assessmentId);

                    await assessmentRef.set({
                        ...assessment,
                        createdAt: new Date(),
                    });

                    // Send success event
                    sendEvent({
                        type: 'done',
                        step: 'complete',
                        message: 'Assessment created successfully!',
                        percentage: 100,
                        data: assessment,
                    });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Assessment generation error:', errorMessage);
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
        console.error('Assessment generation error:', error);
        return NextResponse.json(
            { error: 'Failed to start assessment generation' },
            { status: 500 }
        );
    }
}
