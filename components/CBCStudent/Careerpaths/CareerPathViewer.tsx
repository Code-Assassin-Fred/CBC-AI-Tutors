"use client";

import { useCareer } from '@/lib/context/CareerContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CareerPathViewer() {
    const router = useRouter();
    const { activeCareer, setCurrentView, addToComparison, careerCourses, fetchCareerCourses, saveCareerPath } = useCareer();

    // Fetch courses when component mounts
    useEffect(() => {
        if (activeCareer?.id) {
            fetchCareerCourses(activeCareer.id);
        }
    }, [activeCareer?.id, fetchCareerCourses]);

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

    const getDemandColor = (demand: string) => {
        switch (demand) {
            case 'very-high': return '#10b981';
            case 'high': return '#22c55e';
            case 'medium': return '#f59e0b';
            default: return '#ef4444';
        }
    };

    const getAutomationRiskColor = (risk: string) => {
        switch (risk) {
            case 'very-low': return '#10b981';
            case 'low': return '#22c55e';
            case 'medium': return '#f59e0b';
            default: return '#ef4444';
        }
    };

    return (
        <div className="max-w-4xl mx-auto pt-8 px-4 pb-16">
            {/* Back button */}
            <button
                onClick={() => setCurrentView('gap-analysis')}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Analysis
            </button>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{activeCareer.title}</h1>
                <p className="text-white/60 text-base">{activeCareer.description}</p>
            </div>

            {/* Market Intelligence */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Market Intelligence
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 mb-1">Demand</p>
                        <p className="text-lg font-semibold capitalize" style={{ color: getDemandColor(activeCareer.market?.demand || 'medium') }}>
                            {activeCareer.market?.demand?.replace('-', ' ')}
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 mb-1">Trend</p>
                        <p className="text-lg font-semibold text-white capitalize">
                            {activeCareer.market?.demandTrend}
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 mb-1">Median Salary</p>
                        <p className="text-lg font-semibold text-[#10b981]">
                            ${activeCareer.market?.salaryRange?.median?.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 mb-1">Time to Entry</p>
                        <p className="text-lg font-semibold text-white">
                            {activeCareer.entry?.timeToEntry}
                        </p>
                    </div>
                </div>

                {activeCareer.market?.growthOutlook && (
                    <p className="mt-4 text-sm text-white/60">{activeCareer.market.growthOutlook}</p>
                )}
            </section>

            {/* Skill Categories */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Required Skills ({activeCareer.totalSkillCount})
                </h2>

                <div className="space-y-6">
                    {activeCareer.skillCategories?.map((category, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-white">{category.name}</h3>
                                <span className="text-xs text-white/40">{category.weight}% weight</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {category.skills.map((skill, sIdx) => (
                                    <span
                                        key={sIdx}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${skill.importance === 'essential'
                                            ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20'
                                            : skill.importance === 'important'
                                                ? 'bg-white/5 text-white/80 border border-white/10'
                                                : 'bg-white/5 text-white/50 border border-white/5'
                                            }`}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI Impact */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    AI Impact Analysis
                </h2>

                <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div>
                            <p className="text-xs text-white/40 mb-1">Automation Risk</p>
                            <p
                                className="text-lg font-semibold capitalize"
                                style={{ color: getAutomationRiskColor(activeCareer.aiImpact?.automationRisk || 'medium') }}
                            >
                                {activeCareer.aiImpact?.automationRisk?.replace('-', ' ')}
                            </p>
                        </div>
                    </div>

                    {activeCareer.aiImpact?.riskExplanation && (
                        <p className="text-sm text-white/60 mb-4">{activeCareer.aiImpact.riskExplanation}</p>
                    )}

                    {activeCareer.aiImpact?.futureProofSkills && activeCareer.aiImpact.futureProofSkills.length > 0 && (
                        <div>
                            <p className="text-xs text-white/40 mb-2">Future-Proof Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {activeCareer.aiImpact.futureProofSkills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] rounded text-xs"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Entry Requirements */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Entry Requirements
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 mb-2">Difficulty</p>
                        <p className="text-white capitalize">{activeCareer.entry?.difficulty?.replace('-', ' ')}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-white/40 mb-2">Typical Background</p>
                        <p className="text-white">{activeCareer.entry?.typicalBackground?.join(', ')}</p>
                    </div>
                </div>

                {activeCareer.entry?.certifications && activeCareer.entry.certifications.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs text-white/40 mb-2">Useful Certifications</p>
                        <div className="flex flex-wrap gap-2">
                            {activeCareer.entry.certifications.map((cert, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70"
                                >
                                    {cert.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Curated Courses */}
            {careerCourses.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        AI-Curated Courses ({careerCourses.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {careerCourses.map((course) => (
                            <button
                                key={course.id}
                                onClick={() => {
                                    // Navigate to courses page with enrollment intent
                                    const params = new URLSearchParams();
                                    params.set('enroll', course.title);
                                    params.set('description', course.description);
                                    if (course.syllabus) {
                                        params.set('syllabus', JSON.stringify(course.syllabus));
                                    }
                                    router.push(`/dashboard/student/courses?${params.toString()}`);
                                }}
                                className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-left group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#6366f1] flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate group-hover:text-[#0ea5e9] transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-white/50 line-clamp-1">{course.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                                        <span>{course.lessonCount} topics</span>
                                        <span>•</span>
                                        <span>{course.estimatedTime}</span>
                                        <span>•</span>
                                        <span className="capitalize">{course.difficulty}</span>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-white/30 group-hover:text-[#0ea5e9] transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    {careerCourses.length > 6 && (
                        <p className="text-center text-sm text-white/40 mt-4">
                            +{careerCourses.length - 6} more courses available
                        </p>
                    )}
                </section>
            )}

            {/* Related Careers */}
            {activeCareer.relatedCareers && activeCareer.relatedCareers.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-white mb-4">Related Careers</h2>
                    <div className="flex flex-wrap gap-2">
                        {activeCareer.relatedCareers.map((career, idx) => (
                            <button
                                key={idx}
                                onClick={() => addToComparison(activeCareer)}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm hover:bg-white/10 transition-colors"
                            >
                                {career}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => setCurrentView('learning-plan')}
                    className="flex-1 py-3 bg-[#0ea5e9] text-white rounded-xl font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                >
                    View Learning Plan
                </button>
                <button
                    onClick={() => setCurrentView('entry')}
                    className="px-6 py-3 bg-white/5 text-white/70 rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                    Explore Other Careers
                </button>
            </div>
        </div>
    );
}
