"use client";

import { useState, useRef, useEffect } from 'react';
import { useCareer } from '@/lib/context/CareerContext';

export default function CareerDiscoveryChat() {
    const {
        discoveryMessages,
        isDiscovering,
        sendDiscoveryMessage,
        careerSuggestions,
        selectSuggestion,
        setCurrentView,
    } = useCareer();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial message if empty
    useEffect(() => {
        if (discoveryMessages.length === 0) {
            // Auto-send initial greeting
            sendDiscoveryMessage('Hi! I want to find a career that fits me.');
        }
    }, [discoveryMessages.length, sendDiscoveryMessage]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [discoveryMessages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isDiscovering) return;

        sendDiscoveryMessage(input.trim());
        setInput('');
    };

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 py-4 border-b border-white/10">
                <button
                    onClick={() => setCurrentView('entry')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-lg font-medium text-white">Career Discovery</h2>
                    <p className="text-sm text-white/50">Tell me about your interests and strengths</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {discoveryMessages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-[#0ea5e9] text-white'
                                    : 'bg-white/5 text-white/90'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{message.content}</p>

                            {/* Suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs text-white/60 mb-2">Suggested careers:</p>
                                    {message.suggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectSuggestion(suggestion)}
                                            className="w-full text-left p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-white">
                                                    {suggestion.careerTitle}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-[#10b981]/20 text-[#10b981] rounded-full">
                                                    {suggestion.matchScore}% match
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/60">
                                                {suggestion.matchReason}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isDiscovering && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 px-4 py-3 rounded-2xl">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="py-4 border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Share your interests, skills, or ask questions..."
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                        disabled={isDiscovering}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isDiscovering}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#0ea5e9] disabled:text-white/20"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* Quick Suggestions */}
            {careerSuggestions.length > 0 && (
                <div className="pb-4">
                    <p className="text-xs text-white/40 mb-2">Quick pick a suggestion:</p>
                    <div className="flex flex-wrap gap-2">
                        {careerSuggestions.slice(0, 3).map((s, i) => (
                            <button
                                key={i}
                                onClick={() => selectSuggestion(s)}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm hover:bg-[#0ea5e9]/10 hover:border-[#0ea5e9]/30 transition-colors"
                            >
                                {s.careerTitle}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
