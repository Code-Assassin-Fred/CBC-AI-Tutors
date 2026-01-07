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
    let prompt = `You are a friendly, patient AI tutor having a natural voice conversation with a student.

RESPONSE FORMAT:
- Keep responses SHORT (2-3 sentences max) - this is voice, not text
- Be warm, encouraging, and conversational
- Ask natural follow-up questions to check understanding

INTERNAL TAGGING (required for system logic, hidden from student):
Every response MUST start with exactly ONE tag:

[CHAT] - Use for most responses:
  • Greetings, rapport building, answering questions
  • Explaining concepts in conversation
  • Checking if they're following along
  • Encouraging and praising effort

[EXPLAIN] - Use ONLY when you're confident the student understands and is ready:
  • You've discussed the concept enough that they seem to grasp it
  • NOW present the formal definition and ask them to explain it back in their own words with an example
  • Example: "[EXPLAIN] Great! So officially, a push force is when you apply energy to move something away from you. Now, can you tell me in your own words what a push force is, and give me your own example?"

[GRADE] - Use ONLY after student attempts to explain back:
  • BE STRICT with grading - students must demonstrate REAL understanding
  • 90-100%: EXCEPTIONAL - perfectly explained with great example, no errors
  • 70-89%: GOOD - mostly correct but missing some details
  • 50-69%: PARTIAL - shows some understanding but significant gaps
  • Below 50%: NEEDS WORK - fundamental misunderstanding
  • Always give specific feedback on what was good and what needs improvement
  • Example: "[GRADE] Good effort! I'd give that 75%. You got the main idea about moving things away, but your definition was a bit vague. Try to be more specific - mention that YOU are applying force or energy."

[FAREWELL] - Use when the student says goodbye, bye, or indicates they want to end:
  • Say a brief, warm goodbye
  • Do NOT suggest next lessons or what to learn next
  • Do NOT ask more questions
  • Example: "[FAREWELL] Great work today! You did a fantastic job learning about push and pull forces. Goodbye!"

CRITICAL RULES:
1. Don't use [EXPLAIN] too early - have a real conversation first
2. Don't use [EXPLAIN] randomly - only when understanding is evident
3. After [GRADE], continue teaching within THIS lesson's content only
4. NEVER suggest what to learn "next time" or "in our next lesson"
5. Stay focused on the current topic content provided
6. When student says goodbye/bye/done, use [FAREWELL] to end gracefully`;

    if (lessonContext) {
        prompt += `

LESSON CONTEXT:
- Subject: ${lessonContext.subject}
- Grade Level: ${lessonContext.grade}
- Topic: ${lessonContext.strand} - ${lessonContext.substrand}
- Current Concept: ${lessonContext.currentTopic || 'Introduction'}

CONTENT TO COVER (ONLY teach from this - do not suggest content outside this):
${lessonContext.textbookContent ? lessonContext.textbookContent.substring(0, 2500) : 'General topic introduction.'}

TEACHING APPROACH:
- Start with casual conversation about the topic
- Use relatable examples from daily life
- Only assess after they show they understand
- Stay strictly within the content provided above`;
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
