import { NextResponse } from "next/server";
import { generateGeminiText, MODELS } from '@/lib/api/gemini';
import { adminDb, FieldValue } from "@/lib/firebaseAdmin";

const MODEL = MODELS.flash;

interface ChatRequest {
    message: string;
    userId: string;
    sessionId: string;
    guideContent?: string;
    context?: {
        grade?: string;
        subject?: string;
        strand?: string;
    };
    history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const sessionId = searchParams.get("sessionId");

        if (sessionId) {
            // Fetch messages for a specific session
            const messagesSnapshot = await adminDb
                .collection("teacher_chats")
                .doc(sessionId)
                .collection("messages")
                .orderBy("timestamp", "asc")
                .get();

            const messages = messagesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            }));

            return NextResponse.json({ messages });
        }

        if (userId) {
            // Fetch all sessions for a user
            // Note: Removed orderBy to avoid composite index requirement (userId + lastUpdated)
            // We'll sort in memory to ensure it works without manual index creation
            const sessionsSnapshot = await adminDb
                .collection("teacher_chats")
                .where("userId", "==", userId)
                .limit(50)
                .get();

            const sessions = sessionsSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
                }))
                .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

            return NextResponse.json({ sessions });
        }

        return NextResponse.json({ error: "userId or sessionId is required" }, { status: 400 });

    } catch (error: any) {
        console.error("[Teacher Chat API GET Error]:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch chat data" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body: ChatRequest = await req.json();
        const { message, userId, sessionId, guideContent, context, history = [] } = body;

        if (!message?.trim() || !userId || !sessionId) {
            return NextResponse.json(
                { error: "Message, userId, and sessionId are required" },
                { status: 400 }
            );
        }

        // Save User Message to Firestore immediately (for persistence)
        const chatSessionRef = adminDb.collection("teacher_chats").doc(sessionId);
        const messagesCollectionRef = chatSessionRef.collection("messages");

        await messagesCollectionRef.add({
            role: "user",
            content: message,
            timestamp: FieldValue.serverTimestamp(),
        });

        // Update session metadata
        await chatSessionRef.set({
            userId,
            context: context || {},
            lastUpdated: FieldValue.serverTimestamp(),
        }, { merge: true });

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
        const response = await generateGeminiText(
            `System: ${systemPrompt}\n\nUser: ${message}`,
            MODEL
        );

        // Save AI Response to Firestore
        await messagesCollectionRef.add({
            role: "assistant",
            content: response,
            timestamp: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({
            response,
            sessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("[Teacher Chat API Error]:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat" },
            { status: 500 }
        );
    }
}
