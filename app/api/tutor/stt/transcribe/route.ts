import { NextResponse } from "next/server";
import { genAI, MODELS } from "@/lib/api/gemini";

export const revalidate = 0;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        console.log("[Gemini STT] Transcribing audio:", audioFile.name, "type:", audioFile.type);

        // Convert File to base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        const model = genAI.getGenerativeModel({ model: MODELS.flash });

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: audioFile.type || "audio/wav"
                }
            },
            "Please transcribe this audio accurately. If it is empty or silent, ignore it. Respond only with the transcript text."
        ]);

        const transcription = result.response.text();

        console.log("[Gemini STT] Transcription complete:", transcription.substring(0, 100) + "...");

        return NextResponse.json({
            transcript: transcription,
            success: true
        });

    } catch (err: any) {
        console.error("[Gemini STT] Transcription error:", err);
        return NextResponse.json(
            { error: "Transcription failed", details: err.message },
            { status: 500 }
        );
    }
}
