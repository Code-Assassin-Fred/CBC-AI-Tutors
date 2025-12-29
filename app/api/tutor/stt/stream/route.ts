import { NextRequest, NextResponse } from 'next/server';

/**
 * Deepgram Streaming STT Token Endpoint
 * 
 * Returns a temporary Deepgram API key for client-side streaming.
 * The client connects directly to Deepgram's WebSocket for real-time transcription.
 */

export async function GET() {
    try {
        const apiKey = process.env.DEEPGRAM_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Deepgram API key not configured' },
                { status: 500 }
            );
        }

        // For Deepgram, we can use the API key directly for WebSocket connections
        // In production, you might want to create temporary scoped keys via Deepgram's API
        return NextResponse.json({
            apiKey: apiKey,
            // WebSocket URL for real-time streaming
            wsUrl: 'wss://api.deepgram.com/v1/listen',
            // Recommended settings for conversational STT
            config: {
                model: 'nova-2',
                language: 'en-US',
                smart_format: true,
                interim_results: true,
                utterance_end_ms: 1000,
                vad_events: true,
                endpointing: 300,
            }
        });
    } catch (error: any) {
        console.error('[Deepgram Stream] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get streaming token', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // Alternative: Process audio chunks server-side and forward to Deepgram
    // This is less efficient but works if WebSocket from client is blocked

    try {
        const formData = await request.formData();
        const audioChunk = formData.get('audio') as Blob;

        if (!audioChunk) {
            return NextResponse.json({ error: 'No audio chunk provided' }, { status: 400 });
        }

        // For now, return a message that client-side WebSocket is preferred
        return NextResponse.json({
            message: 'Use GET endpoint to obtain WebSocket credentials for real-time streaming',
            hint: 'Client-side WebSocket connection to Deepgram is more efficient'
        });
    } catch (error: any) {
        console.error('[Deepgram Stream] POST Error:', error);
        return NextResponse.json(
            { error: 'Failed to process audio', details: error.message },
            { status: 500 }
        );
    }
}
