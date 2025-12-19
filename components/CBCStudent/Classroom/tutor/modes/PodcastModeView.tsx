"use client";

import React, { useState, useRef } from 'react';
import { PodcastScript } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import VoiceVisualization from '@/components/shared/VoiceVisualization';

interface PodcastModeViewProps {
    script: PodcastScript;
}

export default function PodcastModeView({ script }: PodcastModeViewProps) {
    const { speak, stopSpeaking, audio } = useTutor();
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePlay = async () => {
        if (audio.isPlaying) {
            stopSpeaking();
            setCurrentSegmentIndex(-1);
            return;
        }

        // Start sequential playback
        for (let i = 0; i < script.dialogue.length; i++) {
            setCurrentSegmentIndex(i);
            const segment = script.dialogue[i];

            // Choose voice based on speaker
            const voiceOptions = {
                ssmlGender: segment.speaker === 'Teacher' ? 'MALE' : 'FEMALE' as any,
                voiceType: 'neural2' as any
            };

            await speak(segment.text, voiceOptions);

            // wait for audio to finish before next segment
            // (The context's audioRef onended should be handled, 
            // but for a sequence we need a way to await completion.
            // Simplified: we'll just handle one at a time for now, 
            // or use a more robust sequence manager.)
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header - Minimalist */}
            <div className="pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{script.title}</h3>
                        <p className="text-xs text-white/40 mt-1">{script.duration} • {script.dialogue.length} segments</p>
                    </div>
                </div>
                {script.introduction && (
                    <p className="text-xs text-white/60 mt-3 leading-relaxed italic">{script.introduction}</p>
                )}
            </div>

            {/* Continuous Dialogue Flow */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-2" ref={containerRef}>
                {script.dialogue.map((segment, index) => (
                    <div
                        key={`${segment.id}-${index}`}
                        className={`space-y-1 transition-opacity duration-500 ${currentSegmentIndex === index ? 'opacity-100' : 'opacity-40'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${segment.speaker === 'Teacher' ? 'text-sky-400' : 'text-purple-400'
                                    }`}>
                                    {segment.speaker}
                                </span>
                                {segment.emotion && (
                                    <span className="text-[10px] text-white/20 italic">({segment.emotion})</span>
                                )}
                            </div>
                            {currentSegmentIndex === index && audio.isPlaying && (
                                <VoiceVisualization isActive={true} color={segment.speaker === 'Teacher' ? 'bg-sky-400' : 'bg-purple-400'} />
                            )}
                        </div>
                        <p className={`text-sm leading-relaxed transition-colors ${currentSegmentIndex === index ? 'text-white' : 'text-white/60'
                            }`}>
                            {segment.text}
                        </p>
                    </div>
                ))}

                {/* Conclusion - Minimalist */}
                {script.conclusion && (
                    <div className="mt-8 pt-4 border-t border-white/5 pb-8">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 font-mono">End of Episode</h4>
                        <p className="text-sm text-white/60 italic leading-relaxed">{script.conclusion}</p>
                    </div>
                )}
            </div>

            {/* Playback Controls - Minimalist */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center">
                    <button
                        onClick={handlePlay}
                        className="p-4 rounded-full bg-sky-500 hover:bg-sky-400 transition-all group active:scale-95 shadow-lg shadow-sky-500/20"
                    >
                        {audio.isPlaying ? (
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
                </div>

                <p className="text-center text-[10px] uppercase tracking-widest text-white/20 mt-4">
                    Playback active
                </p>
            </div>
        </div>
    );
}
