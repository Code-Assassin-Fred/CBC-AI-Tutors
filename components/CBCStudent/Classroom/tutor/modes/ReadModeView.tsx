"use client";

import React, { useState } from 'react';
import { ReadModeContent, ChatMessage } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiOutlineSpeakerWave, HiOutlineStop } from 'react-icons/hi2';

interface ReadModeViewProps {
    content: ReadModeContent;
}

export default function ReadModeView({ content }: ReadModeViewProps) {
    const {
        chatMessages,
        sendChatMessage,
        context,
        speak,
        stopSpeaking,
        audio
    } = useTutor();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const handleSpeakAll = async () => {
        if (audio.isPlaying) {
            stopSpeaking();
            return;
        }

        // Combine all text for speaking
        const allText = `${content.introduction}. ${content.sections.map(s => `${s.title}. ${s.content}`).join('. ')}. In summary, ${content.summary}`;
        speak(allText);
    };

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
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-hide">
                {/* Introduction */}
                <div className="pb-4 border-b border-white/10 group relative">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Introduction</h4>
                        <button
                            onClick={audio.isPlaying ? stopSpeaking : () => speak(content.introduction)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                        >
                            {audio.isPlaying ? <HiOutlineStop className="w-4 h-4" /> : <HiOutlineSpeakerWave className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">{content.introduction}</p>
                    {audio.isPlaying && <div className="mt-2"><VoiceVisualization isActive={true} /></div>}
                </div>

                {/* Sections */}
                {content.sections.map((section, index) => (
                    <div
                        key={`${section.id}-${index}`}
                        className="space-y-4"
                    >
                        {/* Section Header */}
                        <div className="w-full flex items-center justify-between group/header">
                            <button
                                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                className="flex-1 flex items-center group transition-colors py-2 text-left"
                            >
                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="text-white/40">{index + 1}.</span>
                                    {section.title}
                                </span>
                                <span className={`ml-4 text-white/20 group-hover:text-white/40 transition-transform ${activeSection === section.id ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    audio.isPlaying ? stopSpeaking : speak(`${section.title}. ${section.content}`);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white opacity-0 group-hover/header:opacity-100 transition-all"
                            >
                                <HiOutlineSpeakerWave className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Section Content */}
                        {(activeSection === section.id || index === 0) && (
                            <div className="space-y-6">
                                <p className="text-sm text-white/70 leading-relaxed">{section.content}</p>

                                {/* Key Points */}
                                {section.keyPoints.length > 0 && (
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Key Points</h5>
                                        <ul className="space-y-2">
                                            {section.keyPoints.map((point, i) => (
                                                <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-1">•</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Examples */}
                                {section.examples.length > 0 && (
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Examples</h5>
                                        <div className="grid gap-3">
                                            {section.examples.map((example, i) => (
                                                <div key={i} className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                                    <p className="text-xs font-bold text-white/90">{example.title}</p>
                                                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{example.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Summary */}
                <div className="pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Summary</h4>
                    <p className="text-sm text-white/80 leading-relaxed">{content.summary}</p>
                </div>

                {/* Review Questions */}
                {content.reviewQuestions.length > 0 && (
                    <div className="pt-6 pb-4">
                        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">Think About It</h4>
                        <ul className="space-y-3">
                            {content.reviewQuestions.map((q, i) => (
                                <li key={i} className="text-xs text-white/60 flex items-start gap-3">
                                    <span className="text-cyan-500 font-bold">{i + 1}.</span>
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
