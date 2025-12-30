"use client";

import { Resource } from '@/types/resource';

interface ResourceCardProps {
    resource: Resource;
    onClick: () => void;
}

export default function ResourceCard({ resource, onClick }: ResourceCardProps) {
    const getTypeIcon = () => {
        switch (resource.type) {
            case 'ai-article':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'video':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'tool':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'book':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                );
        }
    };

    const getTypeLabel = () => {
        switch (resource.type) {
            case 'ai-article': return 'Article';
            case 'external-article': return 'External';
            case 'video': return 'Video';
            case 'tool': return 'Tool';
            case 'book': return 'Book';
            case 'podcast': return 'Podcast';
            case 'community': return 'Community';
            default: return 'Resource';
        }
    };

    const getDifficultyColor = () => {
        switch (resource.difficulty) {
            case 'beginner': return 'text-[#10b981]';
            case 'intermediate': return 'text-[#f59e0b]';
            case 'advanced': return 'text-[#ef4444]';
            default: return 'text-white/50';
        }
    };

    return (
        <button
            onClick={onClick}
            className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/8 hover:border-white/15 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded">
                        {getTypeIcon()}
                    </span>
                    <span className="text-xs text-white/40">{getTypeLabel()}</span>
                </div>
                {resource.externalUrl && (
                    <svg className="w-4 h-4 text-white/30 group-hover:text-[#0ea5e9] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                )}
            </div>

            {/* Title */}
            <h3 className="text-base font-medium text-white mb-2 group-hover:text-[#0ea5e9] transition-colors line-clamp-2">
                {resource.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/50 mb-3 line-clamp-2">
                {resource.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                    {resource.duration && (
                        <span className="text-white/40">{resource.duration}</span>
                    )}
                    {resource.difficulty && (
                        <span className={`capitalize ${getDifficultyColor()}`}>
                            {resource.difficulty}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-white/30">
                    {resource.free && (
                        <span className="px-1.5 py-0.5 bg-[#10b981]/15 text-[#10b981] rounded text-[10px]">
                            Free
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
