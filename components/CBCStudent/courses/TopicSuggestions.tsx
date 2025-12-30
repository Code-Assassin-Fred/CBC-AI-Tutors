"use client";

import { useState, useEffect, useRef } from 'react';
import { TopicSuggestion } from '@/types/course';
import { useRouter } from 'next/navigation';

interface TopicSuggestionsProps {
    suggestions: TopicSuggestion[];
    onSelect: (topic: string) => void;
}

// "Infinite" source of topics to simulate AI/Student activity
const STREAMING_TOPICS = [
    { topic: "Quantum Computing", category: "Science", icon: "⚛️", activity: "Alex just started" },
    { topic: "Renaissance Art", category: "History", icon: "🎨", activity: "Sarah is learning" },
    { topic: "Sustainable Gardening", category: "Lifestyle", icon: "🌱", activity: "Mike completed lesson 1" },
    { topic: "Machine Learning Basics", category: "Technology", icon: "🤖", activity: "Trending now" },
    { topic: "Ancient Rome", category: "History", icon: "🏛️", activity: "New course generated" },
    { topic: "Digital Photography", category: "Creative", icon: "📷", activity: "Popular today" },
    { topic: "Personal Finance", category: "Finance", icon: "💰", activity: "Julia just started" },
    { topic: "Vegan Cooking", category: "Lifestyle", icon: "🥗", activity: "David is learning" },
    { topic: "Astrophysics 101", category: "Science", icon: "🌌", activity: "Trending in Science" },
    { topic: "Game Design", category: "Technology", icon: "🎮", activity: "High rating" },
    { topic: "Creative Writing", category: "Arts", icon: "✍️", activity: "Emily just started" },
    { topic: "Psychology of Habits", category: "Psychology", icon: "🧠", activity: "Recommended for you" },
    { topic: "Blockchain Fundamentals", category: "Technology", icon: "⛓️", activity: "New topic" },
    { topic: "Yoga for Beginners", category: "Health", icon: "🧘", activity: "Trending now" },
    { topic: "Modern Architecture", category: "Design", icon: "🏢", activity: "Tom is watching" },
    { topic: "Music Theory", category: "Music", icon: "🎼", activity: "Anna is learning" },
];

export default function TopicSuggestions({ suggestions, onSelect }: TopicSuggestionsProps) {
    const [stream, setStream] = useState<typeof STREAMING_TOPICS>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Initialize stream with some items
    useEffect(() => {
        setStream(STREAMING_TOPICS.slice(0, 5));
    }, []);

    // Infinite streaming logic
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setStream(current => {
                // Get a random new topic that isn't currently displayed
                const displayedTopics = new Set(current.map(i => i.topic));
                const candidates = STREAMING_TOPICS.filter(t => !displayedTopics.has(t.topic));

                if (candidates.length === 0) return current; // Should typically allow repeats eventually in a real infinite stream

                const nextTopic = candidates[Math.floor(Math.random() * candidates.length)];

                // Add to top, remove from bottom to keep list size stable
                return [nextTopic, ...current.slice(0, 4)];
            });
        }, 3500); // New topic every 3.5 seconds

        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <div
            className="space-y-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex items-center gap-2 mb-6 px-2">
                <div className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-mono text-emerald-500 uppercase tracking-wider">Live Activity Stream</span>
            </div>

            <div className="relative">
                {/* Fade overlay at bottom to suggest continuity */}
                {/* <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0b0f12] to-transparent z-10 pointer-events-none" /> */}

                <div className="flex flex-col">
                    {stream.map((item, index) => (
                        <button
                            key={`${item.topic}-${index}`} // Composite key for distinct renders
                            onClick={() => onSelect(item.topic)}
                            className="group relative flex items-center gap-6 py-5 px-4 border-b border-white/5 hover:bg-white/[0.02] transition-all text-left animate-in fade-in slide-in-from-top-4 duration-700"
                        >
                            {/* Trend/Arrow Indicator - Subtle on the left */}
                            <div className="text-white/20 group-hover:text-sky-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-white/40 uppercase tracking-wide group-hover:text-sky-400/60 transition-colors">
                                        {item.activity}
                                    </span>
                                    <span className="text-[10px] text-white/20">•</span>
                                    <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                                        {item.category}
                                    </span>
                                </div>

                                <h3 className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                                    {item.topic}
                                </h3>
                            </div>

                            {/* Icon/Thumbnail - Minimal, right aligned */}
                            <div className="text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 grayscale group-hover:grayscale-0">
                                {item.icon}
                            </div>

                            {/* Action Arrow - Slides in from right on hover */}
                            <div className="absolute right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
