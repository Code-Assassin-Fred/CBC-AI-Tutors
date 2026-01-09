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
            <div className="max-w-5xl mx-auto px-4 pt-4 sm:pt-10">
                <div className="flex items-center gap-4 sm:gap-8 border-b border-white/5 mb-6 sm:mb-10 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => setActiveTab('my-paths')}
                        className={`pb-4 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 'my-paths' ? 'text-[#0ea5e9]' : 'text-white/40 hover:text-white/70'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            My Career Paths
                            {savedPaths.length > 0 && (
                                <span className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${activeTab === 'my-paths' ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]' : 'bg-white/5 text-white/30'}`}>
                                    {savedPaths.length}
                                </span>
                            )}
                        </span>
                        {activeTab === 'my-paths' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-full shadow-[0_-2px_6px_rgba(14,165,233,0.4)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`pb-4 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 'create' ? 'text-[#0ea5e9]' : 'text-white/40 hover:text-white/70'
                            }`}
                    >
                        Create New
                        {activeTab === 'create' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-full shadow-[0_-2px_6px_rgba(14,165,233,0.4)]" />
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
