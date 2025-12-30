"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Conversational Voice Hook
 * 
 * Manages the complete voice conversation loop:
 * 1. Continuous listening with Deepgram streaming STT 
 * 2. Voice Activity Detection (VAD) for hands-free operation
 * 3. Barge-in detection (stops TTS when user speaks)
 * 4. Sends transcripts to Gemini for responses
 * 5. Plays TTS responses
 */

export type ConversationMessageType = 'EXPLAIN' | 'TEST' | 'GRADE' | 'CHAT';

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: ConversationMessageType;
    timestamp: Date;
}

export interface LessonContext {
    subject: string;
    grade: string;
    strand: string;
    substrand: string;
    currentTopic?: string;
    textbookContent?: string;
}

export interface ConversationalVoiceState {
    isActive: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    isProcessing: boolean;
    currentTranscript: string;
    conversationHistory: ConversationMessage[];
    error: string | null;
}

interface UseConversationalVoiceOptions {
    lessonContext?: LessonContext;
    onTranscript?: (transcript: string, isFinal: boolean) => void;
    onResponse?: (response: string) => void;
    onError?: (error: string) => void;
}

export function useConversationalVoice(options: UseConversationalVoiceOptions = {}) {
    const { lessonContext, onTranscript, onResponse, onError } = options;

    // State
    const [state, setState] = useState<ConversationalVoiceState>({
        isActive: false,
        isListening: false,
        isSpeaking: false,
        isProcessing: false,
        currentTranscript: '',
        conversationHistory: [],
        error: null,
    });

    // Refs
    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const transcriptBufferRef = useRef<string>('');
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isProcessingRef = useRef<boolean>(false);
    const isSpeakingRef = useRef<boolean>(false);
    const isActiveRef = useRef<boolean>(false);
    const lessonContextRef = useRef(lessonContext);
    const conversationHistoryRef = useRef<ConversationMessage[]>([]);

    // Keep refs in sync
    useEffect(() => {
        lessonContextRef.current = lessonContext;
    }, [lessonContext]);

    useEffect(() => {
        conversationHistoryRef.current = state.conversationHistory;
    }, [state.conversationHistory]);

    // Cleanup function
    const cleanup = useCallback(() => {
        console.log('[Conversation] Cleaning up...');
        isActiveRef.current = false;

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
    }, []);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();

        audioRef.current.onended = () => {
            console.log('[TTS] Audio ended, resuming listening');
            isSpeakingRef.current = false;
            setState(prev => ({ ...prev, isSpeaking: false, isListening: isActiveRef.current }));
        };

        audioRef.current.onerror = (e) => {
            console.error('[TTS] Audio error:', e);
            isSpeakingRef.current = false;
            setState(prev => ({ ...prev, isSpeaking: false, isListening: isActiveRef.current }));
        };

        return () => {
            cleanup();
        };
    }, [cleanup]);

    // Stop AI speech (barge-in)
    const interruptAI = useCallback(() => {
        if (isSpeakingRef.current && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            isSpeakingRef.current = false;
            setState(prev => ({ ...prev, isSpeaking: false }));
            console.log('[Conversation] User interrupted AI');
        }
    }, []);

    // Speak AI response using TTS
    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;

        console.log('[TTS] Speaking:', text.substring(0, 50) + '...');
        isSpeakingRef.current = true;
        setState(prev => ({ ...prev, isSpeaking: true, isListening: false }));

        try {
            const response = await fetch('/api/tutor/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voiceType: 'neural2',
                    languageCode: 'en-US',
                    ssmlGender: 'FEMALE',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'TTS failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (audioRef.current) {
                audioRef.current.src = url;
                await audioRef.current.play();
            }
        } catch (error: any) {
            console.error('[TTS] Error:', error);
            setState(prev => ({ ...prev, isSpeaking: false, isListening: isActiveRef.current, error: error.message }));
        }
    }, []);

    // Send message to Gemini and get response
    const getAIResponse = useCallback(async (userMessage: string) => {
        if (!userMessage.trim() || isProcessingRef.current) return;

        console.log('[Conversation] Getting AI response for:', userMessage);
        isProcessingRef.current = true;

        setState(prev => ({
            ...prev,
            isProcessing: true,
            isListening: false,
            currentTranscript: '',
        }));

        // Add user message to history
        const userMsg: ConversationMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        };

        setState(prev => ({
            ...prev,
            conversationHistory: [...prev.conversationHistory, userMsg],
        }));

        try {
            const response = await fetch('/api/tutor/conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: conversationHistoryRef.current.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    lessonContext: lessonContextRef.current,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Conversation API failed');
            }

            const data = await response.json();
            // Parse tag from AI response
            let aiResponse = data.response;
            let messageType: ConversationMessageType = 'CHAT';

            // Extract the first tag for logic
            const tagMatch = aiResponse.match(/\[(EXPLAIN|TEST|GRADE|CHAT)\]/);
            if (tagMatch) {
                messageType = tagMatch[1] as ConversationMessageType;
            }

            // Strip ALL tags from the displayed content
            aiResponse = aiResponse.replace(/\[(EXPLAIN|TEST|GRADE|CHAT)\]/g, '').trim();

            console.log(`[Conversation] AI response (${messageType}):`, aiResponse.substring(0, 50) + '...');

            // Add AI response to history
            const aiMsg: ConversationMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: aiResponse,
                type: messageType,
                timestamp: new Date(),
            };

            setState(prev => ({
                ...prev,
                conversationHistory: [...prev.conversationHistory, aiMsg],
                isProcessing: false,
            }));

            onResponse?.(aiResponse);

            // Speak the response
            await speak(aiResponse);

        } catch (error: any) {
            console.error('[Conversation] AI Error:', error);
            setState(prev => ({
                ...prev,
                isProcessing: false,
                isListening: isActiveRef.current,
                error: error.message,
            }));
            onError?.(error.message);
        } finally {
            isProcessingRef.current = false;
        }
    }, [speak, onResponse, onError]);

    // Handle speech end (silence detected)
    const handleSpeechEnd = useCallback(() => {
        const transcript = transcriptBufferRef.current.trim();
        if (transcript && transcript.length > 2) {
            console.log('[Conversation] Speech ended, processing:', transcript);
            getAIResponse(transcript);
            transcriptBufferRef.current = '';
        }
    }, [getAIResponse]);

    // Connect to Deepgram using raw WebSocket
    const connectToDeepgram = useCallback(async () => {
        try {
            console.log('[Deepgram] Fetching credentials...');

            // Get Deepgram credentials from our backend
            const tokenResponse = await fetch('/api/tutor/stt/stream');
            if (!tokenResponse.ok) throw new Error('Failed to get STT token');

            const { apiKey } = await tokenResponse.json();
            console.log('[Deepgram] Got API key, connecting to WebSocket...');

            // Build WebSocket URL with config
            const params = new URLSearchParams({
                model: 'nova-3',
                language: 'en-US',
                smart_format: 'true',
                interim_results: 'true',
                utterance_end_ms: '4000',
                endpointing: '300'
            });

            // Use the recommended subprotocol approach for Deepgram in the browser
            const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`;
            console.log(`[Deepgram] Connecting to: ${wsUrl}`);

            const ws = new WebSocket(wsUrl, ['token', apiKey]);
            wsRef.current = ws;

            return new Promise<WebSocket>((resolve, reject) => {
                ws.onopen = () => {
                    console.log('[Deepgram] WebSocket successfully connected!');
                    resolve(ws);
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.type === 'Results') {
                            const transcript = data.channel?.alternatives?.[0]?.transcript || '';
                            const isFinal = data.is_final;
                            const speechFinal = data.speech_final;

                            if (transcript) {
                                console.log(`[Deepgram] Transcript: "${transcript}" (final: ${isFinal})`);

                                // ONLY interrupt if we are actually speaking AND it's not the first 500ms (to avoid self-echo)
                                if (isSpeakingRef.current) {
                                    interruptAI();
                                }

                                if (isFinal) {
                                    transcriptBufferRef.current += transcript + ' ';
                                }

                                setState(prev => ({
                                    ...prev,
                                    currentTranscript: transcriptBufferRef.current + (isFinal ? '' : transcript),
                                    isListening: true,
                                }));

                                onTranscript?.(transcript, isFinal);

                                // Reset silence timeout
                                if (silenceTimeoutRef.current) {
                                    clearTimeout(silenceTimeoutRef.current);
                                }

                                // If speech is final, process after short delay
                                if (speechFinal) {
                                    silenceTimeoutRef.current = setTimeout(handleSpeechEnd, 800);
                                }
                            }
                        } else if (data.type === 'UtteranceEnd') {
                            console.log('[Deepgram] Utterance end detected');
                            if (silenceTimeoutRef.current) {
                                clearTimeout(silenceTimeoutRef.current);
                            }
                            handleSpeechEnd();
                        } else if (data.type === 'SpeechStarted') {
                            console.log('[Deepgram] Speech started');
                            interruptAI();
                        } else if (data.type === 'Error') {
                            console.error('[Deepgram] Server error:', data);
                        }
                    } catch (e) {
                        console.error('[Deepgram] Failed to parse message:', e);
                    }
                };

                ws.onerror = (error) => {
                    console.error('[Deepgram] WebSocket error:', error);
                    setState(prev => ({ ...prev, error: 'Transcription error', isListening: false }));
                    reject(new Error('WebSocket connection failed'));
                };

                ws.onclose = (event) => {
                    console.log(`[Deepgram] WebSocket closed (Code: ${event.code}, Reason: ${event.reason || 'None'})`);
                    setState(prev => ({ ...prev, isListening: false }));
                };
            });
        } catch (error: any) {
            console.error('[Deepgram] Setup error:', error);
            throw error;
        }
    }, [interruptAI, handleSpeechEnd, onTranscript]);

    // Start microphone and stream to Deepgram
    const startMicrophone = useCallback(async () => {
        try {
            console.log('[Microphone] Requesting access...');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1,
                    sampleRate: 16000
                },
            });
            streamRef.current = stream;
            console.log('[Microphone] Access granted');

            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            console.log('[Microphone] Using MIME type:', mimeType);

            const mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(event.data);
                }
            };

            // Send audio every 250ms for real-time streaming
            mediaRecorder.start(250);
            console.log('[Microphone] Recording started');

        } catch (error: any) {
            console.error('[Microphone] Error:', error);
            throw new Error('Microphone access denied: ' + error.message);
        }
    }, []);

    // Start conversation
    const startConversation = useCallback(async () => {
        console.log('[Conversation] Starting...');

        try {
            isActiveRef.current = true;

            setState(prev => ({
                ...prev,
                isActive: true,
                isProcessing: true,
                error: null,
                currentTranscript: '',
            }));

            // Connect to Deepgram first
            await connectToDeepgram();

            // Then start microphone
            await startMicrophone();

            // Initial greeting from AI (immediately, no delay)
            const context = lessonContextRef.current;
            const greeting = context
                ? `Hi! Let's explore "${context.substrand}" together. To start, I'll explain a concept, and then I'll ask you a quick question to see what you think. Ready to begin?`
                : "Hi! I'm your AI tutor. I'll guide you through our lesson step-by-step. Ready to start?";

            // Add greeting to history
            const greetingMsg: ConversationMessage = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: greeting,
                type: 'CHAT',
                timestamp: new Date(),
            };

            setState(prev => ({
                ...prev,
                conversationHistory: [greetingMsg],
            }));

            await speak(greeting);

        } catch (error: any) {
            console.error('[Conversation] Start error:', error);
            isActiveRef.current = false;
            setState(prev => ({
                ...prev,
                isActive: false,
                error: error.message,
            }));
            onError?.(error.message);
        }
    }, [connectToDeepgram, startMicrophone, speak, onError]);

    // End conversation
    const endConversation = useCallback(() => {
        cleanup();
        setState(prev => ({
            ...prev,
            isActive: false,
            isListening: false,
            isSpeaking: false,
            isProcessing: false,
            currentTranscript: '',
            error: null,
        }));
        console.log('[Conversation] Ended');
    }, [cleanup]);

    // Clear conversation history
    const clearHistory = useCallback(() => {
        setState(prev => ({
            ...prev,
            conversationHistory: [],
            currentTranscript: '',
        }));
    }, []);

    return {
        ...state,
        startConversation,
        endConversation,
        interruptAI,
        clearHistory,
        speak,
    };
}
