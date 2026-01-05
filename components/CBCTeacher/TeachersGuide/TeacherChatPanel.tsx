'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HiOutlinePaperAirplane, HiOutlineSparkles } from 'react-icons/hi2';

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
}

export default function TeacherChatPanel({ context }: TeacherChatPanelProps) {
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
            // Build context for the AI
            const contextString = context
                ? `Context: Grade ${context.grade}, Subject: ${context.subject}, Strand: ${context.strand}`
                : '';

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    context: contextString,
                    role: 'teacher', // Indicate this is a teacher using the chat
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
            {/* Header */}
            <div className="pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <HiOutlineSparkles className="w-4 h-4 text-sky-400" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
                        Teaching Assistant
                    </h3>
                </div>
                {context?.strand && (
                    <p className="text-[10px] text-white/40 mt-1 truncate">
                        {context.grade} • {context.subject} • {context.strand}
                    </p>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                            <HiOutlineSparkles className="w-6 h-6 text-sky-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-2">
                            How can I help?
                        </h4>
                        <p className="text-xs text-white/50 mb-6 max-w-[200px]">
                            Ask me anything about teaching this content, activities, assessments, or classroom strategies.
                        </p>

                        {/* Quick Suggestions */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    className="px-3 py-1.5 text-[10px] text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:text-white"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                        ? 'bg-sky-600 text-white rounded-br-md'
                                        : 'bg-white/10 text-white/90 rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-bl-md">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none scrollbar-hide"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-sky-500 hover:bg-sky-400 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl transition-all"
                    >
                        <HiOutlinePaperAirplane className={`w-5 h-5 ${input.trim() && !isLoading ? 'text-white' : 'text-white/30'}`} />
                    </button>
                </form>
                <p className="text-[9px] text-white/30 text-center mt-2">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
