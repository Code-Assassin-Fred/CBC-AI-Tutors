"use client";

import React, { useState } from 'react';
import { ImmersiveContent, ImmersiveChunk, AssessmentResult } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiOutlineMicrophone, HiOutlineStop, HiOutlineSpeakerWave } from 'react-icons/hi2';

interface ImmersiveModeViewProps {
    content: ImmersiveContent;
}

export default function ImmersiveModeView({ content }: ImmersiveModeViewProps) {
    const { audio, speak, stopSpeaking, startListening, stopListening, setAudioState } = useTutor();
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [phase, setPhase] = useState<'learning' | 'explaining' | 'feedback'>('learning');
    const [userExplanation, setUserExplanation] = useState('');
    const [isAssessing, setIsAssessing] = useState(false);
    const [assessments, setAssessments] = useState<Map<string, AssessmentResult>>(new Map());

    // Update terminal from audio transcript
    React.useEffect(() => {
        if (audio.isListening && audio.transcript) {
            // Only update if it's not just the placeholder
            const displayTranscript = audio.transcript.replace(/\s*\(transcribing\.\.\.\)$/, '');
            if (displayTranscript) {
                setUserExplanation(displayTranscript);
            }
        }
    }, [audio.isListening, audio.transcript]);

    // Clean up transcript placeholder when stopping
    React.useEffect(() => {
        if (!audio.isListening && audio.transcript?.includes('(transcribing...)')) {
            const cleaned = audio.transcript.replace(/\s*\(transcribing\.\.\.\)$/, '');
            setAudioState(prev => ({ ...prev, transcript: cleaned }));
        }
    }, [audio.isListening, audio.transcript, setAudioState]);

    const currentChunk = content.chunks[currentChunkIndex];
    const totalChunks = content.chunks.length;
    const completedChunks = assessments.size;

    // Auto-speak explanation when entering learning phase
    React.useEffect(() => {
        if (phase === 'learning' && currentChunk) {
            speak(`${currentChunk.concept}. ${currentChunk.aiExplanation}`);
        }
    }, [phase, currentChunkIndex]);

    const handleStartExplaining = () => {
        setPhase('explaining');
        setUserExplanation('');
    };

    const handleSubmitExplanation = async () => {
        if (!userExplanation.trim()) return;

        setIsAssessing(true);

        // Simple client-side assessment (in production, this would call an API)
        const assessment = assessExplanation(currentChunk, userExplanation);

        setAssessments(prev => new Map(prev).set(currentChunk.id, assessment));
        setPhase('feedback');
        setIsAssessing(false);
    };

    const assessExplanation = (chunk: ImmersiveChunk, explanation: string): AssessmentResult => {
        const lowerExplanation = explanation.toLowerCase();
        const matchedPoints: string[] = [];
        const missedPoints: string[] = [];

        chunk.keyPointsToCheck.forEach(point => {
            // Simple keyword matching (in production, use AI)
            const keywords = point.toLowerCase().split(' ').filter(w => w.length > 3);
            const hasMatch = keywords.some(kw => lowerExplanation.includes(kw));

            if (hasMatch) {
                matchedPoints.push(point);
            } else {
                missedPoints.push(point);
            }
        });

        const score = Math.round((matchedPoints.length / chunk.keyPointsToCheck.length) * 100);

        let level: 'excellent' | 'good' | 'needs-work';
        let feedback: string;
        let shouldRetry: boolean;

        if (score >= 80) {
            level = 'excellent';
            feedback = `Excellent! You've demonstrated a strong understanding of ${chunk.concept}. ${chunk.scoringRubric.excellent[0] || ''}`;
            shouldRetry = false;
        } else if (score >= 50) {
            level = 'good';
            feedback = `Good effort! You covered the basics of ${chunk.concept}. ${chunk.scoringRubric.good[0] || ''}`;
            shouldRetry = false;
        } else {
            level = 'needs-work';
            feedback = chunk.followUpIfStruggling || `Let's review ${chunk.concept} together.`;
            shouldRetry = true;
        }

        return {
            chunkId: chunk.id,
            score,
            level,
            matchedKeyPoints: matchedPoints,
            missedKeyPoints: missedPoints,
            feedback,
            shouldRetry,
        };
    };

    const handleContinue = () => {
        const assessment = assessments.get(currentChunk.id);

        if (assessment?.shouldRetry) {
            // Retry same chunk
            setPhase('learning');
            setUserExplanation('');
        } else if (currentChunkIndex < totalChunks - 1) {
            // Move to next chunk
            setCurrentChunkIndex(currentChunkIndex + 1);
            setPhase('learning');
            setUserExplanation('');
        } else {
            // All done - show completion
            setPhase('feedback');
        }
    };

    const progress = ((currentChunkIndex + (phase === 'feedback' ? 1 : 0)) / totalChunks) * 100;
    const currentAssessment = assessments.get(currentChunk.id);
    const allComplete = completedChunks === totalChunks && !currentAssessment?.shouldRetry;

    return (
        <div className="flex flex-col h-full">
            {/* Progress Header - Minimalist */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        Section {currentChunkIndex + 1} / {totalChunks}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-1 bg-white/5 overflow-hidden">
                    <div
                        className="h-full bg-sky-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* All Complete - Minimalist */}
            {allComplete && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center w-full">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Lesson Complete</h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto mb-6">{content.completionMessage}</p>
                        <div className="flex gap-2 justify-center">
                            {content.chunks.map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Learning Phase - Minimalist */}
            {!allComplete && phase === 'learning' && (
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider underline decoration-sky-500 decoration-2 underline-offset-4">{currentChunk.concept}</h3>
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                            {currentChunk.aiExplanation}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => audio.isPlaying ? stopSpeaking() : speak(currentChunk.aiExplanation)}
                            className="w-full py-4 border border-white/10 hover:bg-white/5 text-white flex items-center justify-center gap-3 transition-all"
                        >
                            {audio.isPlaying ? <HiOutlineStop className="w-5 h-5 text-sky-500" /> : <HiOutlineSpeakerWave className="w-5 h-5" />}
                            <span className="font-bold text-[10px] uppercase tracking-[0.2em]">
                                {audio.isPlaying ? 'Stop Listening' : 'Listen Again'}
                            </span>
                        </button>

                        <button
                            onClick={handleStartExplaining}
                            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                        >
                            Explain Now
                        </button>
                    </div>
                </div>
            )}

            {/* Explaining Phase - Minimalist */}
            {!allComplete && phase === 'explaining' && (
                <div className="flex-1 flex flex-col space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Your Explanation</h4>
                        <p className="text-sm text-white/70 italic leading-relaxed">{currentChunk.promptForStudent}</p>
                    </div>

                    <div className="relative flex-1 flex flex-col">
                        <textarea
                            value={userExplanation}
                            onChange={(e) => setUserExplanation(e.target.value)}
                            placeholder="Type or speak your explanation here..."
                            className="flex-1 bg-transparent border-b border-white/20 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/40 transition-colors py-2 pr-10"
                        />
                        <button
                            onClick={audio.isListening ? stopListening : startListening}
                            className={`absolute right-0 bottom-4 p-2 rounded-full transition-all ${audio.isListening ? 'bg-red-500 text-white scale-110 animate-pulse' : 'bg-white/5 text-white/40 hover:text-white'
                                }`}
                        >
                            <HiOutlineMicrophone className="w-5 h-5" />
                        </button>
                    </div>

                    {audio.isListening && (
                        <div className="flex items-center gap-3 py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20">
                            <VoiceVisualization isActive={true} color="bg-red-500" />
                            <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">Live Transcription</span>
                        </div>
                    )}

                    <button
                        onClick={handleSubmitExplanation}
                        disabled={!userExplanation.trim() || isAssessing}
                        className="py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-white/5 disabled:text-white/20 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                    >
                        {isAssessing ? 'Processing...' : 'Submit Explanation'}
                    </button>
                </div>
            )}

            {/* Feedback Phase - Minimalist */}
            {!allComplete && phase === 'feedback' && currentAssessment && (
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-2">
                    {/* Score Summary */}
                    <div className="pb-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Assessment Result</span>
                            <span className={`text-xl font-bold font-mono ${currentAssessment.level === 'excellent' ? 'text-emerald-400' :
                                currentAssessment.level === 'good' ? 'text-sky-400' : 'text-amber-400'
                                }`}>
                                {currentAssessment.score}%
                            </span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed italic">{currentAssessment.feedback}</p>
                    </div>

                    {/* Checkpoints */}
                    <div className="space-y-4">
                        {currentAssessment.matchedKeyPoints.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Concept Clarity</h5>
                                <ul className="space-y-1">
                                    {currentAssessment.matchedKeyPoints.map((point, i) => (
                                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                            <span className="text-emerald-500">•</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {currentAssessment.missedKeyPoints.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Points to Refine</h5>
                                <ul className="space-y-1">
                                    {currentAssessment.missedKeyPoints.map((point, i) => (
                                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleContinue}
                        className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
                    >
                        {currentAssessment.shouldRetry ? 'Refine Explanation' : currentChunkIndex < totalChunks - 1 ? 'Continue' : 'Finish Session'}
                    </button>
                </div>
            )}
        </div>
    );
}
