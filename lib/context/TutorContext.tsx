"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
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

// LocalStorage key for persisting tutor state
const TUTOR_STATE_KEY = 'curio_tutor_state';

interface PersistedTutorState {
    mode: TutorPanelMode;
    learningSubMode: LearningSubMode | null;
    context: SubstrandContext | null;
}

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
    useEffect(() => {
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

    // Restore state from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(TUTOR_STATE_KEY);
            if (!stored) return;

            const state: PersistedTutorState = JSON.parse(stored);
            console.log('[TutorContext] Restoring state:', state.mode);

            if (state.mode === 'learning' && state.context) {
                // Auto-restore learning mode by loading cached content
                setContext(state.context);
                if (state.learningSubMode) {
                    setLearningSubModeState(state.learningSubMode);
                }
                // Load the cached content
                activateLearningModeFromCache(state.context, state.learningSubMode || 'explanation');
            }
        } catch (e) {
            console.error('[TutorContext] Failed to restore state:', e);
        }
    }, []);

    // Helper to restore from cache without triggering loading state
    const activateLearningModeFromCache = async (substrandContext: SubstrandContext, subMode: LearningSubMode) => {
        try {
            const cacheParams = new URLSearchParams({
                grade: substrandContext.grade || '',
                subject: substrandContext.subject || '',
                strand: substrandContext.strand || '',
                substrand: substrandContext.substrand || '',
            });

            const cacheCheck = await fetch(`/api/tutor/content?${cacheParams.toString()}`);
            const cacheData = await cacheCheck.json();

            if (cacheData.cached && cacheData.content) {
                console.log('[TutorContext] Restored from cache');
                setPreparedContent(cacheData.content as PlannerOutput);
                setMode('learning');
                setLearningSubModeState(subMode);
            } else {
                // No cache, clear persisted state
                localStorage.removeItem(TUTOR_STATE_KEY);
            }
        } catch (error) {
            console.error('[TutorContext] Cache restore failed:', error);
            localStorage.removeItem(TUTOR_STATE_KEY);
        }
    };

    // Persist state to localStorage when it changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (mode === 'idle' || mode === 'loading') return;

        try {
            const state: PersistedTutorState = {
                mode,
                learningSubMode,
                context,
            };
            localStorage.setItem(TUTOR_STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('[TutorContext] Failed to persist state:', e);
        }
    }, [mode, learningSubMode, context]);

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

    const speak = useCallback(async (text: string, options?: Partial<VoiceConfig> & { textId?: string }) => {
        stopSpeaking(); // Stop any current audio

        return new Promise<void>(async (resolve, reject) => {
            try {
                setAudioState(prev => ({ ...prev, isPlaying: true, activeTextId: options?.textId }));

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
    // LISTENING (STT) - OpenAI Whisper (Record then Transcribe)
    // ============================================

    // Record audio, then send to Whisper for accurate transcription
    const mediaRecorderInstanceRef = React.useRef<MediaRecorder | null>(null);

    const startListening = useCallback(async () => {
        try {
            stopSpeaking(); // Don't listen to yourself

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            }).catch(err => {
                console.error('[Whisper] Mic access denied:', err);
                throw new Error('Microphone access denied. Please check your browser settings.');
            });
            streamRef.current = stream;

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });
            mediaRecorderInstanceRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log('[Whisper] Recording stopped, transcribing...');
                setAudioState(prev => ({ ...prev, isListening: false, isTranscribing: true }));

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                console.log('[Whisper] Audio size:', audioBlob.size, 'bytes');

                if (audioBlob.size < 1000) {
                    console.log('[Whisper] Audio too short, skipping transcription');
                    setAudioState(prev => ({ ...prev, isTranscribing: false }));
                    return;
                }

                // Send to Whisper API
                try {
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');

                    const response = await fetch('/api/tutor/stt/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.details || 'Transcription failed');
                    }

                    const data = await response.json();
                    console.log('[Whisper] Transcription:', data.transcript);

                    setAudioState(prev => ({
                        ...prev,
                        transcript: data.transcript,
                        isTranscribing: false,
                    }));
                } catch (err: any) {
                    console.error('[Whisper] Transcription error:', err);
                    setAudioState(prev => ({ ...prev, isTranscribing: false }));
                    alert('Transcription failed: ' + err.message);
                }
            };

            // Start recording
            mediaRecorder.start(1000); // Collect data every second
            console.log('[Whisper] Recording started');
            setAudioState(prev => ({ ...prev, isListening: true, transcript: '' }));

        } catch (error: any) {
            console.error('STT Start Error:', error);
            alert(error.message || 'Could not start recording.');
        }
    }, [stopSpeaking]);

    const stopListening = useCallback(() => {
        // Stop recording (this triggers the onstop handler which transcribes)
        if (mediaRecorderInstanceRef.current && mediaRecorderInstanceRef.current.state !== 'inactive') {
            mediaRecorderInstanceRef.current.stop();
        }

        // Stop microphone
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // ============================================
    // PLANNER AGENT - 6 Step Process (with caching)
    // ============================================

    const activateLearningMode = useCallback(async (substrandContext: SubstrandContext) => {
        setContext(substrandContext);
        setMode('loading');
        setChatMessages([]);

        // First, check if cached content exists
        try {
            const cacheParams = new URLSearchParams({
                grade: substrandContext.grade || '',
                subject: substrandContext.subject || '',
                strand: substrandContext.strand || '',
                substrand: substrandContext.substrand || '',
            });

            console.log('[TutorContext] Checking cache for:', substrandContext.substrand);
            const cacheCheck = await fetch(`/api/tutor/content?${cacheParams.toString()}`);
            const cacheData = await cacheCheck.json();

            if (cacheData.cached && cacheData.content) {
                console.log('[TutorContext] Using cached content from:', cacheData.createdAt);
                // Show brief loading for cached content
                setLoadingProgress({
                    type: 'planner',
                    currentStep: 6,
                    totalSteps: 6,
                    steps: [
                        { name: 'Almost ready...', status: 'complete' },
                    ],
                });

                // Small delay for UX
                await new Promise(resolve => setTimeout(resolve, 500));

                setPreparedContent(cacheData.content as PlannerOutput);
                setMode('learning');
                setLearningSubModeState('explanation');
                setLoadingProgress(null);
                return;
            } else {
                console.log('[TutorContext] No cache found, will generate fresh content');
            }
        } catch (error) {
            console.log('[TutorContext] Cache check failed, generating fresh:', error);
            // Continue with generation if cache check fails
        }

        // Initialize loading progress for 6 steps with creative, abstract names
        const initialProgress: LoadingProgress = {
            type: 'planner',
            currentStep: 0,
            totalSteps: 6,
            steps: [
                { name: 'Gathering ingredients...', status: 'pending' },
                { name: 'Mixing the magic...', status: 'pending' },
                { name: 'Sprinkling knowledge...', status: 'pending' },
                { name: 'Brewing something special...', status: 'pending' },
                { name: 'Adding a dash of wisdom...', status: 'pending' },
                { name: 'Final taste test...', status: 'pending' },
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate lesson plan');
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
                            handlePlannerEvent(event, initialProgress, substrandContext);
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

    const handlePlannerEvent = (event: StreamEvent, progress: LoadingProgress, substrandContext?: SubstrandContext) => {
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
                    const content = event.data as PlannerOutput;
                    setPreparedContent(content);

                    // Save to cache (fire and forget)
                    if (substrandContext) {
                        fetch('/api/tutor/content', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                grade: substrandContext.grade,
                                subject: substrandContext.subject,
                                strand: substrandContext.strand,
                                substrand: substrandContext.substrand,
                                content: content,
                            }),
                        }).then(() => {
                            console.log('[TutorContext] Content saved to cache');
                        }).catch(err => {
                            console.error('[TutorContext] Failed to save to cache:', err);
                        });
                    }
                }
                setMode('learning');
                setLearningSubModeState('explanation'); // Default to Explanation mode
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

        // Initialize loading progress for 3 steps with creative, abstract names
        const initialProgress: LoadingProgress = {
            type: 'quiz',
            currentStep: 0,
            totalSteps: 3,
            steps: [
                { name: 'Searching the treasure chest...', status: 'pending' },
                { name: 'Crafting challenges...', status: 'pending' },
                { name: 'Polishing the gems...', status: 'pending' },
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
        stopSpeaking(); // Stop any audio when switching sub-modes
        setLearningSubModeState(subMode);
    }, [stopSpeaking]);

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
        // Clear persisted state
        try {
            localStorage.removeItem(TUTOR_STATE_KEY);
        } catch (e) {
            console.error('[TutorContext] Failed to clear persisted state:', e);
        }
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
