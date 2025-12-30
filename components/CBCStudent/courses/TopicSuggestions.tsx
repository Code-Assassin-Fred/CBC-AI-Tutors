"use client";

import { TopicSuggestion } from '@/types/course';

interface TopicSuggestionsProps {
    suggestions: TopicSuggestion[];
    onSelect: (topic: string) => void;
}

// Category to gradient mapping
const categoryStyles: Record<string, { gradient: string; icon: string }> = {
    Technology: {
        gradient: 'from-blue-500/20 to-cyan-500/20',
        icon: '💻'
    },
    Programming: {
        gradient: 'from-green-500/20 to-emerald-500/20',
        icon: '🖥️'
    },
    Science: {
        gradient: 'from-sky-500/20 to-cyan-500/20',
        icon: '🔬'
    },
    Finance: {
        gradient: 'from-yellow-500/20 to-amber-500/20',
        icon: '💰'
    },
    Games: {
        gradient: 'from-red-500/20 to-orange-500/20',
        icon: '♟️'
    },
    Skills: {
        gradient: 'from-pink-500/20 to-rose-500/20',
        icon: '🎯'
    },
    Creative: {
        gradient: 'from-fuchsia-500/20 to-pink-500/20',
        icon: '🎨'
    },
    Health: {
        gradient: 'from-teal-500/20 to-green-500/20',
        icon: '🧘'
    },
    History: {
        gradient: 'from-amber-500/20 to-yellow-500/20',
        icon: '📜'
    },
    Music: {
        gradient: 'from-indigo-500/20 to-blue-500/20',
        icon: '🎵'
    },
    Humanities: {
        gradient: 'from-slate-500/20 to-gray-500/20',
        icon: '📚'
    },
    Business: {
        gradient: 'from-orange-500/20 to-red-500/20',
        icon: '📈'
    },
    Lifestyle: {
        gradient: 'from-lime-500/20 to-green-500/20',
        icon: '🍳'
    },
};

export default function TopicSuggestions({ suggestions, onSelect }: TopicSuggestionsProps) {
    if (suggestions.length === 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Trending Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-medium text-white/70">Trending Topics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {suggestions.map((suggestion) => {
                        const style = categoryStyles[suggestion.category] || categoryStyles.Technology;

                        return (
                            <button
                                key={suggestion.id}
                                onClick={() => onSelect(suggestion.topic)}
                                className={`group relative p-4 rounded-xl bg-gradient-to-br ${style.gradient} border border-white/5 hover:border-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-left`}
                            >
                                {/* Trending badge */}
                                {suggestion.trending && (
                                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-medium">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </span>
                                )}

                                {/* Category icon */}
                                <div className="text-2xl mb-3">
                                    {suggestion.icon || style.icon}
                                </div>

                                {/* Title */}
                                <h3 className="font-medium text-white text-sm leading-tight mb-1 group-hover:text-sky-300 transition-colors">
                                    {suggestion.displayName}
                                </h3>

                                {/* Category */}
                                <p className="text-white/40 text-xs">
                                    {suggestion.category}
                                </p>

                                {/* Arrow on hover */}
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Categories quick filter */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                {Object.entries(categoryStyles).slice(0, 8).map(([category, style]) => (
                    <button
                        key={category}
                        onClick={() => onSelect(category.toLowerCase())}
                        className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-xs hover:bg-white/10 hover:text-white/80 transition-colors"
                    >
                        {style.icon} {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
