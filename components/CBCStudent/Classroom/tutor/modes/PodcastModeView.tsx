"use client";

import React, { useState, useRef, useEffect } from 'react';
import { PodcastScript } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiBackward, HiForward, HiPause, HiPlay } from 'react-icons/hi2';

interface PodcastModeViewProps {
    script: PodcastScript;
}

export default function PodcastModeView({ script }: PodcastModeViewProps) {
    const { speak, stopSpeaking, audio } = useTutor();
    const { addXP, showXPPopup } = useGamification();
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const [isPlayingSequence, setIsPlayingSequence] = useState(false);
    const [hasAwardedXP, setHasAwardedXP] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const playingRef = useRef(false);

    // Auto-scroll to current segment
    useEffect(() => {
        if (currentSegmentIndex >= 0 && segmentRefs.current[currentSegmentIndex]) {
            segmentRefs.current[currentSegmentIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentSegmentIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            playingRef.current = false;
        };
    }, []);

    const handlePlay = async () => {
        if (isPlayingSequence) {
            // Stop playback
            playingRef.current = false;
            stopSpeaking();
            setIsPlayingSequence(false);
            return;
        }

        // Start from current position or beginning
        const startIndex = currentSegmentIndex >= 0 ? currentSegmentIndex : 0;
        await playFromIndex(startIndex);
    };

    const playFromIndex = async (startIndex: number) => {
        setIsPlayingSequence(true);
        playingRef.current = true;

        for (let i = startIndex; i < script.dialogue.length; i++) {
            if (!playingRef.current) break;

            setCurrentSegmentIndex(i);
            const segment = script.dialogue[i];

            // Choose voice based on speaker
            const voiceOptions = {
                ssmlGender: segment.speaker === 'Teacher' ? 'MALE' : 'FEMALE' as any,
                voiceType: 'neural2' as any
            };

            try {
                await speak(segment.text, voiceOptions);
            } catch (error) {
                console.error('Error speaking segment:', error);
                break;
            }
        }

        if (playingRef.current) {
            // Finished naturally - award XP for completing the podcast
            if (!hasAwardedXP) {
                setHasAwardedXP(true);
                await addXP(XP_CONFIG.podcast, 'podcast', 'Completed podcast lesson');
                showXPPopup(XP_CONFIG.podcast);
            }
            setIsPlayingSequence(false);
            playingRef.current = false;
        }
    };

    const handleSkipBack = () => {
        const newIndex = Math.max(0, currentSegmentIndex - 1);
        setCurrentSegmentIndex(newIndex);

        if (isPlayingSequence) {
            stopSpeaking();
            playFromIndex(newIndex);
        }
    };

    const handleSkipForward = () => {
        const newIndex = Math.min(script.dialogue.length - 1, currentSegmentIndex + 1);
        setCurrentSegmentIndex(newIndex);

        if (isPlayingSequence) {
            stopSpeaking();
            playFromIndex(newIndex);
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
            </div>

            {/* Continuous Dialogue Flow */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-2" ref={containerRef}>
                {script.dialogue.map((segment, index) => (
                    <div
                        key={`${segment.id}-${index}`}
                        ref={el => { segmentRefs.current[index] = el; }}
                        className={`space-y-1 transition-all duration-300 cursor-pointer rounded-lg p-2 -mx-2 ${currentSegmentIndex === index
                            ? 'bg-white/5 opacity-100'
                            : 'opacity-50 hover:opacity-75'
                            }`}
                        onClick={() => setCurrentSegmentIndex(index)}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${segment.speaker === 'Teacher' ? 'text-sky-400' : 'text-amber-400'
                                }`}>
                                {segment.speaker}
                            </span>
                            {currentSegmentIndex === index && audio.isPlaying && (
                                <VoiceVisualization isActive={true} color={segment.speaker === 'Teacher' ? 'bg-sky-400' : 'bg-amber-400'} />
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

            {/* Playback Controls - Like Explanation Mode with Progress Bar */}
            <div className="mt-4 pt-4 border-t border-white/10">
                {/* Progress info */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-white/40 truncate flex-1">
                        {currentSegmentIndex >= 0
                            ? script.dialogue[currentSegmentIndex]?.speaker
                            : 'Ready to play'}
                    </span>
                    <span className="text-xs text-white/20">
                        {currentSegmentIndex >= 0 ? currentSegmentIndex + 1 : 0} / {script.dialogue.length}
                    </span>
                </div>

                {/* Progress bar + controls inline */}
                <div className="flex items-center gap-3">
                    {/* Skip Back */}
                    <button
                        onClick={handleSkipBack}
                        disabled={currentSegmentIndex <= 0}
                        className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Previous segment"
                    >
                        <HiBackward className="w-4 h-4 text-white" />
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={handlePlay}
                        className="p-2 rounded-full bg-sky-500 hover:bg-sky-400 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                    >
                        {isPlayingSequence ? (
                            <HiPause className="w-4 h-4 text-white" />
                        ) : (
                            <HiPlay className="w-4 h-4 text-white" />
                        )}
                    </button>

                    {/* Skip Forward */}
                    <button
                        onClick={handleSkipForward}
                        disabled={currentSegmentIndex >= script.dialogue.length - 1}
                        className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Next segment"
                    >
                        <HiForward className="w-4 h-4 text-white" />
                    </button>

                    {/* Progress bar */}
                    <div className="flex-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-white/5">
                        {script.dialogue.map((segment, idx) => (
                            <button
                                key={`${segment.id}-${idx}`}
                                onClick={() => {
                                    setCurrentSegmentIndex(idx);
                                    if (isPlayingSequence) {
                                        stopSpeaking();
                                        playFromIndex(idx);
                                    }
                                }}
                                className={`flex-1 transition-all hover:brightness-125 ${idx < currentSegmentIndex
                                    ? 'bg-sky-500'
                                    : idx === currentSegmentIndex
                                        ? audio.isPlaying ? 'bg-sky-500 animate-pulse' : 'bg-sky-500'
                                        : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                title={`${segment.speaker}: ${segment.text.substring(0, 30)}...`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
