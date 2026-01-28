'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface TeacherChatPanelProps {
    context?: {
        grade?: string;
        subject?: string;
        strand?: string;
    };
    guideContent?: string;
    mobileExpanded?: boolean;
}

export default function TeacherChatPanel({ context, guideContent, mobileExpanded }: TeacherChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/teacher/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    guideContent: guideContent || '',
                    context: context || {},
                    history: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const assistantMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: data.response || "I'm here to help with your teaching. What would you like assistance with?",
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "I'm sorry, I couldn't process your request. Please try again.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const suggestions = [
        "How can I explain this concept simply?",
        "What activities can I use?",
        "Give me assessment ideas",
        "Suggest differentiation strategies",
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header - Minimalistic (Hidden on mobile expanded to avoid duplication) */}
            {!mobileExpanded && (
                <div className="pb-3 border-b border-white/10">
                    <h3 className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
                        Teaching Assistant
                    </h3>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        {/* Minimalistic idle state - matching student classroom */}
                        <p className="text-[10px] text-white/70 uppercase tracking-widest max-w-xs leading-relaxed mb-6">
                            Select a strand to get teaching assistance, or ask a general question below.
                        </p>

                        <div className="flex flex-col gap-3">
                            <div className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-bold">Quick Actions</div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(suggestion)}
                                        className="px-2 py-1 border border-white/20 rounded hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-[9px] text-white/70 uppercase tracking-wider font-medium">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] px-3 py-2 rounded-xl ${message.role === 'user'
                                    ? 'bg-sky-600 text-white rounded-br-md'
                                    : 'bg-white/10 text-white/90 rounded-bl-md'
                                    }`}
                            >
                                {message.role === 'user' ? (
                                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                ) : (
                                    <div className="prose prose-invert prose-xs max-w-none text-xs leading-relaxed [&>h3]:text-[11px] [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-2 [&>h3]:mb-1 [&>h4]:text-[10px] [&>h4]:font-semibold [&>h4]:text-white/90 [&>h4]:mt-1.5 [&>h4]:mb-0.5 [&>p]:my-1 [&>ul]:my-1 [&>ul]:pl-3 [&>ol]:my-1 [&>ol]:pl-3 [&>li]:my-0.5 [&>li]:text-white/80 [&>strong]:text-white">
                                        <ReactMarkdown>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-xl bg-white/10 rounded-bl-md">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-3 border-t border-white/10">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            rows={1}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-500/40 resize-none scrollbar-hide"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg transition-all"
                    >
                        <HiOutlinePaperAirplane className={`w-4 h-4 ${input.trim() && !isLoading ? 'text-white' : 'text-white/30'}`} />
                    </button>
                </form>
                <p className="text-[9px] text-white/30 text-center mt-2">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
