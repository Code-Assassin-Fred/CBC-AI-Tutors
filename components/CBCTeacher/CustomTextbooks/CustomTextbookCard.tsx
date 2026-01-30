"use client";

import { CustomTextbook } from '@/types/customTextbook';

interface CustomTextbookCardProps {
    textbook: CustomTextbook;
    onClick: () => void;
    onDelete: () => void;
}

export default function CustomTextbookCard({ textbook, onClick, onDelete }: CustomTextbookCardProps) {
    const createdDate = textbook.createdAt instanceof Date
        ? textbook.createdAt
        : new Date(textbook.createdAt);

    const chapterCount = textbook.content?.chapters?.length || 0;

    return (
        <div
            onClick={onClick}
            className="bg-[#0d1117] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 hover:bg-[#0d1117]/80 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                        {textbook.title}
                    </h3>
                    <p className="text-white/50 text-sm truncate">{textbook.topic}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete textbook"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-white/40">

                <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {chapterCount} chapter{chapterCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {createdDate.toLocaleDateString()}
                </span>
            </div>

            {/* Preview */}
            {textbook.content?.introduction && (
                <p className="mt-3 text-white/50 text-sm line-clamp-2">
                    {textbook.content.introduction}
                </p>
            )}
        </div>
    );
}
