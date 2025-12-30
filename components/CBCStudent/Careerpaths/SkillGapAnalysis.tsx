"use client";

import { useCareer } from '@/lib/context/CareerContext';

export default function SkillGapAnalysis() {
    const {
        activeCareer,
        skillStates,
        setCurrentView,
        generateLearningPlan,
        isGeneratingPlan,
    } = useCareer();

    if (!activeCareer) {
        return (
            <div className="max-w-xl mx-auto pt-24 text-center">
                <p className="text-white/50">No career selected</p>
                <button
                    onClick={() => setCurrentView('entry')}
                    className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Flatten all skills from categories
    const allSkills = activeCareer.skillCategories?.flatMap(cat => cat.skills) || [];

    // Get skill proficiency levels
    const getSkillData = () => {
        return allSkills.map(skill => {
            const state = skillStates[skill.id];
            return {
                id: skill.id,
                name: skill.name,
                importance: skill.importance,
                proficiency: state?.proficiency || 0,
            };
        });
    };

    const skills = getSkillData();
    const avgProficiency = skills.length > 0
        ? Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length)
        : 0;

    // Estimate time to goal
    const estimateTimeToGoal = () => {
        const lowSkills = skills.filter(s => s.proficiency < 50);
        if (lowSkills.length === 0) return '2-4 months';
        if (lowSkills.length <= 3) return '4-6 months';
        if (lowSkills.length <= 6) return '6-9 months';
        return '9-12 months';
    };

    const getProficiencyColor = (value: number) => {
        if (value >= 70) return '#10b981';
        if (value >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getProficiencyLabel = (value: number) => {
        if (value >= 70) return 'Strong';
        if (value >= 40) return 'Moderate';
        if (value > 0) return 'Needs Work';
        return 'New';
    };

    const handleGeneratePlan = async () => {
        await generateLearningPlan();
    };

    return (
        <div className="max-w-2xl mx-auto pt-12 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
                    <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Your Skill Gap Analysis</h1>
                <p className="text-white/50">
                    For <span className="text-[#0ea5e9]">{activeCareer.title}</span>
                </p>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between py-4 px-5 mb-6 bg-white/5 rounded-xl border border-white/10">
                <div>
                    <p className="text-sm text-white/50 mb-1">Overall Readiness</p>
                    <p className="text-2xl font-bold text-white">{avgProficiency}%</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-white/50 mb-1">Estimated Time</p>
                    <p className="text-lg font-semibold text-[#0ea5e9]">{estimateTimeToGoal()}</p>
                </div>
            </div>

            {/* Skills List */}
            <div className="space-y-4 mb-8">
                {skills.map(skill => (
                    <div key={skill.id} className="py-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-white text-sm">{skill.name}</span>
                                {skill.importance === 'essential' && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-[#0ea5e9]/15 text-[#0ea5e9] rounded">
                                        Essential
                                    </span>
                                )}
                            </div>
                            <span
                                className="text-xs font-medium"
                                style={{ color: getProficiencyColor(skill.proficiency) }}
                            >
                                {skill.proficiency}% - {getProficiencyLabel(skill.proficiency)}
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${skill.proficiency}%`,
                                    backgroundColor: getProficiencyColor(skill.proficiency),
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    className="w-full py-3 bg-[#0ea5e9] text-white rounded-xl font-medium hover:bg-[#0ea5e9]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingPlan ? 'Generating Plan...' : 'Generate My Learning Plan'}
                </button>
                <button
                    onClick={() => setCurrentView('career-view')}
                    className="w-full py-3 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                    View Full Career Details
                </button>
            </div>
        </div>
    );
}
