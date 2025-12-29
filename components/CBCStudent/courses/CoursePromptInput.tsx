"use client";

import { useState } from 'react';

interface CoursePromptInputProps {
    onSubmit: (topic: string) => void;
    placeholder?: string;
}

export default function CoursePromptInput({
    onSubmit,
    placeholder = "Teach me about..."
}: CoursePromptInputProps) {
    const [topic, setTopic] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onSubmit(topic.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-center">
                {/* Input Field */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full px-6 py-4 rounded-full bg-[#0b0f12] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-base"
                    />
                </div>

                {/* Buttons */}
                <div className="absolute right-2 flex items-center gap-2">
                    {/* Attachment button (placeholder for future) */}
                    <button
                        type="button"
                        className="p-2 text-white/30 hover:text-white/60 transition-colors"
                        title="Add context (coming soon)"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={!topic.trim()}
                        className={`p-3 rounded-full transition-all ${topic.trim()
                                ? 'bg-white text-black hover:bg-white/90 active:scale-95'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tip text */}
            <p className="text-center text-white/30 text-xs mt-3">
                Tip: Add context about your goals or existing knowledge
            </p>
        </form>
    );
}
