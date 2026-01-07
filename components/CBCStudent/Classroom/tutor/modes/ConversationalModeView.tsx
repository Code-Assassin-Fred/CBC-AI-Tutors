"use client";

import React from 'react';
import { useConversationalVoice, LessonContext, ConversationMessage } from '@/lib/hooks/useConversationalVoice';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { useAuth } from '@/lib/context/AuthContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';
import axios from 'axios';
import { HiOutlineMicrophone, HiOutlineStop, HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlineLockClosed, HiOutlineSpeakerWave } from 'react-icons/hi2';

interface ConversationalModeViewProps {
    lessonContext?: LessonContext;
    onClose?: () => void;
}

export default function ConversationalModeView({ lessonContext, onClose }: ConversationalModeViewProps) {
    const { user } = useAuth();
    const { addXP, showXPPopup } = useGamification();
    const [sessionStartTime, setSessionStartTime] = React.useState<number | null>(null);
    const {
        isActive,
        isListening,
        isSpeaking,
        isProcessing,
        currentTranscript,
        conversationHistory,
        error,
        startConversation,
        endConversation,
        interruptAI,
        speak,
    } = useConversationalVoice({
        lessonContext,
        onEnd: (history) => saveChatHistory(history)
    });

    const saveChatHistory = async (history: ConversationMessage[]) => {
        if (!user || !lessonContext || history.length === 0) return;

        // Check if session was long enough for XP (5+ minutes)
        if (sessionStartTime) {
            const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
            if (sessionDuration >= 5) {
                await addXP(XP_CONFIG.conversational, 'conversational', 'Conversational session (5+ minutes)');
                showXPPopup(XP_CONFIG.conversational);
            }
        }

        try {
            await axios.post('/api/user/activity', {
                userId: user.uid,
                type: 'chat',
                context: {
                    grade: lessonContext.grade,
                    subject: lessonContext.subject,
                    strand: lessonContext.strand,
                    substrand: lessonContext.substrand,
                },
                chatHistory: history
            });
        } catch {
            // Silently fail - this is a background save and shouldn't affect UX
        }
    };

    const [readyToExplainIds, setReadyToExplainIds] = React.useState<Set<string>>(new Set());
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory, currentTranscript]);

    // Auto-trigger "Ready to Explain" (abstraction) when user starts speaking
    React.useEffect(() => {
        if (currentTranscript && currentTranscript.trim().length > 0 && conversationHistory.length > 0) {
            const lastMessage = conversationHistory[conversationHistory.length - 1];
            // Only auto-blur if it's an EXPLAIN message (Assessment Setup)
            if (lastMessage.role === 'assistant' && lastMessage.type === 'EXPLAIN' && !readyToExplainIds.has(lastMessage.id)) {
                setReadyToExplainIds(prev => new Set(prev).add(lastMessage.id));
            }
        }
    }, [currentTranscript, conversationHistory, readyToExplainIds]);

    // Handle close
    const handleClose = () => {
        endConversation();
    };

    // Not started yet - show start button
    if (!isActive) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Voice Conversation</h3>
                        <p className="text-sm text-white/60 max-w-xs mx-auto">
                            Have a natural voice conversation with your AI tutor.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSessionStartTime(Date.now());
                            startConversation();
                        }}
                        className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-lg transition-all"
                    >
                        Start Conversation
                    </button>
                    {lessonContext && (
                        <p className="text-xs text-white/40">
                            Topic: {lessonContext.substrand}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' :
                        isSpeaking ? 'bg-sky-500 animate-pulse' :
                            isProcessing ? 'bg-amber-500 animate-pulse' :
                                'bg-white/20'
                        }`} />
                    <span className="text-xs uppercase tracking-widest text-white/60">
                        {isListening ? 'Listening...' :
                            isSpeaking ? 'Speaking...' :
                                isProcessing ? 'Thinking...' :
                                    'Ready'}
                    </span>
                </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-4">
                {conversationHistory.map((message, index) => {
                    const isAssistantMessage = message.role === 'assistant';
                    const isLastMessage = index === conversationHistory.length - 1;
                    const lastMessage = conversationHistory[conversationHistory.length - 1];

                    // Is there currently an active assessment?
                    const isAssessmentInProgress = lastMessage && lastMessage.role === 'assistant' && lastMessage.type === 'EXPLAIN' && (isListening || currentTranscript);

                    // Only EXPLAIN messages show the assessment blur UI
                    const isExplainMessage = isAssistantMessage && message.type === 'EXPLAIN';
                    const isMarkedReady = readyToExplainIds.has(message.id);

                    // We blur the message if:
                    // 1. It is the active EXPLAIN message and user started speaking
                    // 2. OR it is ANY previous message while an EXPLAIN assessment is in progress (global blur)
                    const shouldBlur = (isExplainMessage && isMarkedReady && (isListening || currentTranscript)) ||
                        (!isLastMessage && isAssessmentInProgress);

                    return (
                        <div
                            key={message.id}
                            className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-start gap-2 max-w-[85%] group">
                                {message.role === 'assistant' && (
                                    <button
                                        onClick={() => speak(message.content)}
                                        className="mt-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Explain Again"
                                    >
                                        <HiOutlineSpeakerWave className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <div
                                    className={`px-4 py-3 rounded-2xl relative ${message.role === 'user'
                                        ? 'bg-sky-600 text-white rounded-br-md shadow-lg shadow-sky-500/10'
                                        : 'bg-white/10 text-white/90 rounded-bl-md'
                                        } ${shouldBlur ? 'overflow-hidden' : ''}`}
                                >
                                    <p className={`text-sm leading-relaxed transition-all duration-500 ${shouldBlur ? 'blur-lg select-none opacity-20' : ''}`}>
                                        {message.content}
                                    </p>

                                    {shouldBlur && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all">
                                            <HiOutlineLockClosed className="w-5 h-5 text-white/60 mb-2" />
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">Concept Hidden</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Current transcript (live) */}
                {currentTranscript && (
                    <div className="flex justify-end">
                        <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-sky-600/50 text-white/70 rounded-br-md border border-sky-500/30">
                            <p className="text-sm leading-relaxed italic">{currentTranscript}</p>
                        </div>
                    </div>
                )}

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-bl-md">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Voice Visualization & Controls */}
            <div className="pt-2 border-t border-white/10 space-y-2">
                {/* Voice visualization */}
                <div className="flex items-center justify-center h-8">
                    {isListening && (
                        <VoiceVisualization isActive={true} color="bg-emerald-500" />
                    )}
                    {isSpeaking && (
                        <VoiceVisualization isActive={true} color="bg-sky-500" />
                    )}
                    {!isListening && !isSpeaking && (
                        <div className="text-xs text-white/40 uppercase tracking-widest">
                            {isProcessing ? 'Thinking...' : 'Speak to ask a question'}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-4">
                    {isSpeaking ? (
                        <button
                            onClick={interruptAI}
                            className="p-3 bg-amber-600 hover:bg-amber-500 rounded-full transition-all shadow-lg"
                            title="Interrupt AI"
                        >
                            <HiOutlineStop className="w-5 h-5 text-white" />
                        </button>
                    ) : (
                        <div className={`p-3 rounded-full ${isListening
                            ? 'bg-emerald-600 ring-4 ring-emerald-500/30 animate-pulse'
                            : 'bg-white/10'
                            }`}>
                            <HiOutlineMicrophone className={`w-5 h-5 ${isListening ? 'text-white' : 'text-white/40'
                                }`} />
                        </div>
                    )}

                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-white/20 hover:bg-white/10 rounded-full text-white/60 hover:text-white text-[10px] uppercase tracking-wider transition-all"
                    >
                        End Session
                    </button>
                </div>

                {/* Error display */}
                {error && (
                    <div className="text-center text-xs text-red-400">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
