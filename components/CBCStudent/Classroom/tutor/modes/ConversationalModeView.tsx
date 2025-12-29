"use client";

import React from 'react';
import { useConversationalVoice, LessonContext } from '@/lib/hooks/useConversationalVoice';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiOutlineMicrophone, HiOutlineStop, HiOutlineChatBubbleLeftRight, HiOutlineXMark } from 'react-icons/hi2';

interface ConversationalModeViewProps {
    lessonContext?: LessonContext;
    onClose?: () => void;
}

export default function ConversationalModeView({ lessonContext, onClose }: ConversationalModeViewProps) {
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
    } = useConversationalVoice({ lessonContext });

    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory, currentTranscript]);

    // Handle close
    const handleClose = () => {
        endConversation();
        onClose?.();
    };

    // Not started yet - show start button
    if (!isActive) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
                        <HiOutlineChatBubbleLeftRight className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">Voice Conversation</h3>
                        <p className="text-sm text-white/60 max-w-xs mx-auto">
                            Have a natural voice conversation with your AI tutor. Ask questions, explore ideas, and learn at your own pace.
                        </p>
                    </div>
                    <button
                        onClick={startConversation}
                        className="px-8 py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 text-white font-bold text-sm uppercase tracking-wider rounded-full transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
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
                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <HiOutlineXMark className="w-5 h-5 text-white/60" />
                </button>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-4">
                {conversationHistory.map((message) => (
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
                            <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                    </div>
                ))}

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
            <div className="pt-4 border-t border-white/10 space-y-4">
                {/* Voice visualization */}
                <div className="flex items-center justify-center h-16">
                    {isListening && (
                        <VoiceVisualization isActive={true} color="bg-emerald-500" />
                    )}
                    {isSpeaking && (
                        <VoiceVisualization isActive={true} color="bg-sky-500" />
                    )}
                    {!isListening && !isSpeaking && (
                        <div className="text-xs text-white/40 uppercase tracking-widest">
                            {isProcessing ? 'Processing your question...' : 'Speak to ask a question'}
                        </div>
                    )}
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-center gap-4">
                    {isSpeaking ? (
                        <button
                            onClick={interruptAI}
                            className="p-4 bg-amber-600 hover:bg-amber-500 rounded-full transition-all shadow-lg"
                            title="Interrupt AI"
                        >
                            <HiOutlineStop className="w-6 h-6 text-white" />
                        </button>
                    ) : (
                        <div className={`p-4 rounded-full ${isListening
                                ? 'bg-emerald-600 ring-4 ring-emerald-500/30 animate-pulse'
                                : 'bg-white/10'
                            }`}>
                            <HiOutlineMicrophone className={`w-6 h-6 ${isListening ? 'text-white' : 'text-white/40'
                                }`} />
                        </div>
                    )}

                    <button
                        onClick={handleClose}
                        className="px-6 py-3 border border-white/20 hover:bg-white/10 rounded-full text-white/60 hover:text-white text-xs uppercase tracking-wider transition-all"
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
