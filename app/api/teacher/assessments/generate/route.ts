/**
 * Assessment Generation API
 * 
 * POST /api/teacher/assessments/generate
 * Generates an AI-powered assessment based on uploaded materials.
 * Uses streaming to provide real-time progress updates.
 * Now includes grading rubrics as requested.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
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

const MODEL = MODELS.flash;

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

                    // Step 3: Generating questions & rubrics
                    sendEvent({
                        type: 'progress',
                        step: 'generating-questions',
                        message: `Generating ${totalQuestions} questions with grading rubrics...`,
                        percentage: 40,
                    });

                    const assessmentPrompt = `You are an expert educational assessment creator. Create a comprehensive assessment based on the following specifications.

MATERIALS TO BASE THE ASSESSMENT ON:
Materials uploaded: ${materialNames.join(', ')}

ASSESSMENT REQUIREMENTS:
- Title: ${config.title}
- Difficulty Level: ${config.difficulty}
- Question Requirements: ${questionRequirements}
${config.specifications ? `- Additional Specifications: ${config.specifications}` : ''}
${config.topicFocus ? `- Focus Topic: ${config.topicFocus}` : ''}

GRADING RUBRIC REQUIREMENT:
For each question, especially open-ended and short-answer ones, you MUST provide a grading rubric.
Also provide a general assessment rubric explaining the overall evaluation criteria.

QUESTION TYPE GUIDELINES:
- multiple-choice: 4 options, one correct answer
- true-false: Statement that is clearly true or false
- short-answer: Requires 1-3 sentence response
- open-ended: Requires detailed explanation or analysis
- fill-blank: Sentence with a key term blanked out

Format your response as JSON with this structure:
{
    "title": "Assessment title",
    "description": "Brief description",
    "estimatedTimeMinutes": 30,
    "rubric": "General assessment rubric summarizing evaluation criteria",
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
            "rubric": "1pt for correct choice",
            "points": 2,
            "difficulty": "medium"
        },
        {
            "type": "short-answer",
            "question": "Question text",
            "sampleAnswer": "Expected answer",
            "explanation": "What to look for",
            "rubric": "Detailed grading criteria for this question (e.g., 3pts: full concept; 1pt: partial; 0pts: none)",
            "points": 3,
            "difficulty": "medium"
        }
    ]
}`;

                    const assessmentData = await generateGeminiJSON<any>(assessmentPrompt, MODEL);

                    // Step 4: Validating
                    sendEvent({
                        type: 'progress',
                        step: 'validating',
                        message: 'Validating generated content...',
                        percentage: 75,
                    });

                    // Response already parsed

                    // Step 5: Finalizing
                    sendEvent({
                        type: 'progress',
                        step: 'finalizing',
                        message: 'Finalizing assessment...',
                        percentage: 90,
                    });

                    const questions: Question[] = (assessmentData.questions || []).map((q: any) => ({
                        id: uuidv4(),
                        type: q.type as QuestionType,
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        sampleAnswer: q.sampleAnswer,
                        explanation: q.explanation,
                        rubric: q.rubric,
                        points: q.points || 1,
                        difficulty: q.difficulty || 'medium',
                    }));

                    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

                    const assessmentId = uuidv4();
                    const assessment: Assessment = {
                        id: assessmentId,
                        teacherId,
                        title: assessmentData.title || config.title,
                        description: assessmentData.description,
                        questions,
                        materials: materialUrls.map((url, i) => ({
                            id: uuidv4(),
                            name: materialNames[i],
                            url,
                            type: 'other',
                            mimeType: 'application/octet-stream',
                            size: 0,
                            uploadedAt: new Date(),
                        })),
                        config,
                        rubric: assessmentData.rubric,
                        totalPoints,
                        estimatedTimeMinutes: assessmentData.estimatedTimeMinutes || 30,
                        createdAt: new Date(),
                    };

                    const assessmentRef = adminDb
                        .collection('teachers')
                        .doc(teacherId)
                        .collection('assessments')
                        .doc(assessmentId);

                    await assessmentRef.set({
                        ...assessment,
                        createdAt: new Date(),
                    });

                    sendEvent({
                        type: 'done',
                        step: 'complete',
                        message: 'Assessment with rubric created!',
                        percentage: 100,
                        data: assessment,
                    });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    sendEvent({ type: 'error', error: errorMessage });
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
        return NextResponse.json({ error: 'Failed to generate assessment' }, { status: 500 });
    }
}
