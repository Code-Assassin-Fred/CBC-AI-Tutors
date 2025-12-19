import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';

// Use existing Firebase/Google Cloud credentials
const googleCredentials = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const speechClient = new SpeechClient({
    credentials: googleCredentials.client_email ? googleCredentials : undefined,
});

export async function POST(request: NextRequest) {
    try {
        if (!googleCredentials.project_id || !googleCredentials.client_email || !googleCredentials.private_key) {
            return NextResponse.json({
                error: 'Configuration error',
                details: 'Google Cloud credentials are not fully configured in environment variables.'
            }, { status: 500 });
        }

        const { audio, encoding = 'WEBM_OPUS', sampleRate = 48000 } = await request.json();

        if (!audio) {
            return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
        }

        // Remove data URL prefix if present (e.g., "data:audio/webm;base64,")
        const base64Audio = audio.includes(',') ? audio.split(',')[1] : audio;

        console.log(`[STT] Transcribing audio (${Math.round(base64Audio.length / 1024)}KB)`);

        const [response] = await speechClient.recognize({
            config: {
                encoding: encoding as any,
                sampleRateHertz: sampleRate,
                languageCode: 'en-US',
                // Enhanced model for better accuracy
                model: 'latest_long',
                // Enable automatic punctuation
                enableAutomaticPunctuation: true,
                // Speech adaptation for educational content
                speechContexts: [{
                    phrases: [
                        // Science terms
                        'lever', 'fulcrum', 'pivot', 'load', 'effort', 'force',
                        'simple machine', 'pulley', 'wedge', 'inclined plane', 'screw', 'wheel and axle',
                        // Math terms
                        'numerator', 'denominator', 'fraction', 'decimal', 'percentage',
                        'addition', 'subtraction', 'multiplication', 'division',
                        // General educational terms
                        'example', 'explain', 'because', 'therefore', 'however',
                    ],
                    boost: 15,
                }],
            },
            audio: {
                content: base64Audio,
            },
        });

        // Extract transcript from results
        const transcript = response.results
            ?.map(result => result.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join(' ') || '';

        const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;

        console.log(`[STT] Transcription: "${transcript.substring(0, 50)}..." (confidence: ${(confidence * 100).toFixed(1)}%)`);

        return NextResponse.json({
            transcript,
            confidence,
        });

    } catch (error: any) {
        console.error('[STT] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to transcribe audio',
                details: error.message,
                code: error.code,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
