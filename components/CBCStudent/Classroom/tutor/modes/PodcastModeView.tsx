"use client";

import React, { useState, useRef } from 'react';
import { PodcastScript } from '@/lib/types/agents';

interface PodcastModeViewProps {
    script: PodcastScript;
}

export default function PodcastModeView({ script }: PodcastModeViewProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showTranscript, setShowTranscript] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentDialogue = script.dialogue[currentIndex];
    const progress = ((currentIndex + 1) / script.dialogue.length) * 100;

    const goToNext = () => {
        if (currentIndex < script.dialogue.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const getEmotionEmoji = (emotion?: string) => {
        switch (emotion) {
            case 'curious': return '🤔';
            case 'excited': return '😊';
            case 'thoughtful': return '💭';
            case 'encouraging': return '👍';
            case 'surprised': return '😮';
            default: return '';
        }
    };

    const getSpeakerStyle = (speaker: string) => {
        if (speaker === 'Mwalimu') {
            return 'bg-blue-500/20 border-blue-500/30 text-blue-100';
        }
        return 'bg-purple-500/20 border-purple-500/30 text-purple-100';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-white/10 mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎧</span>
                    <div>
                        <h3 className="text-sm font-semibold text-white">{script.title}</h3>
                        <p className="text-xs text-white/50">{script.duration} • {script.dialogue.length} segments</p>
                    </div>
                </div>
                <p className="text-xs text-white/60 mt-2">{script.introduction}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-white/40">{currentIndex + 1} / {script.dialogue.length}</span>
                    <span className="text-xs text-white/40">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Current Dialogue */}
            <div className="flex-1 overflow-y-auto scrollbar-hide" ref={containerRef}>
                <div className={`p-4 rounded-xl border ${getSpeakerStyle(currentDialogue.speaker)}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                            {currentDialogue.speaker === 'Mwalimu' ? '👩‍🏫' : '🧑‍🎓'}
                        </span>
                        <span className="text-sm font-semibold">{currentDialogue.speaker}</span>
                        {currentDialogue.emotion && (
                            <span className="text-sm">{getEmotionEmoji(currentDialogue.emotion)}</span>
                        )}
                    </div>
                    <p className="text-sm leading-relaxed">{currentDialogue.text}</p>
                </div>

                {/* Full Transcript Toggle */}
                <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-full mt-4 py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                    {showTranscript ? '▲ Hide full transcript' : '▼ Show full transcript'}
                </button>

                {showTranscript && (
                    <div className="mt-2 space-y-2">
                        {script.dialogue.map((d, i) => (
                            <button
                                key={d.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${i === currentIndex
                                        ? 'bg-white/10 border border-white/20'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs">
                                        {d.speaker === 'Mwalimu' ? '👩‍🏫' : '🧑‍🎓'}
                                    </span>
                                    <span className="text-xs font-medium text-white/70">{d.speaker}</span>
                                </div>
                                <p className="text-xs text-white/50 line-clamp-2">{d.text}</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Conclusion */}
                {currentIndex === script.dialogue.length - 1 && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                        <h4 className="text-sm font-semibold text-green-400 mb-2">🎉 Episode Complete!</h4>
                        <p className="text-xs text-white/70">{script.conclusion}</p>
                    </div>
                )}
            </div>

            {/* Playback Controls */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={goToPrev}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-colors"
                    >
                        {isPlaying ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={goToNext}
                        disabled={currentIndex === script.dialogue.length - 1}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <p className="text-center text-xs text-white/40 mt-2">
                    🔊 Text-to-Speech coming soon
                </p>
            </div>
        </div>
    );
}
