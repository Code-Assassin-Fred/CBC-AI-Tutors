"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
    CareerPath,
    UserCareerProfile,
    PersonalizedLearningPlan,
    CareerDiscoveryMessage,
    CareerSuggestion,
    CareerGenerationProgress,
    UserSkillState,
} from '@/types/career';
import { CareerCourse, CareerGenerationPhase } from '@/types/careerAgents';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

type CareerView = 'entry' | 'discovery-chat' | 'generating' | 'assessment' | 'gap-analysis' | 'career-view' | 'learning-plan' | 'comparison';

interface CareerContextType {
    // View State
    currentView: CareerView;
    setCurrentView: (view: CareerView) => void;

    // Career Generation
    isGenerating: boolean;
    generationProgress: CareerGenerationProgress | null;
    generationPhase: CareerGenerationPhase | null;
    generationError: string | null;
    generateCareer: (title: string) => Promise<CareerPath | null>;

    // Discovery Chat
    discoveryMessages: CareerDiscoveryMessage[];
    isDiscovering: boolean;
    sendDiscoveryMessage: (message: string) => Promise<void>;
    careerSuggestions: CareerSuggestion[];
    selectSuggestion: (suggestion: CareerSuggestion) => void;

    // Active Career
    activeCareer: CareerPath | null;
    setActiveCareer: (career: CareerPath | null) => void;

    // Saved Careers (persistence)
    savedCareers: CareerPath[];
    loadSavedCareers: () => Promise<void>;
    saveCareerPath: (careerPathId: string) => Promise<void>;
    removeCareerPath: (careerPathId: string) => Promise<void>;

    // Career Courses
    careerCourses: CareerCourse[];
    fetchCareerCourses: (careerPathId: string) => Promise<void>;

    // User Profile
    userProfile: UserCareerProfile | null;
    loadUserProfile: () => Promise<void>;

    // Skills
    skillStates: Record<string, UserSkillState>;
    updateSkillState: (skillId: string, state: UserSkillState) => void;

    // Assessment
    isAssessing: boolean;
    startAssessment: () => void;
    submitAssessmentAnswer: (skillId: string, questionId: string, answer: number) => void;
    assessmentResults: Record<string, number>;

    // Learning Plan
    learningPlan: PersonalizedLearningPlan | null;
    generateLearningPlan: () => Promise<void>;
    isGeneratingPlan: boolean;

    // Comparison
    comparisonCareers: CareerPath[];
    addToComparison: (career: CareerPath) => void;
    removeFromComparison: (careerId: string) => void;
    clearComparison: () => void;

    // Reset
    reset: () => void;
}

const CareerContext = createContext<CareerContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CareerProviderProps {
    children: ReactNode;
}

