"use client";

import { CustomLesson } from '@/types/customLesson';

interface CustomLessonCardProps {
    lesson: CustomLesson;
    onClick: () => void;
    onDelete: () => void;
}

export default function CustomLessonCard({ lesson, onClick, onDelete }: CustomLessonCardProps) {
    const createdDate = lesson.createdAt instanceof Date
        ? lesson.createdAt
        : new Date(lesson.createdAt);

    return (
        <div
            onClick={onClick}
            className="bg-[#0d1117] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 hover:bg-[#0d1117]/80 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate group-hover:text-cyan-400 transition-colors">
                        {lesson.title}
                    </h3>
                    <p className="text-white/50 text-sm truncate">{lesson.topic}</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete lesson"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {lesson.audienceAge.split(' ')[0]}
                </span>
                {lesson.estimatedDuration && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {lesson.estimatedDuration}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {createdDate.toLocaleDateString()}
                </span>
            </div>

            {/* Preview */}
            {lesson.content?.introduction && (
                <p className="mt-3 text-white/50 text-sm line-clamp-2">
                    {lesson.content.introduction}
                </p>
            )}
        </div>
    );
}
