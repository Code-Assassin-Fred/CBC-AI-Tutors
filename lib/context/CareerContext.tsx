'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    CareerPath,
    UserCareerProfile,
    UserCareerGoal,
    UserSkillState,
    PersonalizedLearningPlan
} from '@/types/career';
import { useAuth } from './AuthContext';

// Mock data for initial development
const MOCK_CAREER_PATH: CareerPath = {
    id: 'generated-1',
    title: 'Machine Learning Engineer',
    description: 'Design and implement machine learning models and systems.',
    generatedAt: new Date(),
    source: 'ai-generated',
    skillCategories: [],
    totalSkillCount: 15,
    market: {
        demand: 'high',
        demandTrend: 'growing',
        salaryRange: { min: 90000, max: 180000, median: 130000, currency: 'USD' },
        topHiringIndustries: ['Tech', 'Finance', 'Healthcare'],
        topLocations: ['San Francisco', 'New York', 'Remote'],
        growthOutlook: 'Very Strong'
    },
    entry: {
        difficulty: 'challenging',
        typicalBackground: ['CS', 'Math', 'Physics'],
        timeToEntry: '12-18 months',
        certifications: ['AWS ML', 'TensorFlow Dev']
    },
    aiImpact: {
        automationRisk: 'low',
        riskExplanation: 'AI builds AI; demand increases.',
        futureProofSkills: ['Model Architecture', 'Ethics'],
        aiAugmentation: 'Copilot for coding'
    },
    resources: {
        platformCourses: [],
        externalResources: [],
        communities: [],
        books: []
    },
    relatedCareers: [],
    transitionPaths: []
};

interface CareerContextType {
    userProfile: UserCareerProfile | null;
    activeCareerPath: CareerPath | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    generateCareerPath: (goal: string) => Promise<string | null>;
    selectCareerPath: (pathId: string) => Promise<void>;
    startSkillAssessment: (skillId: string) => void;
    updateSkillProficiency: (skillId: string, level: number) => Promise<void>;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserCareerProfile | null>(null);
    const [activeCareerPath, setActiveCareerPath] = useState<CareerPath | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize profile
    useEffect(() => {
        if (user) {
            // TODO: Fetch real profile from Firestore
            setUserProfile({
                userId: user.uid,
                discoveredStrengths: { skills: [], traits: [], assessmentDate: new Date() },
                goals: { alternatives: [] },
                skills: {}
            });
        }
    }, [user]);

    const generateCareerPath = async (goal: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/career/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal })
            });

            if (!response.ok) {
                throw new Error('Failed to generate career path');
            }

            const newPath: CareerPath = await response.json();

            setActiveCareerPath(newPath);
            return newPath.id;
        } catch (err) {
            console.error(err);
            setError('Failed to generate career path');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const selectCareerPath = async (pathId: string) => {
        // TODO: fetch path details if not already loaded
        // setActiveCareerPath(fetchedPath);
    };

    const startSkillAssessment = (skillId: string) => {
        // TODO: Transition to assessment UI
        console.log('Starting assessment for', skillId);
    };

    const updateSkillProficiency = async (skillId: string, level: number) => {
        if (!userProfile) return;

        setUserProfile(prev => {
            if (!prev) return null;
            return {
                ...prev,
                skills: {
                    ...prev.skills,
                    [skillId]: {
                        skillId,
                        proficiency: level,
                        sources: [],
                        lastUpdated: new Date()
                    }
                }
            };
        });
    };

    return (
        <CareerContext.Provider value={{
            userProfile,
            activeCareerPath,
            isLoading,
            error,
            generateCareerPath,
            selectCareerPath,
            startSkillAssessment,
            updateSkillProficiency
        }}>
            {children}
        </CareerContext.Provider>
    );
}

export function useCareer() {
    const context = useContext(CareerContext);
    if (!context) {
        throw new Error('useCareer must be used within a CareerProvider');
    }
    return context;
}
