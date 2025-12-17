/**
 * Chat API Route
 * 
 * Conversational AI for Read mode interactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SubstrandContext, PlannerOutput, ChatMessage } from '@/lib/types/agents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChatRequest {
    message: string;
    context: SubstrandContext;
    preparedContent: PlannerOutput;
    chatHistory: ChatMessage[];
}

export async function POST(request: NextRequest) {
    try {
        const { message, context, preparedContent, chatHistory }: ChatRequest = await request.json();

        if (!message || !context) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Build conversation history
        const historyText = chatHistory
            .slice(-6) // Keep last 6 messages for context
            .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
            .join('\n');

        // Build context from prepared content
        const contentContext = preparedContent?.readContent
            ? `
LESSON CONTENT:
Introduction: ${preparedContent.readContent.introduction}
Key Concepts: ${preparedContent.analysis.keyConcepts.join(', ')}
Sections: ${preparedContent.readContent.sections.map(s => s.title).join(', ')}
`
            : '';

        const prompt = `You are a friendly, encouraging AI tutor for Kenya's CBC curriculum.

STUDENT INFO:
- Grade: ${context.grade}
- Subject: ${context.subject}
- Currently learning: ${context.substrand}

${contentContext}

CONVERSATION HISTORY:
${historyText || 'No previous messages'}

STUDENT'S QUESTION:
${message}

INSTRUCTIONS:
1. Answer the student's question clearly and helpfully
2. Use age-appropriate language for Grade ${context.grade}
3. Give examples from Kenya when relevant
4. Be encouraging and supportive
5. If the question is off-topic, gently redirect to the lesson
6. Keep responses concise but complete (2-4 paragraphs max)

Respond directly as the tutor (don't include "Tutor:" prefix).`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response' },
            { status: 500 }
        );
    }
}
