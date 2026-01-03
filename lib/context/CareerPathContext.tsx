"use client";

/**
 * Career Path Context (Simplified)
 * 
 * Manages career path state: generation, viewing, and saved paths
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CareerPath, CareerPathGenerationProgress } from '@/types/careerPath';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

type CareerView = 'selector' | 'generating' | 'viewing';

interface CareerPathContextType {
    // State
    currentView: CareerView;
    currentPath: CareerPath | null;
    isGenerating: boolean;
    progress: CareerPathGenerationProgress | null;
    savedPaths: CareerPath[];
    error: string | null;

    // Actions
    generatePath: (careerTitle: string) => Promise<void>;
    loadPath: (pathId: string) => Promise<void>;
    loadSavedPaths: () => Promise<void>;
    viewPath: (path: CareerPath) => void;
    reset: () => void;
}

const CareerPathContext = createContext<CareerPathContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CareerPathProviderProps {
    children: ReactNode;
}

export function CareerPathProvider({ children }: CareerPathProviderProps) {
    const { user } = useAuth();

    // State
    const [currentView, setCurrentView] = useState<CareerView>('selector');
    const [currentPath, setCurrentPath] = useState<CareerPath | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<CareerPathGenerationProgress | null>(null);
    const [savedPaths, setSavedPaths] = useState<CareerPath[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Generate a new career path
    const generatePath = useCallback(async (careerTitle: string) => {
        if (!user) {
            setError('Please sign in to generate a career path');
            return;
        }

        setIsGenerating(true);
        setCurrentView('generating');
        setProgress({ step: 'generating', message: 'Analyzing career requirements...', percentage: 10 });
        setError(null);

        try {
            // Progress updates
            const progressSteps = [
                { message: 'Analyzing career requirements...', percentage: 10 },
                { message: 'Researching industry standards...', percentage: 30 },
                { message: 'Curating learning path...', percentage: 50 },
                { message: 'Building course structure...', percentage: 70 },
                { message: 'Defining learning outcomes...', percentage: 85 },
            ];

            let stepIndex = 0;
            const progressInterval = setInterval(() => {
                if (stepIndex < progressSteps.length) {
                    setProgress({
                        step: 'generating',
                        ...progressSteps[stepIndex]
                    });
                    stepIndex++;
                }
            }, 2000);

            const response = await fetch('/api/career-paths/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    careerTitle,
                    userId: user.uid,
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error('Failed to generate career path');
            }

            const data = await response.json();

            setProgress({ step: 'complete', message: 'Career path ready!', percentage: 100 });

            // Parse dates
            const careerPath: CareerPath = {
                ...data.careerPath,
                createdAt: new Date(data.careerPath.createdAt),
            };

            setCurrentPath(careerPath);
            setSavedPaths(prev => [careerPath, ...prev]);

            // Short delay before showing the path
            setTimeout(() => {
                setCurrentView('viewing');
                setIsGenerating(false);
            }, 500);

        } catch (err) {
            console.error('Error generating career path:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate career path');
            setProgress({ step: 'error', message: 'Generation failed', percentage: 0 });
            setIsGenerating(false);
            setCurrentView('selector');
        }
    }, [user]);

    // Load a saved career path
    const loadPath = useCallback(async (pathId: string) => {
        // Check if already in saved paths
        const existing = savedPaths.find(p => p.id === pathId);
        if (existing) {
            setCurrentPath(existing);
            setCurrentView('viewing');
            return;
        }

        // Fetch from API
        try {
            const response = await fetch(`/api/career-paths/${pathId}`);
            if (response.ok) {
                const data = await response.json();
                const path: CareerPath = {
                    ...data.path,
                    createdAt: new Date(data.path.createdAt),
                };
                setCurrentPath(path);
                setCurrentView('viewing');
            }
        } catch (err) {
            console.error('Error loading career path:', err);
        }
    }, [savedPaths]);

    // Load user's saved paths
    const loadSavedPaths = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/career-paths?userId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                const paths = data.paths.map((p: CareerPath & { createdAt: string }) => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                }));
                setSavedPaths(paths);
            }
        } catch (err) {
            console.error('Error loading saved paths:', err);
        }
    }, [user]);

    // View a path directly
    const viewPath = useCallback((path: CareerPath) => {
        setCurrentPath(path);
        setCurrentView('viewing');
    }, []);

    // Reset to selector
    const reset = useCallback(() => {
        setCurrentView('selector');
        setCurrentPath(null);
        setProgress(null);
        setError(null);
        setIsGenerating(false);
    }, []);

    const value: CareerPathContextType = {
        currentView,
        currentPath,
        isGenerating,
        progress,
        savedPaths,
        error,
        generatePath,
        loadPath,
        loadSavedPaths,
        viewPath,
        reset,
    };

    return (
        <CareerPathContext.Provider value={value}>
            {children}
        </CareerPathContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useCareerPath() {
    const context = useContext(CareerPathContext);
    if (!context) {
        throw new Error('useCareerPath must be used within a CareerPathProvider');
    }
    return context;
}
