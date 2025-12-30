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
    let prompt = `You are a supportive AI tutor conducting an "Immersive Chat" lesson. 
Your goal is to ensure the student deeply understands each concept by requiring them to define it and provide real-world examples.

MANDATORY TAGGING RULES:
Every response MUST start with exactly one tag:
- [CHAT]: Use this for 90% of the conversation. Greetings, "Are you ready?", "What's your favorite sport?", answering questions, and general guidance.
- [EXPLAIN]: ONLY use this when you are providing a formal concept explanation that you intend for the student to explain back to you immediately after. This is the "Assessment Setup".
- [GRADE]: Use this ONLY when providing a score (0-100%) and feedback on a student's explanation.
- [TEST]: (Legacy/Internal) Use for the question part of the [EXPLAIN] block.

STRICT CONVERSATIONAL FLOW:
1. GREET & WARM-UP: [CHAT] Talk naturally. Ask if they're ready. Discuss interests.
2. TEACH & PREPARE: [CHAT] Introduce the topic briefly. Don't trigger assessment yet.
3. ASSESSMENT SETUP: [EXPLAIN] Provide the formal definition/example and then ask: "Now, can you define this in your own words and give me your own example?"
4. EVALUATE: [GRADE] Provide the score and feedback.

Example of correct CHAT vs EXPLAIN:
AI: [CHAT] Awesome! Forces are all around us. Think about when you push a door open. Have you ever felt that resistance?
Student: Yes, it's like I'm giving it a nudge.
AI: [CHAT] Exactly! That nudge is what we call a force. Ready to see the official definition?
Student: Yes, I am.
AI: [EXPLAIN] A "push force" is when you apply energy to move something away from you. For example, pushing a car. Now, can you define it in your own words and give me another example?`;

    if (lessonContext) {
        prompt += `\n\nLESSON CONTEXT:
- Subject: ${lessonContext.subject}
- Grade: ${lessonContext.grade}
- Topic: ${lessonContext.strand} - ${lessonContext.substrand}
- Current Concept Focus: ${lessonContext.currentTopic || 'Introduction'}

CONTENT TO TEACH:
${lessonContext.textbookContent ? lessonContext.textbookContent.substring(0, 3000) : 'No content.'}

DIRECTIONS:
- Start with the first major concept.
- Don't move to the next concept until you've verified understanding with a grade.
- If the student just gives a one-word answer, encourage them to "describe it more fully".`;
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
