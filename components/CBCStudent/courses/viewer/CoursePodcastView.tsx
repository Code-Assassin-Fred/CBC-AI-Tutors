"use client";

import { useState } from 'react';
import { PodcastScript } from '@/lib/types/agents';
import { useCourses } from '@/lib/context/CoursesContext';

interface CoursePodcastViewProps {
    script: PodcastScript;
}

export default function CoursePodcastView({ script }: CoursePodcastViewProps) {
    const { speak, stopSpeaking, isPlaying } = useCourses();
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);

    const handlePlay = async () => {
        if (isPlaying) {
            stopSpeaking();
            setCurrentSegmentIndex(-1);
            return;
        }

        // Play segments sequentially
        for (let i = 0; i < script.dialogue.length; i++) {
            setCurrentSegmentIndex(i);
            const segment = script.dialogue[i];
            await speak(segment.text);
            // Small pause between segments
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setCurrentSegmentIndex(-1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                    <h3 className="font-semibold text-white">{script.title}</h3>
                    <p className="text-xs text-white/40 mt-1">
                        {script.duration} • {script.dialogue.length} segments
                    </p>
                </div>

                {/* Play button */}
                <button
                    onClick={handlePlay}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${isPlaying
                        ? 'bg-violet-500 text-white'
                        : 'bg-white text-black hover:bg-white/90'
                        }`}
                >
                    {isPlaying ? (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                            Pause
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Play Episode
                        </>
                    )}
                </button>
            </div>

            {/* Introduction */}
            {script.introduction && (
                <p className="text-white/60 text-sm italic">
                    {script.introduction}
                </p>
            )}

            {/* Dialogue */}
            <div className="space-y-4">
                {script.dialogue.map((segment, index) => (
                    <div
                        key={segment.id || index}
                        className={`transition-opacity duration-300 ${currentSegmentIndex === index ? 'opacity-100' :
                            currentSegmentIndex >= 0 ? 'opacity-40' : 'opacity-100'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Speaker indicator */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${segment.speaker === 'Teacher'
                                ? 'bg-sky-500/20 text-sky-400'
                                : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                {segment.speaker === 'Teacher' ? 'Jo' : 'Be'}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-medium uppercase tracking-wider ${segment.speaker === 'Teacher'
                                        ? 'text-sky-400'
                                        : 'text-purple-400'
                                        }`}>
                                        {segment.speaker === 'Teacher' ? 'Jo' : 'Beau'}
                                    </span>
                                    {segment.emotion && (
                                        <span className="text-[10px] text-white/30 italic">
                                            ({segment.emotion})
                                        </span>
                                    )}
                                    {currentSegmentIndex === index && isPlaying && (
                                        <div className="flex items-center gap-0.5 ml-2">
                                            <div className="w-1 h-3 bg-violet-400 rounded-full animate-pulse" />
                                            <div className="w-1 h-4 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-1 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed ${currentSegmentIndex === index ? 'text-white' : 'text-white/70'
                                    }`}>
                                    {segment.text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Conclusion */}
            {script.conclusion && (
                <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                        Episode Wrap-up
                    </h4>
                    <p className="text-white/60 text-sm italic">
                        {script.conclusion}
                    </p>
                </div>
            )}
        </div>
    );
}
