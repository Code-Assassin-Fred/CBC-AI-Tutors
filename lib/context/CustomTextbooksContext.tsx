"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    TextbookAgentType,
    TextbookAgentEvent,
    AgentUIState,
    ChapterProgress,
    ImageProgress,
    TEXTBOOK_AGENTS,
} from '@/types/textbook-agent.types';

// ============================================
// LEGACY TYPES (for backwards compatibility)
// ============================================

interface CustomTextbookChapter {
    title: string;
    content: string;
    keyPoints?: string[];
    exercises?: Array<{
        question: string;
        type: 'open-ended' | 'multiple-choice' | 'activity';
    }>;
    imageUrl?: string;
}

interface CustomTextbookContent {
    introduction: string;
    learningObjectives: string[];
    chapters: CustomTextbookChapter[];
    practiceQuestions: Array<{
        question: string;
        answer?: string;
    }>;
    summary: string;
    glossary?: Array<{
        term: string;
        definition: string;
    }>;
}

interface CustomTextbook {
    id: string;
    teacherId: string;
    title: string;
    topic: string;
    audienceAge: string;
    specifications?: string;
    content: CustomTextbookContent;
    coverImageUrl?: string;
    estimatedReadingTime?: string;
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// CONTEXT TYPE
// ============================================

interface CustomTextbooksContextType {
    // Textbooks
    textbooks: CustomTextbook[];
    isLoadingTextbooks: boolean;
    loadTextbooks: () => Promise<void>;
    deleteTextbook: (textbookId: string) => Promise<boolean>;

    // Generation - Basic
    isGenerating: boolean;
    generationError: string | null;
    generateTextbook: (topic: string, audienceAge: string, specifications?: string) => Promise<CustomTextbook | null>;
    cancelGeneration: () => void;

    // Generation - Agent State (NEW)
    currentAgent: TextbookAgentType | null;
    agents: AgentUIState[];
    chapters: ChapterProgress[];
    images: ImageProgress[];
    overallProgress: number;
    currentMessage: string;