export function CareerProvider({ children }: CareerProviderProps) {
    const { user } = useAuth();

    // View State
    const [currentView, setCurrentView] = useState<CareerView>('entry');

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<CareerGenerationProgress | null>(null);
    const [generationPhase, setGenerationPhase] = useState<CareerGenerationPhase | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Discovery State
    const [discoveryMessages, setDiscoveryMessages] = useState<CareerDiscoveryMessage[]>([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [careerSuggestions, setCareerSuggestions] = useState<CareerSuggestion[]>([]);

    // Active Career
    const [activeCareer, setActiveCareer] = useState<CareerPath | null>(null);

    // Saved Careers (persistence)
    const [savedCareers, setSavedCareers] = useState<CareerPath[]>([]);

    // Career Courses
    const [careerCourses, setCareerCourses] = useState<CareerCourse[]>([]);

    // User Profile
    const [userProfile, setUserProfile] = useState<UserCareerProfile | null>(null);
    const [skillStates, setSkillStates] = useState<Record<string, UserSkillState>>({});

    // Assessment
    const [isAssessing, setIsAssessing] = useState(false);
    const [assessmentResults, setAssessmentResults] = useState<Record<string, number>>({});

    // Learning Plan
    const [learningPlan, setLearningPlan] = useState<PersonalizedLearningPlan | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    // Comparison
    const [comparisonCareers, setComparisonCareers] = useState<CareerPath[]>([]);

    // Generate Career Path
    const generateCareer = useCallback(async (title: string): Promise<CareerPath | null> => {
        if (!user) return null;

        setIsGenerating(true);
        setGenerationError(null);
        setCurrentView('generating');
        setGenerationProgress({ step: 'researching', message: 'Researching career...', percentage: 0 });

        try {
            const response = await fetch('/api/career/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, userId: user.uid }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate career path');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let career: CareerPath | null = null;
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Split by double newline which is the standard SSE message separator
                const parts = buffer.split('\n\n');

                // Keep the last part in the buffer if it doesn't end with a double newline
                // (it might be an incomplete message)
                buffer = parts.pop() || '';

                for (const part of parts) {
                    const line = part.trim();
                    if (!line || !line.startsWith('data: ')) continue;

                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === 'progress') {
                            setGenerationProgress({
                                step: data.phase || data.step,
                                message: data.message,
                                percentage: data.progress || data.percentage || 0,
                            });
                        } else if (data.type === 'complete') {
                            career = data.data;
                            setActiveCareer(career);
                            setCurrentView('assessment');
                        } else if (data.type === 'error') {
                            throw new Error(data.error);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE chunk:', e, line);
                        // Skip invalid JSON
                    }
                }
            }

            return career;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('[CareerContext] Generation error:', error);
            setGenerationError(message);
            // Don't reset view to entry, let CareerGenerating show the error
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [user]);

    // Discovery Chat
    const sendDiscoveryMessage = useCallback(async (message: string) => {
        if (!user) return;

        const userMessage: CareerDiscoveryMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setDiscoveryMessages(prev => [...prev, userMessage]);
        setIsDiscovering(true);

        try {
            const response = await fetch('/api/career/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...discoveryMessages, userMessage],
                    userId: user.uid,
                }),
            });

            if (!response.ok) throw new Error('Discovery failed');

            const data = await response.json();

            const assistantMessage: CareerDiscoveryMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                suggestions: data.suggestions,
            };

            setDiscoveryMessages(prev => [...prev, assistantMessage]);

            if (data.suggestions?.length > 0) {
                setCareerSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Discovery error:', error);
        } finally {
            setIsDiscovering(false);
        }
    }, [user, discoveryMessages]);

    // Select Suggestion
    const selectSuggestion = useCallback((suggestion: CareerSuggestion) => {
        generateCareer(suggestion.careerTitle);
    }, [generateCareer]);

    // Load User Profile
    const loadUserProfile = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/user/career-profile?userId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);
                setSkillStates(data.skills || {});
            }
        } catch (error) {
            console.error('Failed to load career profile:', error);
        }
    }, [user]);

    // Update Skill State
    const updateSkillState = useCallback((skillId: string, state: UserSkillState) => {
        setSkillStates(prev => ({ ...prev, [skillId]: state }));
    }, []);

    // Assessment
    const startAssessment = useCallback(() => {
        setIsAssessing(true);
        setAssessmentResults({});
        setCurrentView('assessment');
    }, []);

    const submitAssessmentAnswer = useCallback((skillId: string, questionId: string, answer: number) => {
        // This would be called for each question, accumulating results
        setAssessmentResults(prev => ({
            ...prev,
            [`${skillId}_${questionId}`]: answer,
        }));
    }, []);

    // Generate Learning Plan
    const generateLearningPlan = useCallback(async () => {
        if (!user || !activeCareer) return;

        setIsGeneratingPlan(true);

        try {
            const response = await fetch('/api/career/learning-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    careerId: activeCareer.id,
                    careerTitle: activeCareer.title,
                    skillStates,
                }),
            });

            if (response.ok) {
                const plan = await response.json();
                setLearningPlan(plan);
                setCurrentView('learning-plan');
            }
        } catch (error) {
            console.error('Failed to generate learning plan:', error);
        } finally {
            setIsGeneratingPlan(false);
        }
    }, [user, activeCareer, skillStates]);

    // Comparison
    const addToComparison = useCallback((career: CareerPath) => {
        setComparisonCareers(prev => {
            if (prev.length >= 3 || prev.find(c => c.id === career.id)) return prev;
            return [...prev, career];
        });
    }, []);

    const removeFromComparison = useCallback((careerId: string) => {
        setComparisonCareers(prev => prev.filter(c => c.id !== careerId));
    }, []);

    const clearComparison = useCallback(() => {
        setComparisonCareers([]);
    }, []);

    // Load Saved Careers
    const loadSavedCareers = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/career/save?userId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setSavedCareers(data.savedCareers || []);
                if (data.activeCareerPathId && !activeCareer) {
                    const activeSaved = data.savedCareers?.find((c: CareerPath) => c.id === data.activeCareerPathId);
                    if (activeSaved) setActiveCareer(activeSaved);
                }
                if (data.activeLearningPlan) {
                    setLearningPlan(data.activeLearningPlan);
                }
                if (data.skillStates) {
                    setSkillStates(data.skillStates);
                }
            }
        } catch (error) {
            console.error('Failed to load saved careers:', error);
        }
    }, [user, activeCareer]);

    // Save Career Path
    const saveCareerPath = useCallback(async (careerPathId: string) => {
        if (!user) return;

        try {
            await fetch('/api/career/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, careerPathId }),
            });
            await loadSavedCareers();
        } catch (error) {
            console.error('Failed to save career path:', error);
        }
    }, [user, loadSavedCareers]);

    // Remove Career Path
    const removeCareerPath = useCallback(async (careerPathId: string) => {
        if (!user) return;

        try {
            await fetch(`/api/career/save?userId=${user.uid}&careerPathId=${careerPathId}`, {
                method: 'DELETE',
            });
            setSavedCareers(prev => prev.filter(c => c.id !== careerPathId));
            if (activeCareer?.id === careerPathId) {
                setActiveCareer(null);
            }
        } catch (error) {
            console.error('Failed to remove career path:', error);
        }
    }, [user, activeCareer]);

    // Fetch Career Courses
    const fetchCareerCourses = useCallback(async (careerPathId: string) => {
        try {
            const response = await fetch(`/api/career/courses?careerPathId=${careerPathId}`);
            if (response.ok) {
                const data = await response.json();
                setCareerCourses(data.courses || []);
            }
        } catch (error) {
            console.error('Failed to fetch career courses:', error);
        }
    }, []);

    // Load saved careers on mount
    useEffect(() => {
        if (user) {
            loadSavedCareers();
        }
    }, [user, loadSavedCareers]);

    // Reset
    const reset = useCallback(() => {
        setCurrentView('entry');
        setActiveCareer(null);
        setDiscoveryMessages([]);
        setCareerSuggestions([]);
        setAssessmentResults({});
        setLearningPlan(null);
        setGenerationError(null);
        setCareerCourses([]);
    }, []);

    const value: CareerContextType = {
        currentView,
        setCurrentView,
        isGenerating,
        generationProgress,
        generationPhase,
        generationError,
        generateCareer,
        discoveryMessages,
        isDiscovering,
        sendDiscoveryMessage,
        careerSuggestions,
        selectSuggestion,
        activeCareer,
        setActiveCareer,
        savedCareers,
        loadSavedCareers,
        saveCareerPath,
        removeCareerPath,
        careerCourses,
        fetchCareerCourses,
        userProfile,
        loadUserProfile,
        skillStates,
        updateSkillState,
        isAssessing,
        startAssessment,
        submitAssessmentAnswer,
        assessmentResults,
        learningPlan,
        generateLearningPlan,
        isGeneratingPlan,
        comparisonCareers,
        addToComparison,
        removeFromComparison,
        clearComparison,
        reset,
    };

    return (
        <CareerContext.Provider value={value}>
            {children}
        </CareerContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useCareer() {
    const context = useContext(CareerContext);
    if (!context) {
        throw new Error('useCareer must be used within CareerProvider');
    }
    return context;
}
