import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
    try {
        const apiKey = process.env.DEEPGRAM_API_KEY;

        if (!apiKey) {
            console.error("[Deepgram Token] Missing DEEPGRAM_API_KEY");
            return NextResponse.json(
                { error: "Deepgram API key not configured" },
                { status: 500 }
            );
        }

        const deepgram = createClient(apiKey);

        // 1. Get Project ID (essential if not provided in env)
        let projectId = process.env.DEEPGRAM_PROJECT_ID;

        if (!projectId) {
            console.log("[Deepgram Token] Project ID not in ENV, fetching from API...");
            const { result: projects, error: projectsError } = await deepgram.manage.getProjects();

            if (projectsError || !projects || projects.projects.length === 0) {
                console.error("[Deepgram Token] Failed to fetch projects:", projectsError);
                return NextResponse.json(
                    { error: "Could not find a Deepgram project", details: projectsError },
                    { status: 500 }
                );
            }
            projectId = projects.projects[0].project_id;
            console.log(`[Deepgram Token] Using project: ${projectId}`);
        }

        // 2. Create temporary key
        const { result, error } = await deepgram.manage.createProjectKey(
            projectId,
            {
                comment: "Temporary key for real-time transcription",
                scopes: ["usage:write"],
                tags: ["nextjs-app"],
                time_to_live_in_seconds: 120, // Increased TTL slightly
            }
        );

        if (error) {
            console.error("[Deepgram Token] Error creating key:", error);
            return NextResponse.json(
                { error: "Failed to create temporary key", details: error },
                { status: 500 }
            );
        }

        // Ensure the response structure matches what TutorContext expects
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("[Deepgram Token] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
