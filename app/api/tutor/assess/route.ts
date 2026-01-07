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
    return `You are a supportive personal tutor providing feedback directly to your learner. Evaluate their explanation of the concept "${concept}".

PROMPT YOU GAVE THE LEARNER:
"${promptForStudent}"

LEARNER'S ANSWER:
"${studentAnswer}"

KEY POINTS TO CHECK (they should demonstrate understanding of these):
${keyPointsToCheck.map((p, i) => `${i + 1}. ${p}`).join('\n')}

SCORING RUBRIC:
- Excellent (80-100%): ${rubric.excellent.join('; ')}
- Good (50-79%): ${rubric.good.join('; ')}  
- Needs Work (0-49%): ${rubric.needsWork.join('; ')}

CRITICAL INSTRUCTIONS:
1. Be STRICT in your assessment. They must ACCURATELY explain the concept, not just use related words.
2. Check if their explanation is CORRECT, not just if it contains keywords.
3. If the explanation is vague, incomplete, or contains misconceptions, score it lower.
4. Match key points ONLY if they demonstrate genuine understanding of that specific point.
5. IMPORTANT: Write feedback addressing the learner DIRECTLY using "you" and "your" (e.g., "You correctly explained..." NOT "The student correctly explained..."). Speak as their personal tutor.

Return a JSON object with this exact structure:
{
    "score": <number 0-100>,
    "level": "<'excellent' | 'good' | 'needs-work'>",
    "matchedKeyPoints": [<array of key points correctly covered>],
    "missedKeyPoints": [<array of key points missed or incorrect>],
    "feedback": "<constructive feedback addressing the learner directly with 'you/your', explaining the score, what was good, and what to improve>",
    "shouldRetry": <boolean - true if score < 50>
}

Be fair but rigorous. A genuinely good explanation should score well, but vague or incorrect explanations should NOT receive high scores. Remember: speak directly to your learner as their supportive tutor.`;
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
