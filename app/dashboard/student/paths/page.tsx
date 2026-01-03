"use client";

import { useEffect } from 'react';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CareerPathProvider, useCareerPath } from '@/lib/context/CareerPathContext';
import CareerPathSelector from '@/components/CBCStudent/careerpaths/CareerPathSelector';
import CareerPathGenerating from '@/components/CBCStudent/careerpaths/CareerPathGenerating';
import CareerPathView from '@/components/CBCStudent/careerpaths/CareerPathView';
import { CareerCourse } from '@/types/careerPath';
import { useRouter } from 'next/navigation';

function CareerPathsContent() {
    const router = useRouter();
    const {
        currentView,
        currentPath,
        isGenerating,
        progress,
        generatePath,
        loadSavedPaths,
        reset,
        error
    } = useCareerPath();

    // Load saved paths on mount
    useEffect(() => {
        loadSavedPaths();
    }, [loadSavedPaths]);

    const handleStartCourse = (course: CareerCourse) => {
        // Navigate to courses page to generate/view the course
        // For now, just log - will integrate with course system
        console.log('Starting course:', course.title);
        // Could navigate to: router.push(`/dashboard/student/courses?topic=${encodeURIComponent(course.title)}`);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'selector':
                return (
                    <CareerPathSelector
                        onSelect={generatePath}
                        isGenerating={isGenerating}
                    />
                );
            case 'generating':
                return (
                    <CareerPathGenerating
                        message={progress?.message || 'Generating...'}
                        percentage={progress?.percentage || 0}
                        careerTitle={currentPath?.title || 'your career path'}
                    />
                );
            case 'viewing':
                if (!currentPath) {
                    return (
                        <CareerPathSelector
                            onSelect={generatePath}
                            isGenerating={isGenerating}
                        />
                    );
                }
                return (
                    <CareerPathView
                        careerPath={currentPath}
                        onStartCourse={handleStartCourse}
                        onBack={reset}
                    />
                );
            default:
                return (
                    <CareerPathSelector
                        onSelect={generatePath}
                        isGenerating={isGenerating}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen">
            {error && (
                <div className="max-w-2xl mx-auto mt-4 px-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                        {error}
                    </div>
                </div>
            )}
            {renderContent()}
        </div>
    );
}

export default function CareerPathsPage() {
    return (
        <DashboardLayout active="Career Paths">
            <CareerPathProvider>
                <CareerPathsContent />
            </CareerPathProvider>
        </DashboardLayout>
    );
}
