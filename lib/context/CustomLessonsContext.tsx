"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    CustomLesson,
    CustomLessonGenerationEvent,
} from '@/types/customLesson';
import {
    LessonAgentType,
    LessonAgentEvent,
    AgentUIState,
    SectionProgress,
    ActivityProgress,
    LESSON_AGENTS,
} from '@/types/lesson-agent.types';
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

    // Generation - Basic
    isGenerating: boolean;
    generationError: string | null;
    generateLesson: (topic: string, audienceAge: string, specifications?: string, lessonTime?: string) => Promise<CustomLesson | null>;
    cancelGeneration: () => void;

    // Generation - Agent State (NEW)
    currentAgent: LessonAgentType | null;
    agents: AgentUIState[];
    sections: SectionProgress[];
    activities: ActivityProgress[];
    overallProgress: number;
    currentMessage: string;

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

    // Generation state - Basic
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Generation state - Agent (NEW)
    const [currentAgent, setCurrentAgent] = useState<LessonAgentType | null>(null);
    const [agents, setAgents] = useState<AgentUIState[]>([]);
    const [sections, setSections] = useState<SectionProgress[]>([]);
    const [activities, setActivities] = useState<ActivityProgress[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState('');

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
    // INITIALIZE AGENTS STATE
    // ========================================

    const initializeAgentState = () => {
        const agentTypes: LessonAgentType[] = ['analyst', 'planner', 'instructional', 'creative', 'assembly'];
        setAgents(agentTypes.map(type => ({
            type,
            state: 'pending',
            message: LESSON_AGENTS[type].description,
        })));
        setSections([]);
        setActivities([]);
        setOverallProgress(0);
        setCurrentMessage('Starting generation...');
        setCurrentAgent(null);
    };

    // ========================================
    // PROCESS SSE EVENT
    // ========================================

    const processEvent = (event: LessonAgentEvent) => {
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
                // Initialize sections if planner complete
                if (event.agent === 'planner' && event.data?.sections) {
                    setSections(event.data.sections.map((s: any) => ({
                        index: s.index,
                        title: s.title,
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

            case 'section_start':
                setSections(prev => prev.map(s =>
                    s.index === event.sectionIndex
                        ? { ...s, state: 'writing' as const }
                        : s
                ));
                setCurrentMessage(`Writing Section ${event.sectionIndex + 1}: ${event.title}`);
                break;

            case 'section_complete':
                setSections(prev => prev.map(s =>
                    s.index === event.sectionIndex
                        ? { ...s, state: 'complete' as const, charCount: event.charCount }
                        : s
                ));
                break;

            case 'activity_start':
                // Initialize activities if needed
                if (activities.length === 0 && event.totalActivities) {
                    setActivities(Array.from({ length: event.totalActivities }, (_, i) => ({
                        index: i,
                        title: `Activity ${i + 1}`,
                        state: 'pending' as const,
                    })));
                }
                setActivities(prev => prev.map((act, i) =>
                    i === event.activityIndex
                        ? { ...act, title: event.title, state: 'designing' as const }
                        : act
                ));
                setCurrentMessage(`Designing: ${event.title}`);
                break;

            case 'activity_complete':
                setActivities(prev => prev.map((act, i) =>
                    i === event.activityIndex
                        ? { ...act, state: 'complete' as const }
                        : act
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
    // GENERATE LESSON (V2 - Multi-Agent)
    // ========================================

    const generateLesson = useCallback(async (
        topic: string,
        audienceAge: string,
        specifications?: string,
        lessonTime?: string
    ): Promise<CustomLesson | null> => {
        if (!user) {
            setGenerationError('Please sign in to generate lessons');
            return null;
        }

        setIsGenerating(true);
        setGenerationError(null);
        initializeAgentState();

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetch('/api/teacher/lessons/generate-v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    audienceAge,
                    specifications,
                    lessonTime,
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
                        const event: LessonAgentEvent = JSON.parse(line.slice(6));
                        processEvent(event);

                        if (event.type === 'error') {
                            setIsGenerating(false);
                            return null;
                        }

                        if (event.type === 'done') {
                            generatedLesson = event.data as CustomLesson;
                            if (generatedLesson) {
                                setLessons(prev => [generatedLesson!, ...prev]);
                            }
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
        setCurrentAgent(null);
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
        generationError,
        generateLesson,
        cancelGeneration,
        // Agent state
        currentAgent,
        agents,
        sections,
        activities,
        overallProgress,
        currentMessage,
        // UI
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

