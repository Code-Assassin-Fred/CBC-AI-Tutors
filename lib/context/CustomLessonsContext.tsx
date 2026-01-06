"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    CustomLesson,
    CustomLessonGenerationProgress,
    CustomLessonGenerationEvent,
} from '@/types/customLesson';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

interface CustomLessonsContextType {
    // Lessons
    lessons: CustomLesson[];
    isLoadingLessons: boolean;
    loadLessons: () => Promise<void>;
    deleteLesson: (lessonId: string) => Promise<boolean>;

    // Generation
    isGenerating: boolean;
    generationProgress: CustomLessonGenerationProgress | null;
    generationError: string | null;
    generateLesson: (topic: string, audienceAge: string, specifications?: string) => Promise<CustomLesson | null>;
    cancelGeneration: () => void;

    // UI State
    selectedLesson: CustomLesson | null;
    setSelectedLesson: (lesson: CustomLesson | null) => void;
}

const CustomLessonsContext = createContext<CustomLessonsContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CustomLessonsProviderProps {
    children: ReactNode;
}

export function CustomLessonsProvider({ children }: CustomLessonsProviderProps) {
    const { user } = useAuth();

    // Lessons state
    const [lessons, setLessons] = useState<CustomLesson[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<CustomLessonGenerationProgress | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // UI state
    const [selectedLesson, setSelectedLesson] = useState<CustomLesson | null>(null);

    // ========================================
    // LOAD LESSONS
    // ========================================

    const loadLessons = useCallback(async () => {
        if (!user) return;

        setIsLoadingLessons(true);
        try {
            const response = await fetch(`/api/teacher/lessons?teacherId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setLessons(data.lessons || []);
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
        } finally {
            setIsLoadingLessons(false);
        }
    }, [user]);

    // ========================================
    // DELETE LESSON
    // ========================================

    const deleteLesson = useCallback(async (lessonId: string): Promise<boolean> => {
        if (!user) return false;

        try {
            const response = await fetch(
                `/api/teacher/lessons?lessonId=${lessonId}&teacherId=${user.uid}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                setLessons(prev => prev.filter(l => l.id !== lessonId));
                if (selectedLesson?.id === lessonId) {
                    setSelectedLesson(null);
                }
                return true;
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
        return false;
    }, [user, selectedLesson]);

    // ========================================
    // GENERATE LESSON
    // ========================================

    const generateLesson = useCallback(async (
        topic: string,
        audienceAge: string,
        specifications?: string
    ): Promise<CustomLesson | null> => {
        if (!user) {
            setGenerationError('Please sign in to generate lessons');
            return null;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGenerationProgress({
            step: 'analyzing',
            message: 'Starting lesson generation...',
            percentage: 0,
        });

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetch('/api/teacher/lessons/generate', {
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
                throw new Error('Failed to start lesson generation');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response stream');
            }

            const decoder = new TextDecoder();
            let generatedLesson: CustomLesson | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const event: CustomLessonGenerationEvent = JSON.parse(line.slice(6));

                        if (event.type === 'error') {
                            setGenerationError(event.error || 'Unknown error');
                            setIsGenerating(false);
                            return null;
                        }

                        if (event.type === 'done') {
                            generatedLesson = event.data as CustomLesson;
                            setGenerationProgress({
                                step: 'complete',
                                message: event.message || 'Complete!',
                                percentage: 100,
                            });
                            // Add to local state
                            if (generatedLesson) {
                                setLessons(prev => [generatedLesson!, ...prev]);
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
            return generatedLesson;

        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                setGenerationError('Generation cancelled');
            } else {
                setGenerationError((error as Error).message || 'Failed to generate lesson');
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

    const value: CustomLessonsContextType = {
        lessons,
        isLoadingLessons,
        loadLessons,
        deleteLesson,
        isGenerating,
        generationProgress,
        generationError,
        generateLesson,
        cancelGeneration,
        selectedLesson,
        setSelectedLesson,
    };

    return (
        <CustomLessonsContext.Provider value={value}>
            {children}
        </CustomLessonsContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useCustomLessons() {
    const context = useContext(CustomLessonsContext);
    if (!context) {
        throw new Error('useCustomLessons must be used within a CustomLessonsProvider');
    }
    return context;
}
