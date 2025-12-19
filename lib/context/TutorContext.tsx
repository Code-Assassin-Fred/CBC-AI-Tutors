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

// Declare global for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

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

    // Refs for audio and recognition
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const recognitionRef = React.useRef<any>(null);

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
            if (recognitionRef.current) {
                recognitionRef.current.stop();
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

                    await audioRef.current.play();
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
    // LISTENING (STT)
    // ============================================

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        stopSpeaking(); // Don't listen to yourself

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setAudioState(prev => ({ ...prev, transcript: currentTranscript }));
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Recognition error:', event.error);
                setAudioState(prev => ({ ...prev, isListening: false }));
            };

            recognitionRef.current.onend = () => {
                setAudioState(prev => ({ ...prev, isListening: false }));
            };
        }

        setAudioState(prev => ({ ...prev, isListening: true, transcript: '' }));
        recognitionRef.current.start();
    }, [stopSpeaking]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
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
