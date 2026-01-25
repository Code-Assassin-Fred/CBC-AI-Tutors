import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';

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

        // API Key is managed in gemini.ts

        const prompt = buildAssessmentPrompt(studentAnswer, concept, keyPointsToCheck, rubric, promptForStudent);
        const assessment = await generateGeminiJSON<AssessmentResponse>(prompt, MODELS.flash);

        // Response already parsed by generateGeminiJSON

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
