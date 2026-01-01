"use client";

import { useRouter } from 'next/navigation';
import { useCareer } from '@/lib/context/CareerContext';

export default function LearningPlanView() {
    const router = useRouter();
    const { activeCareer, learningPlan, setCurrentView, isGeneratingPlan } = useCareer();

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

    return (
        <div className="max-w-3xl mx-auto pt-8 px-4 pb-16">
            {/* Back button */}
            <button
                onClick={() => setCurrentView('gap-analysis')}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Your Learning Plan</h1>
                <p className="text-white/50">
                    Path to becoming a <span className="text-[#0ea5e9]">{plan.careerTitle || activeCareer?.title}</span>
                </p>
            </div>

            {/* Progress Overview */}
            <div className="p-5 mb-8 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-white/40 mb-1">Overall Progress</p>
                        <p className="text-2xl font-bold text-white">{plan.overallProgress}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/40 mb-1">Target Completion</p>
                        <p className="text-lg font-semibold text-[#0ea5e9]">
                            {formatDate(plan.estimatedCompletion)}
                        </p>
                    </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#10b981] rounded-full transition-all"
                        style={{ width: `${plan.overallProgress}%` }}
                    />
                </div>
            </div>

            {/* Phases Timeline */}
            <div className="space-y-6">
                {plan.phases.map((phase, idx) => (
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
                ))}
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
