import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error("[OpenAI Realtime] Missing OPENAI_API_KEY");
            return NextResponse.json(
                { error: "OpenAI API key not configured" },
                { status: 500 }
            );
        }

        // Create an ephemeral token for the Realtime API
        // This keeps the API key secure on the server
        const response = await fetch(
            'https://api.openai.com/v1/realtime/sessions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini-transcribe',
                    voice: 'alloy',
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[OpenAI Realtime] Failed to create session:", errorText);
            return NextResponse.json(
                { error: "Failed to create realtime session", details: errorText },
                { status: 500 }
            );
        }

        const data = await response.json();
        console.log("[OpenAI Realtime] Session created successfully");

        // Return the ephemeral client secret
        return NextResponse.json({
            clientSecret: data.client_secret?.value,
            sessionId: data.id,
            model: 'gpt-4o-mini-transcribe'
        });
    } catch (err: any) {
        console.error("[OpenAI Realtime] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
