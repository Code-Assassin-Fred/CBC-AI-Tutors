'use client';

import React from 'react';
import { Assessment, DIFFICULTY_LABELS } from '@/types/assessment';

interface AssessmentCardProps {
    assessment: Assessment;
    onClick: () => void;
    onDelete: () => void;
}

export default function AssessmentCard({ assessment, onClick, onDelete }: AssessmentCardProps) {
    const questionCount = assessment.questions?.length || 0;
    const multipleChoiceCount = assessment.questions?.filter(q => q.type === 'multiple-choice').length || 0;
    const openEndedCount = assessment.questions?.filter(q => q.type === 'open-ended' || q.type === 'short-answer').length || 0;

    const createdDate = assessment.createdAt instanceof Date
        ? assessment.createdAt
        : new Date(assessment.createdAt);

    return (
        <div
            className="group relative bg-gradient-to-br from-[#0d1117] to-[#0c1015] border border-white/10 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
            onClick={onClick}
        >
            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2 pr-8 line-clamp-2">
                {assessment.title}
            </h3>

            {/* Description */}
            {assessment.description && (
                <p className="text-white/50 text-sm mb-4 line-clamp-2">
                    {assessment.description}
                </p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {questionCount} Questions
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {assessment.estimatedTimeMinutes} min
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {assessment.totalPoints} Points
                </div>
            </div>

            {/* Question Types */}
            <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                {multipleChoiceCount > 0 && (
                    <span>{multipleChoiceCount} MCQ</span>
                )}
                {multipleChoiceCount > 0 && openEndedCount > 0 && (
                    <span>•</span>
                )}
                {openEndedCount > 0 && (
                    <span>{openEndedCount} Written</span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${assessment.config?.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                        assessment.config?.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' :
                            assessment.config?.difficulty === 'mixed' ? 'bg-purple-500/10 text-purple-400' :
                                'bg-yellow-500/10 text-yellow-400'
                    }`}>
                    {assessment.config?.difficulty ? DIFFICULTY_LABELS[assessment.config.difficulty] : 'Medium'}
                </span>
                <span className="text-xs text-white/30">
                    {createdDate.toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
