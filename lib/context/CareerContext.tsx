"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    CareerPath,
    UserCareerProfile,
    PersonalizedLearningPlan,
    CareerDiscoveryMessage,
    CareerSuggestion,
    CareerGenerationProgress,
    UserSkillState,
} from '@/types/career';
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
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Discovery State
    const [discoveryMessages, setDiscoveryMessages] = useState<CareerDiscoveryMessage[]>([]);
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [careerSuggestions, setCareerSuggestions] = useState<CareerSuggestion[]>([]);

    // Active Career
    const [activeCareer, setActiveCareer] = useState<CareerPath | null>(null);

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

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.type === 'progress') {
                            setGenerationProgress({
                                step: data.step,
                                message: data.message,
                                percentage: data.percentage,
                            });
                        } else if (data.type === 'complete') {
                            career = data.data;
                            setActiveCareer(career);
                            setCurrentView('assessment');
                        } else if (data.type === 'error') {
                            throw new Error(data.error);
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }

            return career;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setGenerationError(message);
            setCurrentView('entry');
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

    // Reset
    const reset = useCallback(() => {
        setCurrentView('entry');
        setActiveCareer(null);
        setDiscoveryMessages([]);
        setCareerSuggestions([]);
        setAssessmentResults({});
        setLearningPlan(null);
        setGenerationError(null);
    }, []);

    const value: CareerContextType = {
        currentView,
        setCurrentView,
        isGenerating,
        generationProgress,
        generationError,
        generateCareer,
        discoveryMessages,
        isDiscovering,
        sendDiscoveryMessage,
        careerSuggestions,
        selectSuggestion,
        activeCareer,
        setActiveCareer,
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
