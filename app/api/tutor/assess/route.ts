import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Assessment Endpoint
 * 
 * Evaluates student explanations against key points using Gemini AI.
 * Returns a semantic assessment with score, matched/missed points, and feedback.
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_IMAGE_API_KEY || '');

interface AssessmentRequest {
    studentAnswer: string;
    concept: string;
    keyPointsToCheck: string[];
    rubric: {
        excellent: string[];
        good: string[];
        needsWork: string[];
    };
    promptForStudent: string;
}

interface AssessmentResponse {
    score: number;
    level: 'excellent' | 'good' | 'needs-work';
    matchedKeyPoints: string[];
    missedKeyPoints: string[];
    feedback: string;
    shouldRetry: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body: AssessmentRequest = await request.json();
        const { studentAnswer, concept, keyPointsToCheck, rubric, promptForStudent } = body;

        if (!studentAnswer || !concept || !keyPointsToCheck?.length) {
            return NextResponse.json(
                { error: 'Missing required fields: studentAnswer, concept, keyPointsToCheck' },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_IMAGE_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
        });

        const prompt = buildAssessmentPrompt(studentAnswer, concept, keyPointsToCheck, rubric, promptForStudent);

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.3, // Lower temperature for more consistent grading
                responseMimeType: 'application/json',
            },
        });

        const responseText = result.response.text();

        let assessment: AssessmentResponse;
        try {
            assessment = JSON.parse(responseText);
        } catch {
            console.error('[Assess] Failed to parse AI response:', responseText);
            // Fallback assessment if parsing fails
            assessment = {
                score: 50,
                level: 'good',
                matchedKeyPoints: [],
                missedKeyPoints: keyPointsToCheck,
                feedback: 'Unable to fully assess your explanation. Please try to cover all key points more clearly.',
                shouldRetry: true,
            };
        }

        // Validate and normalize the response
        assessment.score = Math.max(0, Math.min(100, assessment.score || 0));
        assessment.level = assessment.level || (assessment.score >= 80 ? 'excellent' : assessment.score >= 50 ? 'good' : 'needs-work');
        assessment.matchedKeyPoints = assessment.matchedKeyPoints || [];
        assessment.missedKeyPoints = assessment.missedKeyPoints || [];
        assessment.feedback = assessment.feedback || 'Thank you for your explanation.';
        assessment.shouldRetry = assessment.score < 50;

        console.log(`[Assess] Concept: "${concept}" | Score: ${assessment.score}% | Level: ${assessment.level}`);

        return NextResponse.json(assessment);

    } catch (error: unknown) {
        const err = error as Error;
        console.error('[Assess] Error:', err);
        return NextResponse.json(
            { error: 'Failed to assess explanation', details: err.message },
            { status: 500 }
        );
    }
}

function buildAssessmentPrompt(
    studentAnswer: string,
    concept: string,
    keyPointsToCheck: string[],
    rubric: AssessmentRequest['rubric'],
    promptForStudent: string
): string {
    return `You are an expert educational assessor. Evaluate the student's explanation of the concept "${concept}".

PROMPT GIVEN TO STUDENT:
"${promptForStudent}"

STUDENT'S ANSWER:
"${studentAnswer}"

KEY POINTS TO CHECK (the student should demonstrate understanding of these):
${keyPointsToCheck.map((p, i) => `${i + 1}. ${p}`).join('\n')}

SCORING RUBRIC:
- Excellent (80-100%): ${rubric.excellent.join('; ')}
- Good (50-79%): ${rubric.good.join('; ')}  
- Needs Work (0-49%): ${rubric.needsWork.join('; ')}

CRITICAL INSTRUCTIONS:
1. Be STRICT in your assessment. The student must ACCURATELY explain the concept, not just use related words.
2. Check if the student's explanation is CORRECT, not just if it contains keywords.
3. If the explanation is vague, incomplete, or contains misconceptions, score it lower.
4. Match key points ONLY if the student demonstrates genuine understanding of that specific point.

Return a JSON object with this exact structure:
{
    "score": <number 0-100>,
    "level": "<'excellent' | 'good' | 'needs-work'>",
    "matchedKeyPoints": [<array of key points the student correctly covered>],
    "missedKeyPoints": [<array of key points the student missed or got wrong>],
    "feedback": "<constructive feedback explaining the score, what was good, and what to improve>",
    "shouldRetry": <boolean - true if score < 50>
}

Be fair but rigorous. A genuinely good explanation should score well, but vague or incorrect explanations should NOT receive high scores.`;
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
