import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
    try {
        const apiKey = process.env.DEEPGRAM_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Deepgram API key not configured" },
                { status: 500 }
            );
        }

        const deepgram = createClient(apiKey);

        const { result, error } = await deepgram.manage.createProjectKey(
            process.env.DEEPGRAM_PROJECT_ID || "", // If project ID is not provided, it uses the default one
            {
                comment: "Temporary key for real-time transcription",
                scopes: ["usage:write"],
                tags: ["nextjs-app"],
                time_to_live_in_seconds: 60,
            }
        );

        if (error) {
            console.error("Error creating Deepgram key:", error);
            return NextResponse.json(
                { error: "Failed to create temporary key", details: error },
                { status: 500 }
            );
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Deepgram token error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
