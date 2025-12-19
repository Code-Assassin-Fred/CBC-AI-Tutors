import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Check if we have credentials in env
const googleCredentials = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const client = new TextToSpeechClient({
    credentials: googleCredentials.client_email ? googleCredentials : undefined,
});

export async function POST(request: NextRequest) {
    try {
        const { text, voiceType = 'neural2', languageCode = 'en-US', ssmlGender = 'NEUTRAL' } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Select the voice name based on type, language, and gender
        let voiceName = 'en-US-Neural2-F'; // Default: Female Neural

        if (languageCode === 'en-US') {
            if (ssmlGender === 'MALE') {
                if (voiceType === 'standard') voiceName = 'en-US-Standard-B';
                if (voiceType === 'wavenet') voiceName = 'en-US-Wavenet-D';
                if (voiceType === 'neural2') voiceName = 'en-US-Neural2-J';
            } else {
                if (voiceType === 'standard') voiceName = 'en-US-Standard-C';
                if (voiceType === 'wavenet') voiceName = 'en-US-Wavenet-F';
                if (voiceType === 'neural2') voiceName = 'en-US-Neural2-F';
            }
        }

        console.log(`[TTS] Synthesizing: "${text.substring(0, 30)}..." voice: ${voiceName}`);

        const [response] = await client.synthesizeSpeech({
            input: { text },
            voice: { languageCode, name: voiceName, ssmlGender },
            audioConfig: { audioEncoding: 'MP3' },
        });

        const audioContent = response.audioContent;

        if (!audioContent) {
            throw new Error('No audio content returned from Google TTS');
        }

        // Return the binary data directly
        return new NextResponse(audioContent as Uint8Array, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioContent.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('[TTS] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to synthesize speech', details: error.message },
            { status: 500 }
        );
    }
}
