"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    CustomTextbook,
    CustomTextbookGenerationProgress,
    CustomTextbookGenerationEvent,
} from '@/types/customTextbook';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

interface CustomTextbooksContextType {
    // Textbooks
    textbooks: CustomTextbook[];
    isLoadingTextbooks: boolean;
    loadTextbooks: () => Promise<void>;
    deleteTextbook: (textbookId: string) => Promise<boolean>;

    // Generation
    isGenerating: boolean;
    generationProgress: CustomTextbookGenerationProgress | null;
    generationError: string | null;
    generateTextbook: (topic: string, audienceAge: string, specifications?: string) => Promise<CustomTextbook | null>;
    cancelGeneration: () => void;

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

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<CustomTextbookGenerationProgress | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

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
    // GENERATE TEXTBOOK
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
        setGenerationProgress({
            step: 'analyzing',
            message: 'Starting textbook generation...',
            percentage: 0,
        });

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetch('/api/teacher/textbooks/generate', {
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
                        const event: CustomTextbookGenerationEvent = JSON.parse(line.slice(6));

                        if (event.type === 'error') {
                            setGenerationError(event.error || 'Unknown error');
                            setIsGenerating(false);
                            return null;
                        }

                        if (event.type === 'done') {
                            generatedTextbook = event.data as CustomTextbook;
                            setGenerationProgress({
                                step: 'complete',
                                message: event.message || 'Complete!',
                                percentage: 100,
                            });
                            // Add to local state
                            if (generatedTextbook) {
                                setTextbooks(prev => [generatedTextbook!, ...prev]);
                            }
                        } else {
                            setGenerationProgress({
                                step: event.step || 'analyzing',
                                message: event.message || '',
                                percentage: event.percentage || 0,
                            });
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
        setGenerationProgress(null);
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
        generationProgress,
        generationError,
        generateTextbook,
        cancelGeneration,
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
