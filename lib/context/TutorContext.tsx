"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    TutorPanelMode,
    LearningSubMode,
    SubstrandContext,
    PlannerOutput,
    QuizOutput,
    LoadingProgress,
    ChatMessage,
    StreamEvent,
    AudioState,
    VoiceConfig,
} from '@/lib/types/agents';

// No global types needed - using MediaRecorder + Google Cloud STT

// ============================================
// CONTEXT TYPE
// ============================================

interface TutorContextType {
    // State
    mode: TutorPanelMode;
    learningSubMode: LearningSubMode | null;
    context: SubstrandContext | null;
    preparedContent: PlannerOutput | null;
    quizContent: QuizOutput | null;
    loadingProgress: LoadingProgress | null;
    chatMessages: ChatMessage[];
    audio: AudioState;

    // Actions
    activateLearningMode: (context: SubstrandContext) => Promise<void>;
    activateQuizMode: (context: SubstrandContext) => Promise<void>;
    setLearningSubMode: (mode: LearningSubMode) => void;
    exitMode: () => void;
    sendChatMessage: (message: string) => Promise<void>;
    clearChat: () => void;
    speak: (text: string, options?: Partial<VoiceConfig>) => Promise<void>;
    stopSpeaking: () => void;
    startListening: () => void;
    stopListening: () => void;
    setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
}

const TutorContext = createContext<TutorContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface TutorProviderProps {
    children: ReactNode;
}

