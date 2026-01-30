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
            onClick={onClick}
            className="bg-[#0d1117] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 hover:bg-[#0d1117]/80 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                        {assessment.title}
                    </h3>
                    <p className="text-white/50 text-sm truncate">{assessment.description || 'No description available'}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete assessment"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-widest font-bold text-white/40 mb-3">
                <span>{questionCount} Questions</span>
                <span>•</span>
                <span>{assessment.totalPoints} pts</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                        {assessment.config?.difficulty ? DIFFICULTY_LABELS[assessment.config.difficulty] : 'Medium'}
                    </span>
                </div>
                <span className="text-[10px] text-white/20 font-medium">
                    {createdDate.toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
