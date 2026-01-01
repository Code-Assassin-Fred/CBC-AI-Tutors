"use client";

import { useRouter } from 'next/navigation';
import { useCareer } from '@/lib/context/CareerContext';
import { useEffect } from 'react';

export default function LearningPlanView() {
    const router = useRouter();
    const { activeCareer, learningPlan, setCurrentView, isGeneratingPlan, careerCourses, fetchCareerCourses } = useCareer();

    // Fetch courses when component mounts
    useEffect(() => {
        if (activeCareer?.id) {
            fetchCareerCourses(activeCareer.id);
        }
    }, [activeCareer?.id, fetchCareerCourses]);

    if (isGeneratingPlan) {
        return (
            <div className="max-w-xl mx-auto pt-24 text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                <p className="text-white">Generating your personalized learning plan...</p>
            </div>
        );
    }

    // Mock learning plan if not generated yet
    const plan = learningPlan || {
        careerTitle: activeCareer?.title || '',
        estimatedCompletion: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        overallProgress: 0,
        phases: [
            {
                order: 1,
                title: 'Foundations',
                description: 'Build core knowledge and fundamental skills',
                estimatedDuration: '4-6 weeks',
                status: 'active' as const,
                progress: 0,
                targetSkills: [],
                recommendedCourses: [],
                courseIds: [],
                milestones: [
                    { id: '1', title: 'Complete introductory course', type: 'course' as const, requirement: 'Finish basics', completed: false },
                    { id: '2', title: 'Pass fundamentals quiz', type: 'quiz' as const, requirement: 'Score 70%+', completed: false },
                ],
            },
            {
                order: 2,
                title: 'Core Skills',
                description: 'Develop the essential skills for this career',
                estimatedDuration: '8-10 weeks',
                status: 'locked' as const,
                progress: 0,
                targetSkills: [],
                recommendedCourses: [],
                courseIds: [],
                milestones: [
                    { id: '3', title: 'Build first project', type: 'project' as const, requirement: 'Complete project', completed: false },
                    { id: '4', title: 'Reach intermediate proficiency', type: 'skill-level' as const, requirement: 'All core skills 50%+', completed: false },
                ],
            },
            {
                order: 3,
                title: 'Advanced Topics',
                description: 'Master advanced concepts and specializations',
                estimatedDuration: '6-8 weeks',
                status: 'locked' as const,
                progress: 0,
                targetSkills: [],
                recommendedCourses: [],
                courseIds: [],
                milestones: [
                    { id: '5', title: 'Complete advanced course', type: 'course' as const, requirement: 'Finish advanced material', completed: false },
                ],
            },
            {
                order: 4,
                title: 'Job Ready',
                description: 'Prepare for interviews and real-world work',
                estimatedDuration: '4 weeks',
                status: 'locked' as const,
                progress: 0,
                targetSkills: [],
                recommendedCourses: [],
                courseIds: [],
                milestones: [
                    { id: '6', title: 'Build portfolio project', type: 'project' as const, requirement: 'Showcase-ready project', completed: false },
                    { id: '7', title: 'Pass final assessment', type: 'quiz' as const, requirement: 'Score 80%+', completed: false },
                ],
            },
        ],
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getPhaseStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-[#10b981] text-white';
            case 'active':
                return 'bg-[#0ea5e9] text-white';
            default:
                return 'bg-white/10 text-white/40';
        }
    };

    // Get courses for a specific phase
    const getCoursesForPhase = (phaseOrder: number) => {
        return careerCourses.filter(course => course.phaseOrder === phaseOrder);
    };

    return (
        <div className="max-w-3xl mx-auto pt-8 px-4 pb-16">
            {/* Back button */}
            <button
                onClick={() => setCurrentView('gap-analysis')}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </button>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Your Learning Plan</h1>
                <p className="text-white/50">
                    Path to becoming a <span className="text-[#0ea5e9]">{plan.careerTitle || activeCareer?.title}</span>
                </p>
            </div>

            {/* Progress Overview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-white/40 mb-1">Overall Progress</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">{plan.overallProgress}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-white/40 mb-1">Target Completion</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">{formatDate(plan.estimatedCompletion)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phases Timeline */}
            <div className="space-y-6">
                {plan.phases.map((phase, idx) => {
                    const phaseCourses = getCoursesForPhase(phase.order);

                    return (
                        <div
                            key={idx}
                            className={`relative pl-8 pb-6 ${idx < plan.phases.length - 1 ? 'border-l border-white/10' : ''}`}
                            style={{ marginLeft: '1rem' }}
                        >
                            {/* Phase indicator */}
                            <div
                                className={`absolute left-0 top-0 w-8 h-8 -translate-x-1/2 rounded-full flex items-center justify-center ${getPhaseStatusStyles(phase.status)}`}
                            >
                                {phase.status === 'completed' ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-sm font-medium">{phase.order}</span>
                                )}
                            </div>

                            {/* Phase content */}
                            <div className={`${phase.status === 'locked' ? 'opacity-50' : ''}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg font-medium text-white">{phase.title}</h3>
                                        <p className="text-sm text-white/50">{phase.description}</p>
                                    </div>
                                    <span className="text-xs text-white/40 whitespace-nowrap ml-4">
                                        {phase.estimatedDuration}
                                    </span>
                                </div>

                                {/* Milestones */}
                                {phase.milestones.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {phase.milestones.map((milestone) => (
                                            <div
                                                key={milestone.id}
                                                className="flex items-center gap-3 text-sm"
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center ${milestone.completed
                                                    ? 'bg-[#10b981] text-white'
                                                    : 'bg-white/10 text-white/30'
                                                    }`}>
                                                    {milestone.completed ? (
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className="w-2 h-2 bg-white/30 rounded-full" />
                                                    )}
                                                </div>
                                                <span className={milestone.completed ? 'text-white/50 line-through' : 'text-white/80'}>
                                                    {milestone.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Courses for this phase */}
                                {phaseCourses.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-white/40 mb-2">Curated Courses</p>
                                        <div className="space-y-2">
                                            {phaseCourses.map((course) => (
                                                <button
                                                    key={course.id}
                                                    onClick={() => router.push(`/dashboard/student/courses/${course.id}?type=career`)}
                                                    disabled={phase.status === 'locked'}
                                                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{course.title}</p>
                                                        <p className="text-xs text-white/50">{course.lessonCount} lessons · {course.estimatedTime}</p>
                                                    </div>
                                                    <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Phase progress */}
                                {phase.status === 'active' && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                                            <span>Phase progress</span>
                                            <span>{phase.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#0ea5e9] rounded-full"
                                                style={{ width: `${phase.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                    onClick={() => setCurrentView('career-view')}
                    className="flex-1 py-3 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                    View Career Details
                </button>
                <button
                    onClick={() => router.push('/dashboard/student/courses')}
                    className="flex-1 py-3 bg-[#0ea5e9] text-white rounded-xl font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                >
                    Start Learning
                </button>
            </div>
        </div>
    );
}
