"use client";

import { useState, useEffect } from 'react';
import { TopicSuggestion } from '@/types/course';

interface TopicSuggestionsProps {
    suggestions: TopicSuggestion[];
    onSelect: (topic: string) => void;
}

export default function TopicSuggestions({ suggestions, onSelect }: TopicSuggestionsProps) {
    const [stream, setStream] = useState<TopicSuggestion[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Initialize stream with first 15 items
    useEffect(() => {
        if (suggestions.length > 0) {
            setStream(suggestions.slice(0, 15));
        }
    }, [suggestions]);

    // Infinite streaming logic - swap one item every few seconds
    useEffect(() => {
        if (isPaused || suggestions.length <= 15) return;

        const interval = setInterval(() => {
            setStream(current => {
                // Pick a new topic from "suggestions" that isn't currently displayed
                const displayedIds = new Set(current.map(i => i.id));
                const candidates = suggestions.filter(t => !displayedIds.has(t.id));

                if (candidates.length === 0) return current;

                const nextTopic = candidates[Math.floor(Math.random() * candidates.length)];

                // Add to top, remove from bottom to keep list size at 15
                return [nextTopic, ...current.slice(0, 14)];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused, suggestions]);

    if (suggestions.length === 0) return null;

    return (
        <div
            className="space-y-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 px-1 sm:px-2">
                <div className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-sky-500"></span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-sky-500 uppercase tracking-wider">Trending Topics</span>
            </div>

            <div className="relative">
                <div className="flex flex-col">
                    {stream.map((item, index) => (
                        <button
                            key={`${item.id}-${index}`}
                            onClick={() => onSelect(item.topic)}
                            className="group relative flex items-center gap-3 sm:gap-6 py-3 sm:py-4 px-2 sm:px-4 border-b border-white/5 hover:bg-white/[0.02] transition-all text-left animate-in fade-in slide-in-from-top-4 duration-700"
                        >
                            {/* Trend/Arrow Indicator */}
                            <div className="text-white/20 group-hover:text-sky-400 transition-colors">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                    <span className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wide group-hover:text-sky-400/60 transition-colors">
                                        {item.category}
                                    </span>
                                    {item.trending && (
                                        <>
                                            <span className="text-[8px] sm:text-[10px] text-white/20">•</span>
                                            <span className="text-[9px] sm:text-[10px] text-amber-400/80">
                                                Trending
                                            </span>
                                        </>
                                    )}
                                </div>

                                <h3 className="text-sm sm:text-base font-medium text-white/90 group-hover:text-white transition-colors truncate">
                                    {item.displayName || item.topic}
                                </h3>
                            </div>

                            {/* Action Arrow */}
                            <div className="absolute right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