    // UI State
    selectedTextbook: CustomTextbook | null;
    setSelectedTextbook: (textbook: CustomTextbook | null) => void;
}

const CustomTextbooksContext = createContext<CustomTextbooksContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CustomTextbooksProviderProps {
    children: ReactNode;
}

export function CustomTextbooksProvider({ children }: CustomTextbooksProviderProps) {
    const { user } = useAuth();

    // Textbooks state
    const [textbooks, setTextbooks] = useState<CustomTextbook[]>([]);
    const [isLoadingTextbooks, setIsLoadingTextbooks] = useState(false);

    // Generation state - Basic
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Generation state - Agent (NEW)
    const [currentAgent, setCurrentAgent] = useState<TextbookAgentType | null>(null);
    const [agents, setAgents] = useState<AgentUIState[]>([]);
    const [chapters, setChapters] = useState<ChapterProgress[]>([]);
    const [images, setImages] = useState<ImageProgress[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState('');

    // UI state
    const [selectedTextbook, setSelectedTextbook] = useState<CustomTextbook | null>(null);

    // ========================================
    // LOAD TEXTBOOKS
    // ========================================

    const loadTextbooks = useCallback(async () => {
        if (!user) return;

        setIsLoadingTextbooks(true);
        try {
            const response = await fetch(`/api/teacher/textbooks?teacherId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setTextbooks(data.textbooks || []);
            }
        } catch (error) {
            console.error('Error loading textbooks:', error);
        } finally {
            setIsLoadingTextbooks(false);
        }
    }, [user]);

    // ========================================
    // DELETE TEXTBOOK
    // ========================================

    const deleteTextbook = useCallback(async (textbookId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const response = await fetch(
                `/api/teacher/textbooks?textbookId=${textbookId}&teacherId=${user.uid}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                setTextbooks(prev => prev.filter(t => t.id !== textbookId));
                if (selectedTextbook?.id === textbookId) {
                    setSelectedTextbook(null);
                }
                return true;
            }
        } catch (error) {
            console.error('Error deleting textbook:', error);
        }
        return false;
    }, [user, selectedTextbook]);

    // ========================================
    // INITIALIZE AGENTS STATE
    // ========================================

    const initializeAgentState = () => {
        const agentTypes: TextbookAgentType[] = ['research', 'outline', 'content', 'illustration', 'assembly'];
        setAgents(agentTypes.map(type => ({
            type,
            state: 'pending',
            message: TEXTBOOK_AGENTS[type].description,
        })));
        setChapters([]);
        setImages([]);
        setOverallProgress(0);
        setCurrentMessage('Starting generation...');
        setCurrentAgent(null);
    };

    // ========================================
    // PROCESS SSE EVENT
    // ========================================

    const processEvent = (event: TextbookAgentEvent) => {
        // Update progress
        if (event.percentage !== undefined) {
            setOverallProgress(event.percentage);
        }

        switch (event.type) {
            case 'agent_start':
                setCurrentAgent(event.agent);
                setCurrentMessage(event.message);
                setAgents(prev => prev.map(a =>
                    a.type === event.agent
                        ? { ...a, state: 'running', message: event.message }
                        : a
                ));
                break;

            case 'agent_step':
                setCurrentMessage(event.message);
                setAgents(prev => prev.map(a =>
                    a.type === event.agent
                        ? { ...a, message: event.message }
                        : a
                ));
                break;

            case 'agent_complete':
                setAgents(prev => prev.map(a =>
                    a.type === event.agent
                        ? { ...a, state: 'complete', message: event.message }
                        : a
                ));
                // Initialize chapters if outline complete
                if (event.agent === 'outline' && event.data?.chapters) {
                    setChapters(event.data.chapters.map((ch: any) => ({
                        index: ch.index,
                        title: ch.title,
                        state: 'pending' as const,
                    })));
                }
                break;

            case 'agent_error':
                setAgents(prev => prev.map(a =>
                    a.type === event.agent
                        ? { ...a, state: 'error', message: event.message, error: event.error }
                        : a
                ));
                break;

            case 'chapter_start':
                setChapters(prev => prev.map(ch =>
                    ch.index === event.chapter - 1
                        ? { ...ch, state: 'writing' as const }
                        : ch
                ));
                setCurrentMessage(`Writing Chapter ${event.chapter}: ${event.title}`);
                break;

            case 'chapter_complete':
                setChapters(prev => prev.map(ch =>
                    ch.index === event.chapter - 1
                        ? { ...ch, state: 'complete' as const, charCount: event.charCount }
                        : ch
                ));
                break;

            case 'image_start':
                // Initialize images if needed
                if (images.length === 0 && event.totalImages) {
                    setImages(Array.from({ length: event.totalImages }, (_, i) => ({
                        index: i,
                        description: i === 0 ? 'Cover' : `Chapter ${i}`,
                        state: 'pending' as const,
                    })));
                }
                setImages(prev => prev.map((img, i) =>
                    i === event.imageIndex - 1
                        ? { ...img, description: event.description, state: 'generating' as const }
                        : img
                ));
                setCurrentMessage(`Generating: ${event.description}`);
                break;

            case 'image_complete':
                setImages(prev => prev.map((img, i) =>
                    i === event.imageIndex - 1
                        ? { ...img, state: 'complete' as const, imageUrl: event.imageUrl }
                        : img
                ));
                break;

            case 'done':
                setCurrentAgent(null);
                setCurrentMessage(event.message);
                setOverallProgress(100);
                break;

            case 'error':
                setGenerationError(event.error || event.message);
                break;
        }
    };

    // ========================================
    // GENERATE TEXTBOOK (V2 - Multi-Agent)
    // ========================================

    const generateTextbook = useCallback(async (
        topic: string,
        audienceAge: string,
        specifications?: string
    ): Promise<CustomTextbook | null> => {
        if (!user) {
            setGenerationError('Please sign in to generate textbooks');
            return null;
        }

        setIsGenerating(true);
        setGenerationError(null);
        initializeAgentState();

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetch('/api/teacher/textbooks/generate-v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    audienceAge,
                    specifications,
                    teacherId: user.uid,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to start textbook generation');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response stream');
            }

            const decoder = new TextDecoder();
            let generatedTextbook: CustomTextbook | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const event: TextbookAgentEvent = JSON.parse(line.slice(6));
                        processEvent(event);

                        if (event.type === 'error') {
                            setIsGenerating(false);
                            return null;
                        }

                        if (event.type === 'done') {
                            generatedTextbook = event.data as CustomTextbook;
                            if (generatedTextbook) {
                                setTextbooks(prev => [generatedTextbook!, ...prev]);
                            }
                        }
                    } catch {
                        // Skip malformed events
                    }
                }
            }

            setIsGenerating(false);
            return generatedTextbook;

        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                setGenerationError('Generation cancelled');
            } else {
                setGenerationError((error as Error).message || 'Failed to generate textbook');
            }
            setIsGenerating(false);
            return null;
        }
    }, [user]);

    const cancelGeneration = useCallback(() => {
        abortController?.abort();
        setAbortController(null);
        setIsGenerating(false);
        setCurrentAgent(null);
    }, [abortController]);

    // ========================================
    // CONTEXT VALUE
    // ========================================

    const value: CustomTextbooksContextType = {
        textbooks,
        isLoadingTextbooks,
        loadTextbooks,
        deleteTextbook,
        isGenerating,
        generationError,
        generateTextbook,
        cancelGeneration,
        // Agent state
        currentAgent,
        agents,
        chapters,
        images,
        overallProgress,
        currentMessage,
        // UI
        selectedTextbook,
        setSelectedTextbook,
    };

    return (
        <CustomTextbooksContext.Provider value={value}>
            {children}
        </CustomTextbooksContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useCustomTextbooks() {
    const context = useContext(CustomTextbooksContext);
    if (!context) {
        throw new Error('useCustomTextbooks must be used within a CustomTextbooksProvider');
    }
    return context;
}
