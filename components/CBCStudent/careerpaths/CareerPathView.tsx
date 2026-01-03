"use client";

import { useState } from 'react';
import { CareerPath, CareerCourse, LearningOutcome } from '@/types/careerPath';

interface CareerPathViewProps {
    careerPath: CareerPath;
    onStartCourse?: (course: CareerCourse) => void;
    onBack?: () => void;
}

export default function CareerPathView({ careerPath, onStartCourse, onBack }: CareerPathViewProps) {
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
    const [expandedOutcomes, setExpandedOutcomes] = useState<Set<string>>(new Set());

    const toggleCourse = (courseId: string) => {
        setExpandedCourses(prev => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const toggleOutcome = (outcomeId: string) => {
        setExpandedOutcomes(prev => {
            const next = new Set(prev);
            if (next.has(outcomeId)) {
                next.delete(outcomeId);
            } else {
                next.add(outcomeId);
            }
            return next;
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-white/50 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="max-w-4xl mx-auto pt-6 px-4 pb-12">
            {/* Back button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
                >
                    <span>← Back to Career Selection</span>
                </button>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-3">{careerPath.title}</h1>
                <p className="text-white/60 mb-4">{careerPath.description}</p>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">
                        {careerPath.estimatedDuration}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm capitalize ${getDifficultyColor(careerPath.difficulty)}`}>
                        {careerPath.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">
                        {careerPath.courses.length} Courses
                    </span>
                </div>
            </div>

            {/* Course List */}
            <div className="space-y-3">
                <h2 className="text-white/40 text-sm font-medium uppercase tracking-wider mb-4">
                    Learning Path
                </h2>

                {careerPath.courses.map((course, index) => {
                    const isExpanded = expandedCourses.has(course.id);

                    return (
                        <div
                            key={course.id}
                            className="bg-[#0b0f12] border border-white/10 rounded-xl overflow-hidden"
                        >
                            {/* Course Header */}
                            <button
                                onClick={() => toggleCourse(course.id)}
                                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                            >
                                {/* Order number */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 font-bold text-sm">
                                    {index + 1}
                                </div>

                                {/* Course info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate">{course.title}</h3>
                                    <p className="text-white/40 text-sm truncate">{course.description}</p>
                                </div>

                                {/* Duration */}
                                <span className="flex-shrink-0 text-white/30 text-sm hidden sm:block">
                                    {course.duration}
                                </span>

                                {/* Expand icon */}
                                <span className={`text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                                    {/* Prerequisites */}
                                    {course.prerequisites.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Prerequisites</p>
                                            <div className="flex flex-wrap gap-2">
                                                {course.prerequisites.map((prereq, i) => (
                                                    <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60 text-xs">
                                                        {prereq}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Learning Outcomes */}
                                    <div className="mb-4">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                                            Learning Outcomes ({course.learningOutcomes.length})
                                        </p>
                                        <div className="space-y-2">
                                            {course.learningOutcomes.map((outcome) => (
                                                <OutcomeItem
                                                    key={outcome.id}
                                                    outcome={outcome}
                                                    isExpanded={expandedOutcomes.has(outcome.id)}
                                                    onToggle={() => toggleOutcome(outcome.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Start Course Button */}
                                    {onStartCourse && (
                                        <button
                                            onClick={() => onStartCourse(course)}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0ea5e9] text-white rounded-lg font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                                        >
                                            Start This Course
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface OutcomeItemProps {
    outcome: LearningOutcome;
    isExpanded: boolean;
    onToggle: () => void;
}

function OutcomeItem({ outcome, isExpanded, onToggle }: OutcomeItemProps) {
    return (
        <div className="bg-[#060809] rounded-lg border border-white/5">
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                <span className="flex-1 text-white/80 text-sm">{outcome.title}</span>
                <span className={`text-white/30 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    ▶
                </span>
            </button>

            {isExpanded && (
                <div className="px-3 pb-3 pt-0 ml-6">
                    <p className="text-white/50 text-sm mb-3">{outcome.description}</p>
                    {outcome.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {outcome.keyTopics.map((topic, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/60 text-xs"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
