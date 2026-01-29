'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HiOutlinePaperAirplane, HiPlus, HiClock, HiChevronLeft } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/context/AuthContext';
// Native relative time formatter to avoid external dependencies
const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
};

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    userId: string;
    lastUpdated: Date;
    context?: {
        grade?: string;
        subject?: string;
        strand?: string;
    };
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
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [showHistory, setShowHistory] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize session ID on mount
    useEffect(() => {
        setSessionId(crypto.randomUUID());
    }, []);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showHistory]);

    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const fetchSessions = async () => {
        if (!user) return;
        setIsFetchingHistory(true);
        try {
            const res = await fetch(`/api/teacher/chat?userId=${user.uid}`);
            const data = await res.json();
            console.log('Fetched sessions:', data.sessions);
            if (res.ok) {
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setIsFetchingHistory(false);
        }
    };

    const loadSession = async (sid: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/teacher/chat?sessionId=${sid}`);
            const data = await res.json();
            if (res.ok) {
                setMessages(data.messages || []);
                setSessionId(sid);
                setShowHistory(false);
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setSessionId(crypto.randomUUID());
        setInput('');
        setShowHistory(false);
    };

    const toggleHistory = () => {
        if (!showHistory) {
            fetchSessions();
        }
        setShowHistory(!showHistory);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !user) return;

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
                    userId: user.uid,
                    sessionId: sessionId,
                    guideContent: guideContent || '',
                    context: context || {},
                    history: messages.slice(-10).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            const data = await response.json();
            console.log('Post chat response:', data);
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
        <div className="flex flex-col h-full bg-[#0a0a0b]">
            {/* Enhanced Header */}
            {!mobileExpanded && (
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        {showHistory && (
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-1 hover:bg-white/10 rounded-full text-white/70 transition-colors"
                            >
                                <HiChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">
                            {showHistory ? 'Chat History' : 'Teaching Assistant'}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleHistory}
                            title="Saved Chats"
                            className={`p-2 rounded-xl transition-all flex items-center gap-2 group ${showHistory ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/50 hover:text-white'}`}
                        >
                            <HiClock className="w-4.5 h-4.5" />
                        </button>
                        <button
                            onClick={handleNewChat}
                            title="New Chat"
                            className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all group flex items-center"
                        >
                            <HiPlus className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area - Toggles between Current Chat and History */}
            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 relative">
                {showHistory ? (
                    <div className="flex flex-col">
                        {isFetchingHistory ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                                <span className="text-xs text-white/40 uppercase tracking-widest">Loading history...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-20">
                                <HiClock className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-xs text-white/40 uppercase tracking-widest">No saved chats yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {sessions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => loadSession(s.id)}
                                        className="w-full text-left px-6 py-5 hover:bg-white/[0.02] transition-all group flex items-center justify-between gap-4"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-bold text-sky-400/80 uppercase tracking-wider">
                                                    {s.context?.strand ? s.context.strand.slice(0, 40) + (s.context.strand.length > 40 ? '...' : '') : 'General Chat'}
                                                </span>
                                            </div>
                                            <div className="text-[12px] text-white/50 line-clamp-1 group-hover:text-white/80 transition-colors">
                                                {s.context?.grade ? `Grade ${s.context.grade}` : 'No grade'} • {s.context?.subject || 'No subject'}
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <span className="text-[9px] text-white/20 whitespace-nowrap block">
                                                {formatRelativeTime(new Date(s.lastUpdated))}
                                            </span>
                                            <HiChevronLeft className="w-4 h-4 text-white/10 group-hover:text-white/40 rotate-180 transition-all transform translate-x-1 group-hover:translate-x-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-4 space-y-4 px-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
                                <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-medium max-w-xs leading-relaxed mb-10">
                                    Start a conversation with your teaching assistant
                                </p>

                                <div className="flex flex-col gap-6 w-full max-w-sm">
                                    <div className="flex items-center gap-3 justify-center">
                                        <div className="h-px w-8 bg-white/10" />
                                        <div className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Suggested Topics</div>
                                        <div className="h-px w-8 bg-white/10" />
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {suggestions.map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(suggestion)}
                                                className="px-4 py-2 text-[11px] text-white/50 hover:text-white hover:bg-white/5 rounded-full border border-white/5 hover:border-white/20 transition-all duration-300"
                                            >
                                                {suggestion}
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
                                        className={`max-w-[90%] px-4 py-3 rounded-2xl shadow-lg border ${message.role === 'user'
                                            ? 'bg-sky-600 border-sky-500 text-white rounded-br-none font-medium'
                                            : 'bg-white/5 border-white/10 text-white rounded-bl-none ml-1'
                                            }`}
                                    >
                                        {message.role === 'user' ? (
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        ) : (
                                            <div className="prose prose-invert prose-xs max-w-none text-[15px] leading-[1.7] 
                                                [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-sky-400 [&>h3]:mt-6 [&>h3]:mb-3
                                                [&>h4]:text-[15px] [&>h4]:font-bold [&>h4]:text-white [&>h4]:mt-4 [&>h4]:mb-2
                                                [&>p]:my-4 [&>p]:text-white/95
                                                [&>ul]:my-5 [&>ul]:pl-5 [&>ul]:list-disc [&>ul>li]:marker:text-sky-500
                                                [&>ol]:my-5 [&>ol]:pl-5 [&>ol]:list-decimal [&>ol>li]:marker:text-sky-500
                                                [&>li]:my-2.5 [&>li]:text-white/95
                                                [&>strong]:text-white [&>strong]:font-extrabold [&>strong]:bg-white/5 [&>strong]:px-1.5 [&>strong]:rounded-md [&>strong]:py-0.5 [&>strong]:inline-block [&>strong]:mb-1">
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
                                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-bl-none">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Enhanced Input Area */}
            {!showHistory && (
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                        <div className="relative flex items-end gap-3 p-2 bg-[#1a1a1c] border border-white/10 rounded-2xl focus-within:border-sky-500/40 focus-within:bg-[#111113] transition-all duration-300 shadow-2xl">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                rows={1}
                                className="flex-1 bg-transparent border-none px-3 py-2 text-[15px] text-white placeholder-white/20 focus:outline-none focus:ring-0 resize-none scrollbar-hide min-h-[44px]"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || !user}
                                className={`p-3 rounded-xl transition-all duration-500 flex items-center justify-center ${input.trim() && !isLoading && user
                                    ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-105 active:scale-95'
                                    : 'bg-white/5 text-white/10'
                                    }`}
                            >
                                <HiOutlinePaperAirplane className={`w-5 h-5 ${input.trim() && !isLoading && user ? 'rotate-0' : '-rotate-12'} transition-transform duration-500`} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
