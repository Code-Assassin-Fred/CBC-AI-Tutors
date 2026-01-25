import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
    return NextResponse.json(
        { error: "OpenAI Realtime API is disabled. Platform has migrated to Gemini." },
        { status: 501 }
    );
}
