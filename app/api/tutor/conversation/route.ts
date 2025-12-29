import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Conversational AI Endpoint
 * 
 * Handles back-and-forth conversation with the AI tutor using Gemini.
 * Maintains context awareness of the current lesson being studied.
 */

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_IMAGE_API_KEY || '');

interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ConversationRequest {
    message: string;
    conversationHistory: ConversationMessage[];
    lessonContext?: {
        subject: string;
        grade: string;
        strand: string;
        substrand: string;
        currentTopic?: string;
        textbookContent?: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const { message, conversationHistory, lessonContext }: ConversationRequest = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_IMAGE_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Build the system prompt with lesson context
        const systemPrompt = buildSystemPrompt(lessonContext);

        // Build chat history for Gemini
        // IMPORTANT: Gemini requires the first message in the history to be from the 'user'
        let chatHistory = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        // Skip leading 'model' messages if any (though usually it's just the initial greeting)
        while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
            chatHistory.shift();
        }

        // Use Gemini 2.0 Flash for fast responses
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemPrompt,
        });

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500, // Keep responses concise for voice
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        console.log(`[Conversation] User: "${message.substring(0, 50)}..." -> AI: "${response.substring(0, 50)}..."`);

        return NextResponse.json({
            response,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('[Conversation] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate response',
                details: error.message,
                code: error.code
            },
            { status: 500 }
        );
    }
}

function buildSystemPrompt(lessonContext?: ConversationRequest['lessonContext']): string {
    let prompt = `You are a friendly, encouraging AI tutor helping a student learn. Your responses should be:
- Conversational and natural (this is a voice conversation)
- Concise (2-3 sentences max, since this will be spoken aloud)
- Age-appropriate and encouraging
- Educational but not lecturing

Important guidelines:
- Use simple, clear language
- Ask follow-up questions to check understanding
- If the student seems confused, try explaining differently
- Celebrate correct answers and gently correct mistakes
- Keep responses SHORT - this is spoken, not written`;

    if (lessonContext) {
        prompt += `\n\nCurrent lesson context:
- Subject: ${lessonContext.subject}
- Grade: ${lessonContext.grade}
- Topic: ${lessonContext.strand} - ${lessonContext.substrand}
${lessonContext.currentTopic ? `- Currently discussing: ${lessonContext.currentTopic}` : ''}

The student is learning about this topic. Help them understand it through conversation.
If they ask questions unrelated to the lesson, gently guide them back to the topic.`;

        if (lessonContext.textbookContent) {
            prompt += `\n\nRelevant lesson content (summarized):\n${lessonContext.textbookContent.substring(0, 2000)}`;
        }
    }

    return prompt;
}

// Streaming version for lower latency (optional enhancement)
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
