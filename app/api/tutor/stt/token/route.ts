import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
    try {
        const apiKey = process.env.ASSEMBLY_API_KEY;

        if (!apiKey) {
            console.error("[AssemblyAI Token] Missing ASSEMBLY_API_KEY");
            return NextResponse.json(
                { error: "AssemblyAI API key not configured" },
                { status: 500 }
            );
        }

        // Generate a temporary token for client-side authentication
        // This token expires in 120 seconds and is single-use
        const response = await fetch(
            'https://streaming.assemblyai.com/v3/token?expires_in_seconds=120',
            {
                method: 'GET',
                headers: {
                    'Authorization': apiKey,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[AssemblyAI Token] Failed to generate token:", errorText);
            return NextResponse.json(
                { error: "Failed to generate temporary token", details: errorText },
                { status: 500 }
            );
        }

        const data = await response.json();
        console.log("[AssemblyAI Token] Token generated successfully");

        // Return the token to the client
        return NextResponse.json({ token: data.token });
    } catch (err: any) {
        console.error("[AssemblyAI Token] Unexpected error:", err);
        return NextResponse.json(
            { error: "Internal server error", details: err.message },
            { status: 500 }
        );
    }
}
