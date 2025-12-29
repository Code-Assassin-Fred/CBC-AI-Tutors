import { NextResponse } from "next/server";
import OpenAI from "openai";

export const revalidate = 0;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        // Get the audio file from form data
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        console.log("[Whisper] Transcribing audio:", audioFile.name, "size:", audioFile.size);

        // Send to OpenAI Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en",
            response_format: "text",
        });

        console.log("[Whisper] Transcription complete:", transcription.substring(0, 100) + "...");

        return NextResponse.json({
            transcript: transcription,
            success: true
        });

    } catch (err: any) {
        console.error("[Whisper] Transcription error:", err);
        return NextResponse.json(
            { error: "Transcription failed", details: err.message },
            { status: 500 }
        );
    }
}
