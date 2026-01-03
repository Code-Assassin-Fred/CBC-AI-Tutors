"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CareerPathProvider, useCareerPath } from '@/lib/context/CareerPathContext';
import { CoursesProvider } from '@/lib/context/CoursesContext';
import { useAuth } from '@/lib/context/AuthContext';
import CareerPathSelector from '@/components/CBCStudent/careerpaths/CareerPathSelector';
import CareerPathGenerating from '@/components/CBCStudent/careerpaths/CareerPathGenerating';
import CareerPathView from '@/components/CBCStudent/careerpaths/CareerPathView';
import MyCareerPaths from '@/components/CBCStudent/careerpaths/MyCareerPaths';
import { CareerCourse, CareerPath } from '@/types/careerPath';
import { useRouter } from 'next/navigation';

interface CourseProgressInfo {
    title: string;
    enrolled: boolean;
    isCompleted: boolean;
    overallProgress: number;
}

function CareerPathsContent() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        currentView,
        currentPath,
        isGenerating,
        progress,
        savedPaths,
        generatePath,
        loadSavedPaths,
        viewPath,
        reset,
        error
    } = useCareerPath();

    const [activeTab, setActiveTab] = useState<'my-paths' | 'create'>('my-paths');
    const [isLoadingPaths, setIsLoadingPaths] = useState(true);
    const [courseProgress, setCourseProgress] = useState<CourseProgressInfo[]>([]);

    // Load saved paths on mount
    useEffect(() => {
        const load = async () => {
            setIsLoadingPaths(true);
            await loadSavedPaths();
            setIsLoadingPaths(false);
        };
        load();
    }, [loadSavedPaths]);

    // Fetch actual course progress when viewing a career path
    useEffect(() => {
        if (!currentPath || !user) {
            setCourseProgress([]);
            return;
        }

        const fetchProgress = async () => {
            try {
                const response = await fetch(
                    `/api/career-paths/${currentPath.id}/progress?userId=${user.uid}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCourseProgress(data.progress || []);
                }
            } catch (err) {
                console.error('Error fetching progress:', err);
            }
        };

        fetchProgress();
    }, [currentPath, user]);

    const handleStartCourse = (course: CareerCourse) => {
        const params = new URLSearchParams({
            enroll: course.title,
            careerPathId: currentPath?.id || '',
        });
        router.push(`/dashboard/student/courses?${params.toString()}`);
    };

    const handleSelectPath = (path: CareerPath) => {
        viewPath(path);
    };

    // When viewing a path
    if (currentView === 'viewing' && currentPath) {
        return (
            <CareerPathView
                careerPath={currentPath}
                courseProgress={courseProgress}
                onStartCourse={handleStartCourse}
                onBack={reset}
            />
        );
    }

    // When generating
    if (currentView === 'generating') {
        return (
            <CareerPathGenerating
                message={progress?.message || 'Generating...'}
                percentage={progress?.percentage || 0}
                careerTitle={currentPath?.title || 'your career path'}
            />
        );
    }

    // Selector view with tabs at top
    return (
        <div className="min-h-screen">
            {error && (
                <div className="max-w-2xl mx-auto mt-4 px-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                        {error}
                    </div>
                </div>
            )}

            {/* Tabs at top */}
            <div className="max-w-5xl mx-auto px-4 pt-6">
                <div className="flex items-center gap-6 border-b border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('my-paths')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my-paths' ? 'text-[#0ea5e9]' : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        My Career Paths
                        {savedPaths.length > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/10 rounded-full">
                                {savedPaths.length}
                            </span>
                        )}
                        {activeTab === 'my-paths' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'create' ? 'text-[#0ea5e9]' : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        Create New
                        {activeTab === 'create' && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'my-paths' && (
                <div className="max-w-5xl mx-auto px-4">
                    <MyCareerPaths
                        paths={savedPaths}
                        isLoading={isLoadingPaths}
                        onSelectPath={handleSelectPath}
                    />
                </div>
            )}

            {activeTab === 'create' && (
                <CareerPathSelector
                    onSelect={generatePath}
                    isGenerating={isGenerating}
                />
            )}
        </div>
    );
}

export default function CareerPathsPage() {
    return (
        <DashboardLayout active="Career Paths">
            <CoursesProvider>
                <CareerPathProvider>
                    <CareerPathsContent />
                </CareerPathProvider>
            </CoursesProvider>
        </DashboardLayout>
    );
}
