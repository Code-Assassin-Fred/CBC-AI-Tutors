/**
 * Teacher Chat API
 * 
 * GPT-like chatbot for teachers with full guide content context.
 * Teachers can ask questions about the guide, get teaching strategies,
 * and discuss lesson planning based on the actual content.
 */

import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatRequest {
    message: string;
    guideContent?: string;
    context?: {
        grade?: string;
        subject?: string;
        strand?: string;
    };
    history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(req: Request) {
    try {
        const body: ChatRequest = await req.json();
        const { message, guideContent, context, history = [] } = body;

        if (!message?.trim()) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Build the system prompt with teaching context
        let systemPrompt = `You are a helpful Teaching Assistant for Kenyan CBC curriculum teachers. 
You help teachers with lesson planning, teaching strategies, activity ideas, differentiation, 
and answering questions about their teaching content.

Keep responses concise, practical, and actionable. Use bullet points when listing items.
Focus on the Kenyan CBC curriculum context when relevant.

IMPORTANT RULES:
- Be supportive and professional
- Give practical, classroom-ready suggestions
- Consider diverse learner needs
- Suggest age-appropriate activities
- Reference the guide content when available`;

        // Add the guide content context if available
        if (guideContent) {
            systemPrompt += `\n\nTEACHER'S GUIDE CONTENT (use this as reference for your answers):
---
${guideContent.slice(0, 12000)}
---`;
        }

        // Add lesson context
        if (context?.grade || context?.subject || context?.strand) {
            systemPrompt += `\n\nCURRENT LESSON CONTEXT:
- Grade: ${context.grade || "Not specified"}
- Subject: ${context.subject || "Not specified"}  
- Strand: ${context.strand || "Not specified"}`;
        }

        // Build conversation messages
        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            // Include recent history (last 10 messages)
            ...history.slice(-10).map(h => ({
                role: h.role as "user" | "assistant",
                content: h.content
            })),
            { role: "user", content: message }
        ];

        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages,
            temperature: 0.7,
            max_tokens: 1500,
        });

        const response = completion.choices[0]?.message?.content || "I'm here to help. Could you please rephrase your question?";

        return NextResponse.json({ response });

    } catch (error: any) {
        console.error("[Teacher Chat API Error]:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat" },
            { status: 500 }
        );
    }
}
