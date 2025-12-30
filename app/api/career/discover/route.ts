import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerDiscoveryMessage, CareerSuggestion } from '@/types/career';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { messages, userId } = await req.json();

        if (!messages || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Build conversation history
        const conversationHistory = messages.map((m: CareerDiscoveryMessage) =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const prompt = `You are a friendly career discovery assistant. Your goal is to help users discover careers that match their interests, skills, and values.

Conversation so far:
${conversationHistory}

Based on this conversation:
1. If the user hasn't shared enough about themselves, ask ONE follow-up question to learn more about their:
   - Interests and hobbies
   - Skills they enjoy using
   - Values (work-life balance, salary, impact, etc.)
   - What problems they want to solve

2. If you have enough information (at least 2-3 pieces of context), suggest 2-3 specific careers that match.

Return a JSON response (no markdown):
{
    "message": "Your conversational response here. Be friendly and encouraging.",
    "suggestions": [
        {
            "careerTitle": "Specific Career Title",
            "matchScore": 85,
            "matchReason": "Brief explanation of why this fits them"
        }
    ]
}

Only include "suggestions" array if you have enough info to make recommendations. Otherwise, set suggestions to an empty array [].`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({
                message: "I'd love to help you discover your ideal career! What subjects or activities do you enjoy most?",
                suggestions: [],
            });
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            message: data.message || "Tell me more about your interests!",
            suggestions: (data.suggestions || []) as CareerSuggestion[],
        });

    } catch (error) {
        console.error('Career discovery error:', error);
        return NextResponse.json(
            { error: 'Failed to process discovery' },
            { status: 500 }
        );
    }
}