export function TutorProvider({ children }: TutorProviderProps) {
    // State
    const [mode, setMode] = useState<TutorPanelMode>('idle');
    const [learningSubMode, setLearningSubModeState] = useState<LearningSubMode | null>(null);
    const [context, setContext] = useState<SubstrandContext | null>(null);
    const [preparedContent, setPreparedContent] = useState<PlannerOutput | null>(null);
    const [quizContent, setQuizContent] = useState<QuizOutput | null>(null);
    const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [audioState, setAudioState] = useState<AudioState>({
        isPlaying: false,
        isListening: false,
    });

    // Refs for audio and recording
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);
    const streamRef = React.useRef<MediaStream | null>(null);

    // Initialize audio ref on mount
    React.useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.onended = () => {
            setAudioState(prev => ({ ...prev, isPlaying: false, activeTextId: undefined }));
        };

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // ============================================
    // SPEECH (TTS)
    // ============================================

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setAudioState(prev => ({ ...prev, isPlaying: false, activeTextId: undefined }));
    }, []);

    const speak = useCallback(async (text: string, options?: Partial<VoiceConfig>) => {
        stopSpeaking(); // Stop any current audio

        return new Promise<void>(async (resolve, reject) => {
            try {
                setAudioState(prev => ({ ...prev, isPlaying: true }));

                const response = await fetch('/api/tutor/speech', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text,
                        voiceType: options?.voiceType || 'neural2',
                        languageCode: options?.languageCode || 'en-US',
                        ssmlGender: options?.ssmlGender || 'NEUTRAL',
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.details || 'Speech synthesis failed');
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                if (audioRef.current) {
                    audioRef.current.src = url;

                    audioRef.current.onended = () => {
                        setAudioState(prev => ({ ...prev, isPlaying: false, activeTextId: undefined }));
                        resolve();
                    };

                    audioRef.current.onerror = (e) => {
                        reject(e);
                    };

                    await audioRef.current.play().catch(e => {
                        if (e.name === 'AbortError') {
                            console.log('Audio playback was interrupted (expected)');
                        } else {
                            throw e;
                        }
                    });
                } else {
                    resolve();
                }
            } catch (error) {
                console.error('TTS error:', error);
                setAudioState(prev => ({ ...prev, isPlaying: false }));
                reject(error);
            }
        });
    }, [stopSpeaking]);

    // ============================================
    // LISTENING (STT) - AssemblyAI Real-time
    // ============================================

    const socketRef = React.useRef<WebSocket | null>(null);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const processorRef = React.useRef<ScriptProcessorNode | null>(null);

    const startListening = useCallback(async () => {
        try {
            stopSpeaking(); // Don't listen to yourself

            // 1. Request microphone access immediately (PROMPT USER)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            }).catch(err => {
                console.error('[STT] Mic access denied:', err);
                throw new Error('Microphone access denied. Please check your browser settings.');
            });
            streamRef.current = stream;

            // 2. Get temporary token from backend
            const tokenResponse = await fetch('/api/tutor/stt/token');
            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => ({}));
                console.error('[STT] Token fetch failed:', errorData);
                const msg = errorData.message || errorData.error || 'Failed to get STT token';
                throw new Error(`${msg}. Please ensure ASSEMBLY_API_KEY is configured.`);
            }
            const tokenData = await tokenResponse.json();
            console.log('[STT] Token response received');
            const token = tokenData.token;

            if (!token) {
                console.error('[STT] No token in response:', tokenData);
                throw new Error('No token returned from token endpoint. Check console for full response.');
            }
            console.log('[STT] Got temporary token, connecting to AssemblyAI...');

            // 3. Connect to AssemblyAI via WebSocket
            const socket = new WebSocket(
                `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`
            );

            socketRef.current = socket;

            socket.onopen = () => {
                console.log('[AssemblyAI] WebSocket opened successfully');

                // Create AudioContext for PCM16 conversion
                const audioContext = new AudioContext({ sampleRate: 16000 });
                audioContextRef.current = audioContext;

                const source = audioContext.createMediaStreamSource(stream);

                // Use ScriptProcessorNode to get raw PCM data
                // Buffer size of 4096 gives ~256ms chunks at 16kHz
                const processor = audioContext.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;

                processor.onaudioprocess = (event) => {
                    if (socket.readyState === WebSocket.OPEN) {
                        const inputData = event.inputBuffer.getChannelData(0);

                        // Convert Float32Array to Int16Array (PCM16)
                        const pcm16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) {
                            // Clamp to [-1, 1] and scale to Int16 range
                            const s = Math.max(-1, Math.min(1, inputData[i]));
                            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                        }

                        socket.send(pcm16.buffer);
                    }
                };

                source.connect(processor);
                processor.connect(audioContext.destination);

                console.log('[AssemblyAI] Audio processing started');
                setAudioState(prev => ({ ...prev, isListening: true, transcript: '' }));
            };

            socket.onmessage = (message) => {
                const received = JSON.parse(message.data);

                // Handle different message types
                if (received.type === 'Begin') {
                    console.log('[AssemblyAI] Session started:', received.id);
                } else if (received.type === 'Turn') {
                    const transcript = received.transcript;
                    console.log('[AssemblyAI] Turn:', transcript, 'end_of_turn:', received.end_of_turn);

                    if (transcript) {
                        if (received.end_of_turn) {
                            // Final transcript for this turn
                            setAudioState(prev => ({
                                ...prev,
                                transcript: (prev.transcript?.replace(/\s*\(transcribing\.\.\.\)$/, '') || '') + ' ' + transcript.trim()
                            }));
                        } else {
                            // Interim result
                            setAudioState(prev => {
                                const base = prev.transcript?.replace(/\s*\(transcribing\.\.\.\)$/, '') || '';
                                return {
                                    ...prev,
                                    transcript: base + (base ? ' ' : '') + transcript.trim() + ' (transcribing...)'
                                };
                            });
                        }
                    }
                } else if (received.type === 'Termination') {
                    console.log('[AssemblyAI] Session terminated:', received.audio_duration_seconds, 'seconds processed');
                } else if (received.type === 'Error') {
                    console.error('[AssemblyAI] Error:', received.error);
                }
            };

            socket.onerror = (error) => {
                console.error('[AssemblyAI] WebSocket error:', error);
            };

            socket.onclose = (event) => {
                console.log('[AssemblyAI] WebSocket closed, code:', event.code, 'reason:', event.reason);
                setAudioState(prev => ({ ...prev, isListening: false }));
            };

        } catch (error: any) {
            console.error('STT Start Error:', error);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            alert(error.message || 'Could not start transcription.');
        }
    }, [stopSpeaking]);

    const stopListening = useCallback(() => {
        // Stop audio processing
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Send termination signal and close socket
        if (socketRef.current) {
            if (socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: 'Terminate' }));
            }
            socketRef.current.close();
            socketRef.current = null;
        }

        // Stop microphone
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setAudioState(prev => ({ ...prev, isListening: false }));
    }, []);

    // ============================================
    // PLANNER AGENT - 6 Step Process
    // ============================================

    const activateLearningMode = useCallback(async (substrandContext: SubstrandContext) => {
        setContext(substrandContext);
        setMode('loading');
        setChatMessages([]);

        // Initialize loading progress for 6 steps
        const initialProgress: LoadingProgress = {
            type: 'planner',
            currentStep: 0,
            totalSteps: 6,
            steps: [
                { name: 'Analyzing content', status: 'pending' },
                { name: 'Creating outline', status: 'pending' },
                { name: 'Generating Read content', status: 'pending' },
                { name: 'Generating Podcast script', status: 'pending' },
                { name: 'Generating Immersive content', status: 'pending' },
                { name: 'Polishing content', status: 'pending' },
            ],
        };
        setLoadingProgress(initialProgress);

        try {
            const response = await fetch('/api/tutor/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(substrandContext),
            });

            if (!response.ok) {
                throw new Error('Failed to generate lesson plan');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event: StreamEvent = JSON.parse(line.slice(6));
                            handlePlannerEvent(event, initialProgress);
                        } catch (e) {
                            console.error('Failed to parse stream event:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Planner Agent error:', error);
            setMode('idle');
            setLoadingProgress(null);
        }
    }, []);

    const handlePlannerEvent = (event: StreamEvent, progress: LoadingProgress) => {
        switch (event.type) {
            case 'step-start':
                if (event.stepNumber !== undefined) {
                    const updatedSteps = [...progress.steps];
                    updatedSteps[event.stepNumber - 1] = {
                        ...updatedSteps[event.stepNumber - 1],
                        status: 'in-progress',
                        message: event.message,
                    };
                    setLoadingProgress({
                        ...progress,
                        currentStep: event.stepNumber,
                        steps: updatedSteps,
                    });
                }
                break;

            case 'step-complete':
                if (event.stepNumber !== undefined) {
                    const updatedSteps = [...progress.steps];
                    updatedSteps[event.stepNumber - 1] = {
                        ...updatedSteps[event.stepNumber - 1],
                        status: 'complete',
                    };
                    setLoadingProgress({
                        ...progress,
                        currentStep: event.stepNumber,
                        steps: updatedSteps,
                    });
                }
                break;

            case 'done':
                if (event.data) {
                    setPreparedContent(event.data as PlannerOutput);
                }
                setMode('learning');
                setLearningSubModeState('read'); // Default to Read mode
                setLoadingProgress(null);
                break;

            case 'error':
                console.error('Planner error:', event.error);
                setMode('idle');
                setLoadingProgress(null);
                break;
        }
    };

    // ============================================
    // QUIZ AGENT - 3 Step Process
    // ============================================

    const activateQuizMode = useCallback(async (substrandContext: SubstrandContext) => {
        setContext(substrandContext);
        setMode('loading');

        // Initialize loading progress for 3 steps
        const initialProgress: LoadingProgress = {
            type: 'quiz',
            currentStep: 0,
            totalSteps: 3,
            steps: [
                { name: 'Identifying key concepts', status: 'pending' },
                { name: 'Creating questions', status: 'pending' },
                { name: 'Validating quiz', status: 'pending' },
            ],
        };
        setLoadingProgress(initialProgress);

        try {
            const response = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(substrandContext),
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event: StreamEvent = JSON.parse(line.slice(6));
                            handleQuizEvent(event, initialProgress);
                        } catch (e) {
                            console.error('Failed to parse stream event:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Quiz Agent error:', error);
            setMode('idle');
            setLoadingProgress(null);
        }
    }, []);

    const handleQuizEvent = (event: StreamEvent, progress: LoadingProgress) => {
        switch (event.type) {
            case 'step-start':
                if (event.stepNumber !== undefined) {
                    const updatedSteps = [...progress.steps];
                    updatedSteps[event.stepNumber - 1] = {
                        ...updatedSteps[event.stepNumber - 1],
                        status: 'in-progress',
                        message: event.message,
                    };
                    setLoadingProgress({
                        ...progress,
                        currentStep: event.stepNumber,
                        steps: updatedSteps,
                    });
                }
                break;

            case 'step-complete':
                if (event.stepNumber !== undefined) {
                    const updatedSteps = [...progress.steps];
                    updatedSteps[event.stepNumber - 1] = {
                        ...updatedSteps[event.stepNumber - 1],
                        status: 'complete',
                    };
                    setLoadingProgress({
                        ...progress,
                        currentStep: event.stepNumber,
                        steps: updatedSteps,
                    });
                }
                break;

            case 'done':
                if (event.data) {
                    setQuizContent(event.data as QuizOutput);
                }
                setMode('quiz');
                setLoadingProgress(null);
                break;

            case 'error':
                console.error('Quiz error:', event.error);
                setMode('idle');
                setLoadingProgress(null);
                break;
        }
    };

    // ============================================
    // CHAT
    // ============================================

    const sendChatMessage = useCallback(async (message: string) => {
        if (!context || !preparedContent) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMessage]);

        try {
            const response = await fetch('/api/tutor/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    context,
                    preparedContent,
                    chatHistory: chatMessages,
                }),
            });

            if (!response.ok) throw new Error('Chat failed');

            const data = await response.json();
            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
        }
    }, [context, preparedContent, chatMessages]);

    // ============================================
    // OTHER ACTIONS
    // ============================================

    const setLearningSubMode = useCallback((subMode: LearningSubMode) => {
        setLearningSubModeState(subMode);
    }, []);

    const exitMode = useCallback(() => {
        stopSpeaking();
        stopListening();
        setMode('idle');
        setLearningSubModeState(null);
        setContext(null);
        setPreparedContent(null);
        setQuizContent(null);
        setLoadingProgress(null);
        setChatMessages([]);
    }, [stopSpeaking, stopListening]);

    const clearChat = useCallback(() => {
        setChatMessages([]);
    }, []);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value: TutorContextType = {
        mode,
        learningSubMode,
        context,
        preparedContent,
        quizContent,
        loadingProgress,
        chatMessages,
        audio: audioState,
        activateLearningMode,
        activateQuizMode,
        setLearningSubMode,
        exitMode,
        sendChatMessage,
        clearChat,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        setAudioState,
    };

    return (
        <TutorContext.Provider value={value}>
            {children}
        </TutorContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useTutor() {
    const context = useContext(TutorContext);
    if (!context) {
        throw new Error('useTutor must be used within a TutorProvider');
    }
    return context;
}
