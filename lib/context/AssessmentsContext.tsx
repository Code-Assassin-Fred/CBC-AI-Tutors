'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    Assessment,
    UploadedMaterial,
    AssessmentConfig,
    AssessmentGenerationProgress,
    AssessmentGenerationEvent,
    DEFAULT_QUESTION_TYPES,
} from '@/types/assessment';

interface AssessmentsContextValue {
    // Assessments
    assessments: Assessment[];
    isLoadingAssessments: boolean;
    loadAssessments: () => Promise<void>;
    deleteAssessment: (assessmentId: string) => Promise<void>;
    selectedAssessment: Assessment | null;
    setSelectedAssessment: (assessment: Assessment | null) => void;

    // Materials
    uploadedMaterials: UploadedMaterial[];
    isUploading: boolean;
    uploadProgress: number;
    uploadMaterial: (file: File) => Promise<UploadedMaterial | null>;
    removeMaterial: (materialId: string) => void;
    clearMaterials: () => void;

    // Generation
    isGenerating: boolean;
    generationProgress: AssessmentGenerationProgress | null;
    generationError: string | null;
    generateAssessment: (config: AssessmentConfig) => Promise<Assessment | null>;
}

const AssessmentsContext = createContext<AssessmentsContextValue | null>(null);

export function useAssessments() {
    const context = useContext(AssessmentsContext);
    if (!context) {
        throw new Error('useAssessments must be used within an AssessmentsProvider');
    }
    return context;
}

export function AssessmentsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Assessments state
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoadingAssessments, setIsLoadingAssessments] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

    // Materials state
    const [uploadedMaterials, setUploadedMaterials] = useState<UploadedMaterial[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<AssessmentGenerationProgress | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Load assessments
    const loadAssessments = useCallback(async () => {
        if (!user?.uid) return;

        setIsLoadingAssessments(true);
        try {
            const response = await fetch(`/api/teacher/assessments?teacherId=${user.uid}`);
            const data = await response.json();

            if (data.assessments) {
                setAssessments(data.assessments);
            }
        } catch (error) {
            console.error('Failed to load assessments:', error);
        } finally {
            setIsLoadingAssessments(false);
        }
    }, [user?.uid]);

    // Delete assessment
    const deleteAssessment = useCallback(async (assessmentId: string) => {
        if (!user?.uid) return;

        try {
            await fetch(`/api/teacher/assessments?assessmentId=${assessmentId}&teacherId=${user.uid}`, {
                method: 'DELETE',
            });
            setAssessments(prev => prev.filter(a => a.id !== assessmentId));
            if (selectedAssessment?.id === assessmentId) {
                setSelectedAssessment(null);
            }
        } catch (error) {
            console.error('Failed to delete assessment:', error);
        }
    }, [user?.uid, selectedAssessment]);

    // Upload material
    const uploadMaterial = useCallback(async (file: File): Promise<UploadedMaterial | null> => {
        if (!user?.uid) return null;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('teacherId', user.uid);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch('/api/teacher/assessments/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (data.material) {
                setUploadedMaterials(prev => [...prev, data.material]);
                return data.material;
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Failed to upload material:', error);
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [user?.uid]);

    // Remove material
    const removeMaterial = useCallback((materialId: string) => {
        setUploadedMaterials(prev => prev.filter(m => m.id !== materialId));
    }, []);

    // Clear all materials
    const clearMaterials = useCallback(() => {
        setUploadedMaterials([]);
    }, []);

    // Generate assessment
    const generateAssessment = useCallback(async (config: AssessmentConfig): Promise<Assessment | null> => {
        if (!user?.uid || uploadedMaterials.length === 0) return null;

        setIsGenerating(true);
        setGenerationError(null);
        setGenerationProgress(null);

        try {
            const response = await fetch('/api/teacher/assessments/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: user.uid,
                    materialUrls: uploadedMaterials.map(m => m.url),
                    materialNames: uploadedMaterials.map(m => m.name),
                    config,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start generation');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response stream');
            }

            const decoder = new TextDecoder();
            let assessment: Assessment | null = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event: AssessmentGenerationEvent = JSON.parse(line.slice(6));

                            if (event.type === 'progress' && event.step && event.message && event.percentage !== undefined) {
                                setGenerationProgress({
                                    step: event.step,
                                    message: event.message,
                                    percentage: event.percentage,
                                });
                            } else if (event.type === 'done' && event.data) {
                                assessment = event.data as Assessment;
                                setAssessments(prev => [assessment!, ...prev]);
                                clearMaterials();
                            } else if (event.type === 'error') {
                                throw new Error(event.error || 'Generation failed');
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            return assessment;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setGenerationError(errorMessage);
            console.error('Failed to generate assessment:', error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [user?.uid, uploadedMaterials, clearMaterials]);

    const value: AssessmentsContextValue = {
        assessments,
        isLoadingAssessments,
        loadAssessments,
        deleteAssessment,
        selectedAssessment,
        setSelectedAssessment,
        uploadedMaterials,
        isUploading,
        uploadProgress,
        uploadMaterial,
        removeMaterial,
        clearMaterials,
        isGenerating,
        generationProgress,
        generationError,
        generateAssessment,
    };

    return (
        <AssessmentsContext.Provider value={value}>
            {children}
        </AssessmentsContext.Provider>
    );
}
