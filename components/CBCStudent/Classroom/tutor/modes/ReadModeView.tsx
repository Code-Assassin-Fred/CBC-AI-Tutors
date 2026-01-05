"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ReadModeContent } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiOutlineSpeakerWave, HiOutlineStop, HiBackward, HiForward } from 'react-icons/hi2';

interface ReadModeViewProps {
    content: ReadModeContent;
}

// Build a flat list of all readable segments
interface ReadableSegment {
    id: string;
    label: string;
    text: string;
    type: 'intro' | 'section' | 'keypoints' | 'examples' | 'summary' | 'questions';
}

export default function ReadModeView({ content }: ReadModeViewProps) {
    const {
        chatMessages,
        sendChatMessage,
        speak,
        stopSpeaking,
        audio
    } = useTutor();
    const { addXP, showXPPopup } = useGamification();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
    const [isPlayingAll, setIsPlayingAll] = useState(false);
    const [hasAwardedXP, setHasAwardedXP] = useState(false);
    const playingRef = useRef(false);
    const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Build flat list of all segments for sequential reading
    const segments = useMemo((): ReadableSegment[] => {
        const result: ReadableSegment[] = [];

        // Introduction
        result.push({
            id: 'intro',
            label: 'Introduction',
            text: content.introduction,
            type: 'intro'
        });

        // Sections with their subsections
        content.sections.forEach((section, idx) => {
            result.push({
                id: section.id,
                label: `${idx + 1}. ${section.title}`,
                text: `${section.title}. ${section.content}`,
                type: 'section'
            });

            if (section.keyPoints.length > 0) {
                result.push({
                    id: `${section.id}-points`,
                    label: `Key points`,
                    text: `Key points: ${section.keyPoints.join('. ')}`,
                    type: 'keypoints'
                });
            }

            if (section.examples.length > 0) {
                const examplesText = section.examples.map(e => `${e.title}: ${e.description}`).join('. ');
                result.push({
                    id: `${section.id}-examples`,
                    label: `Examples`,
                    text: `Examples: ${examplesText}`,
                    type: 'examples'
                });
            }
        });

        // Summary
        result.push({
            id: 'summary',
            label: 'Summary',
            text: `In summary, ${content.summary}`,
            type: 'summary'
        });

        // Review questions
        if (content.reviewQuestions.length > 0) {
            result.push({
                id: 'questions',
                label: 'Think About It',
                text: `Think about it: ${content.reviewQuestions.join('. ')}`,
                type: 'questions'
            });
        }

        return result;
    }, [content]);

    // Auto-scroll to current segment
    useEffect(() => {
        if (currentSegmentIndex >= 0 && segmentRefs.current[currentSegmentIndex]) {
            segmentRefs.current[currentSegmentIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentSegmentIndex]);

    // Play from a specific index
    const playFromIndex = async (startIndex: number) => {
        setIsPlayingAll(true);
        playingRef.current = true;

        for (let i = startIndex; i < segments.length; i++) {
            if (!playingRef.current) break;

            setCurrentSegmentIndex(i);
            const segment = segments[i];

            try {
                await speak(segment.text, { textId: segment.id });
            } catch (error) {
                console.error('Error speaking segment:', error);
                break;
            }
        }

        if (playingRef.current) {
            // Finished naturally - award XP for completing the lesson
            if (!hasAwardedXP) {
                setHasAwardedXP(true);
                await addXP(XP_CONFIG.lesson, 'lesson', 'Completed lesson in Read Mode');
                showXPPopup(XP_CONFIG.lesson);
            }
            setIsPlayingAll(false);
            playingRef.current = false;
        }
    };

    const handlePlayPause = async () => {
        if (isPlayingAll) {
            // Stop playback
            playingRef.current = false;
            stopSpeaking();
            setIsPlayingAll(false);
            return;
        }

        // Start from current position or beginning
        const startIndex = currentSegmentIndex >= 0 ? currentSegmentIndex : 0;
        await playFromIndex(startIndex);
    };

    const handleSkipBack = () => {
        const newIndex = Math.max(0, currentSegmentIndex - 1);
        setCurrentSegmentIndex(newIndex);
        if (isPlayingAll) {
            stopSpeaking();
            playFromIndex(newIndex);
        }
    };

    const handleSkipForward = () => {
        const newIndex = Math.min(segments.length - 1, currentSegmentIndex + 1);
        setCurrentSegmentIndex(newIndex);
        if (isPlayingAll) {
            stopSpeaking();
            playFromIndex(newIndex);
        }
    };

    const handleProgressClick = (index: number) => {
        setCurrentSegmentIndex(index);
        if (isPlayingAll) {
            stopSpeaking();
            playFromIndex(index);
        }
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

    // Calculate progress percentage
    const progressPercent = segments.length > 0
        ? ((currentSegmentIndex + 1) / segments.length) * 100
        : 0;

    // Helper to get segment index for a given content section
    const findSegmentIndex = (id: string) => segments.findIndex(s => s.id === id);

    return (
        <div className="flex flex-col h-full">
            {/* Progress Bar and Controls - Compact */}
            <div className="pb-3 mb-3 border-b border-white/10">
                {/* Progress info */}
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-white/40 truncate flex-1">
                        {currentSegmentIndex >= 0 ? segments[currentSegmentIndex]?.label : 'Ready to play'}
                    </span>
                    <span className="text-xs text-white/20">
                        {currentSegmentIndex >= 0 ? currentSegmentIndex + 1 : 0} / {segments.length}
                    </span>
                </div>

                {/* Progress bar + controls inline */}
                <div className="flex items-center gap-3">
                    {/* Skip Back */}
                    <button
                        onClick={handleSkipBack}
                        disabled={currentSegmentIndex <= 0}
                        className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Previous section"
                    >
                        <HiBackward className="w-4 h-4 text-white" />
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-full bg-sky-500 hover:bg-sky-400 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                    >
                        {isPlayingAll ? (
                            <HiOutlineStop className="w-4 h-4 text-white" />
                        ) : (
                            <HiOutlineSpeakerWave className="w-4 h-4 text-white" />
                        )}
                    </button>

                    {/* Skip Forward */}
                    <button
                        onClick={handleSkipForward}
                        disabled={currentSegmentIndex >= segments.length - 1}
                        className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Next section"
                    >
                        <HiForward className="w-4 h-4 text-white" />
                    </button>

                    {/* Progress bar */}
                    <div className="flex-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-white/5">
                        {segments.map((segment, idx) => (
                            <button
                                key={segment.id}
                                onClick={() => handleProgressClick(idx)}
                                className={`flex-1 transition-all hover:brightness-125 ${idx <= currentSegmentIndex
                                    ? 'bg-sky-500'
                                    : 'bg-white/10 hover:bg-white/20'
                                    } ${idx === currentSegmentIndex && audio.isPlaying ? 'animate-pulse' : ''}`}
                                title={segment.label}
                            />
                        ))}
                    </div>

                    {/* Voice visualization - inline */}
                    {isPlayingAll && audio.isPlaying && (
                        <VoiceVisualization isActive={true} />
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                {/* Introduction */}
                <div
                    ref={el => { segmentRefs.current[findSegmentIndex('intro')] = el; }}
                    className={`pb-4 border-b border-white/10 cursor-pointer transition-all rounded-lg p-3 -mx-3 ${currentSegmentIndex === findSegmentIndex('intro')
                        ? 'bg-white/5'
                        : 'hover:bg-white/[0.02]'
                        }`}
                    onClick={() => handleProgressClick(findSegmentIndex('intro'))}
                >
                    <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-2">Introduction</h4>
                    <p className={`text-sm leading-relaxed transition-colors ${currentSegmentIndex === findSegmentIndex('intro') ? 'text-white' : 'text-white/80'
                        }`}>{content.introduction}</p>
                </div>

                {/* Sections */}
                {content.sections.map((section, index) => {
                    const sectionIdx = findSegmentIndex(section.id);
                    const keyPointsIdx = findSegmentIndex(`${section.id}-points`);
                    const examplesIdx = findSegmentIndex(`${section.id}-examples`);

                    return (
                        <div
                            key={`${section.id}-${index}`}
                            className="space-y-4"
                        >
                            {/* Section Content */}
                            <div
                                ref={el => { segmentRefs.current[sectionIdx] = el; }}
                                className={`cursor-pointer transition-all rounded-lg p-3 -mx-3 ${currentSegmentIndex === sectionIdx
                                    ? 'bg-white/5'
                                    : 'hover:bg-white/[0.02]'
                                    }`}
                                onClick={() => handleProgressClick(sectionIdx)}
                            >
                                <span className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                                    <span className="text-white/40">{index + 1}.</span>
                                    {section.title}
                                </span>
                                <p className={`text-sm leading-relaxed transition-colors ${currentSegmentIndex === sectionIdx ? 'text-white' : 'text-white/70'
                                    }`}>{section.content}</p>
                            </div>

                            {/* Key Points */}
                            {section.keyPoints.length > 0 && (
                                <div
                                    ref={el => { segmentRefs.current[keyPointsIdx] = el; }}
                                    className={`ml-4 cursor-pointer transition-all rounded-lg p-3 -mx-3 ${currentSegmentIndex === keyPointsIdx
                                        ? 'bg-white/5'
                                        : 'hover:bg-white/[0.02]'
                                        }`}
                                    onClick={() => handleProgressClick(keyPointsIdx)}
                                >
                                    <p className="text-xs text-white/40 mb-2">Key points:</p>
                                    <ul className="space-y-1.5 pl-4">
                                        {section.keyPoints.map((point, i) => (
                                            <li key={i} className={`text-xs list-disc transition-colors ${currentSegmentIndex === keyPointsIdx ? 'text-white/80' : 'text-white/60'
                                                }`}>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Examples */}
                            {section.examples.length > 0 && (
                                <div
                                    ref={el => { segmentRefs.current[examplesIdx] = el; }}
                                    className={`ml-4 cursor-pointer transition-all rounded-lg p-3 -mx-3 ${currentSegmentIndex === examplesIdx
                                        ? 'bg-white/5'
                                        : 'hover:bg-white/[0.02]'
                                        }`}
                                    onClick={() => handleProgressClick(examplesIdx)}
                                >
                                    <p className="text-xs text-white/40 mb-2">Examples:</p>
                                    <div className="space-y-3 pl-4">
                                        {section.examples.map((example, i) => (
                                            <div key={i}>
                                                <p className={`text-xs font-medium transition-colors ${currentSegmentIndex === examplesIdx ? 'text-white/90' : 'text-white/70'
                                                    }`}>{example.title}</p>
                                                <p className={`text-xs mt-0.5 leading-relaxed transition-colors ${currentSegmentIndex === examplesIdx ? 'text-white/70' : 'text-white/50'
                                                    }`}>{example.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Summary */}
                <div
                    ref={el => { segmentRefs.current[findSegmentIndex('summary')] = el; }}
                    className={`pt-6 border-t border-white/10 cursor-pointer transition-all rounded-lg p-3 -mx-3 ${currentSegmentIndex === findSegmentIndex('summary')
                        ? 'bg-white/5'
                        : 'hover:bg-white/[0.02]'
                        }`}
                    onClick={() => handleProgressClick(findSegmentIndex('summary'))}
                >
                    <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-2">Summary</h4>
                    <p className={`text-sm leading-relaxed transition-colors ${currentSegmentIndex === findSegmentIndex('summary') ? 'text-white' : 'text-white/80'
                        }`}>{content.summary}</p>
                </div>

                {/* Review Questions */}
                {content.reviewQuestions.length > 0 && (
                    <div
                        ref={el => { segmentRefs.current[findSegmentIndex('questions')] = el; }}
                        className={`pt-6 pb-4 cursor-pointer transition-all rounded-lg p-3 -mx-3 ${currentSegmentIndex === findSegmentIndex('questions')
                            ? 'bg-white/5'
                            : 'hover:bg-white/[0.02]'
                            }`}
                        onClick={() => handleProgressClick(findSegmentIndex('questions'))}
                    >
                        <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">Think About It</h4>
                        <ul className="space-y-3">
                            {content.reviewQuestions.map((q, i) => (
                                <li key={i} className={`text-xs flex items-start gap-3 transition-colors ${currentSegmentIndex === findSegmentIndex('questions') ? 'text-white/80' : 'text-white/60'
                                    }`}>
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
