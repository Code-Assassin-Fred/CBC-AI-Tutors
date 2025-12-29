"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    Course,
    CourseLesson,
    CourseQuiz,
    FullCourse,
    GenerationProgress,
    GenerationEvent,
    LearningMode,
    TopicSuggestion,
    CourseProgress,
} from '@/types/course';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

interface CoursesContextType {
    // Generation State
    isGenerating: boolean;
    generationProgress: GenerationProgress | null;
    generationError: string | null;
    generateCourse: (topic: string) => Promise<string | null>;
    cancelGeneration: () => void;

    // Current Course State
    currentCourse: FullCourse | null;
    currentLesson: CourseLesson | null;
    currentQuiz: CourseQuiz | null;
    isLoadingCourse: boolean;
    loadCourse: (courseId: string) => Promise<void>;
    selectLesson: (lessonId: string) => void;
    selectQuiz: (quizId: string) => void;
    clearCurrentCourse: () => void;

    // Learning Mode
    learningMode: LearningMode;
    setLearningMode: (mode: LearningMode) => void;

    // My Courses
    myCourses: Course[];
    isLoadingMyCourses: boolean;
    loadMyCourses: () => Promise<void>;

    // Discovery
    discoverCourses: (query?: string) => Promise<Course[]>;
    suggestions: TopicSuggestion[];
    loadSuggestions: () => Promise<void>;

    // Audio (delegated to shared utilities)
    speak: (text: string) => Promise<void>;
    stopSpeaking: () => void;
    isPlaying: boolean;
}

const CoursesContext = createContext<CoursesContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CoursesProviderProps {
    children: ReactNode;
}

export function CoursesProvider({ children }: CoursesProviderProps) {
    const { user } = useAuth();

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Current course state
    const [currentCourse, setCurrentCourse] = useState<FullCourse | null>(null);
    const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
    const [currentQuiz, setCurrentQuiz] = useState<CourseQuiz | null>(null);
    const [isLoadingCourse, setIsLoadingCourse] = useState(false);
    const [learningMode, setLearningMode] = useState<LearningMode>('explanation');

    // My courses
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [isLoadingMyCourses, setIsLoadingMyCourses] = useState(false);

    // Discovery
    const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioRef] = useState<{ current: HTMLAudioElement | null }>({ current: null });

    // ========================================
    // COURSE GENERATION
    // ========================================

    const generateCourse = useCallback(async (topic: string): Promise<string | null> => {
        if (!user) {
            setGenerationError('Please sign in to generate courses');
            return null;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGenerationProgress({
            step: 'planning',
            message: 'Starting course generation...',
            percentage: 0,
        });

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await fetch('/api/courses/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    userId: user.uid,
                    preferences: {
                        lessonCount: 6,
                        includeQuizzes: true,
                        includeFinalExam: true,
                    },
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to start course generation');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response stream');
            }

            const decoder = new TextDecoder();
            let courseId: string | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const event: GenerationEvent = JSON.parse(line.slice(6));

                        if (event.type === 'error') {
                            setGenerationError(event.error || 'Unknown error');
                            setIsGenerating(false);
                            return null;
                        }

                        if (event.type === 'done') {
                            courseId = (event.data as { courseId?: string })?.courseId || null;
                            setGenerationProgress({
                                step: 'complete',
                                message: event.message || 'Complete!',
                                percentage: 100,
                                data: event.data as Partial<Course>,
                            });
                        } else {
                            setGenerationProgress({
                                step: event.step || 'planning',
                                currentLesson: event.lessonNumber,
                                message: event.message || '',
                                percentage: event.percentage || 0,
                                data: event.data as Partial<Course>,
                            });
                        }
                    } catch {
                        // Skip malformed events
                    }
                }
            }

            setIsGenerating(false);
            return courseId;

        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                setGenerationError('Generation cancelled');
            } else {
                setGenerationError((error as Error).message || 'Failed to generate course');
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
    // COURSE LOADING
    // ========================================

    const loadCourse = useCallback(async (courseId: string) => {
        setIsLoadingCourse(true);
        try {
            const url = user
                ? `/api/courses/${courseId}?userId=${user.uid}`
                : `/api/courses/${courseId}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load course');
            }

            const course: FullCourse = await response.json();
            setCurrentCourse(course);

            // Auto-select first lesson
            if (course.lessons.length > 0) {
                setCurrentLesson(course.lessons[0]);
            }

            setLearningMode('explanation');

        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setIsLoadingCourse(false);
        }
    }, [user]);

    const selectLesson = useCallback((lessonId: string) => {
        if (!currentCourse) return;
        const lesson = currentCourse.lessons.find(l => l.id === lessonId);
        if (lesson) {
            setCurrentLesson(lesson);
            setCurrentQuiz(null);
            setLearningMode('explanation');
        }
    }, [currentCourse]);

    const selectQuiz = useCallback((quizId: string) => {
        if (!currentCourse) return;
        const quiz = currentCourse.quizzes.find(q => q.id === quizId);
        if (quiz) {
            setCurrentQuiz(quiz);
            setLearningMode('quiz');
        }
    }, [currentCourse]);

    const clearCurrentCourse = useCallback(() => {
        setCurrentCourse(null);
        setCurrentLesson(null);
        setCurrentQuiz(null);
    }, []);

    // ========================================
    // MY COURSES
    // ========================================

    const loadMyCourses = useCallback(async () => {
        if (!user) return;

        setIsLoadingMyCourses(true);
        try {
            const response = await fetch(`/api/courses/discover?creatorId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setMyCourses(data.courses || []);
            }
        } catch (error) {
            console.error('Error loading my courses:', error);
        } finally {
            setIsLoadingMyCourses(false);
        }
    }, [user]);

    // ========================================
    // DISCOVERY
    // ========================================

    const discoverCourses = useCallback(async (query?: string): Promise<Course[]> => {
        try {
            const url = query
                ? `/api/courses/discover?q=${encodeURIComponent(query)}`
                : '/api/courses/discover';

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                return data.courses || [];
            }
        } catch (error) {
            console.error('Error discovering courses:', error);
        }
        return [];
    }, []);

    const loadSuggestions = useCallback(async () => {
        try {
            const response = await fetch('/api/courses/suggestions?limit=8');
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }, []);

    // ========================================
    // AUDIO (TTS)
    // ========================================

    const speak = useCallback(async (text: string) => {
        try {
            // Stop any existing playback
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            setIsPlaying(true);

            const response = await fetch('/api/tutor/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();

        } catch (error) {
            console.error('Error speaking:', error);
            setIsPlaying(false);
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    // ========================================
    // CONTEXT VALUE
    // ========================================

    const value: CoursesContextType = {
        // Generation
        isGenerating,
        generationProgress,
        generationError,
        generateCourse,
        cancelGeneration,

        // Current course
        currentCourse,
        currentLesson,
        currentQuiz,
        isLoadingCourse,
        loadCourse,
        selectLesson,
        selectQuiz,
        clearCurrentCourse,

        // Learning mode
        learningMode,
        setLearningMode,

        // My courses
        myCourses,
        isLoadingMyCourses,
        loadMyCourses,

        // Discovery
        discoverCourses,
        suggestions,
        loadSuggestions,

        // Audio
        speak,
        stopSpeaking,
        isPlaying,
    };

    return (
        <CoursesContext.Provider value={value}>
            {children}
        </CoursesContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useCourses() {
    const context = useContext(CoursesContext);
    if (!context) {
        throw new Error('useCourses must be used within a CoursesProvider');
    }
    return context;
}
