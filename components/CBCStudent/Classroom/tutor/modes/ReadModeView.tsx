"use client";

import React, { useState } from 'react';
import { ReadModeContent, ChatMessage } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';

interface ReadModeViewProps {
    content: ReadModeContent;
}

export default function ReadModeView({ content }: ReadModeViewProps) {
    const { chatMessages, sendChatMessage, context } = useTutor();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        await sendChatMessage(inputValue);
        setInputValue('');
        setIsSending(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                {/* Introduction */}
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">📖 Introduction</h4>
                    <p className="text-sm text-white/80 leading-relaxed">{content.introduction}</p>
                </div>

                {/* Sections */}
                {content.sections.map((section, index) => (
                    <div
                        key={section.id}
                        className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                    >
                        {/* Section Header */}
                        <button
                            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <span className="text-sm font-medium text-white flex items-center gap-2">
                                <span className="text-white/40">{index + 1}.</span>
                                {section.title}
                            </span>
                            <span className={`text-white/40 transition-transform ${activeSection === section.id ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {/* Section Content */}
                        {(activeSection === section.id || index === 0) && (
                            <div className="px-4 pb-4 space-y-3">
                                <p className="text-sm text-white/70 leading-relaxed">{section.content}</p>

                                {/* Key Points */}
                                {section.keyPoints.length > 0 && (
                                    <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                                        <h5 className="text-xs font-semibold text-emerald-400 mb-2">Key Points</h5>
                                        <ul className="space-y-1">
                                            {section.keyPoints.map((point, i) => (
                                                <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                                    <span className="text-emerald-400 mt-0.5">•</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Examples */}
                                {section.examples.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="text-xs font-semibold text-amber-400">Examples</h5>
                                        {section.examples.map((example, i) => (
                                            <div key={i} className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                                                <p className="text-xs font-medium text-white/80">{example.title}</p>
                                                <p className="text-xs text-white/60 mt-1">{example.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Summary */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">📝 Summary</h4>
                    <p className="text-sm text-white/80 leading-relaxed">{content.summary}</p>
                </div>

                {/* Review Questions */}
                {content.reviewQuestions.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h4 className="text-sm font-semibold text-cyan-400 mb-3">🤔 Think About It</h4>
                        <ul className="space-y-2">
                            {content.reviewQuestions.map((q, i) => (
                                <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                    <span className="text-cyan-400 font-medium">{i + 1}.</span>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Chat History */}
                {chatMessages.length > 0 && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-xs font-semibold text-white/40">Chat with your tutor</h4>
                        {chatMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-3 rounded-lg text-sm ${msg.role === 'user'
                                        ? 'bg-blue-500/20 text-white/90 ml-8'
                                        : 'bg-white/5 text-white/80 mr-8'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about this lesson..."
                        className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        disabled={isSending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isSending}
                        className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl transition-colors"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
