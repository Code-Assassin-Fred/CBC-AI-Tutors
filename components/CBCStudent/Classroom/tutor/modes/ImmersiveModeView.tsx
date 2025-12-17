"use client";

import React, { useState } from 'react';
import { ImmersiveContent, ImmersiveChunk, AssessmentResult } from '@/lib/types/agents';

interface ImmersiveModeViewProps {
    content: ImmersiveContent;
}

export default function ImmersiveModeView({ content }: ImmersiveModeViewProps) {
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [phase, setPhase] = useState<'learning' | 'explaining' | 'feedback'>('learning');
    const [userExplanation, setUserExplanation] = useState('');
    const [assessments, setAssessments] = useState<Map<string, AssessmentResult>>(new Map());
    const [isAssessing, setIsAssessing] = useState(false);

    const currentChunk = content.chunks[currentChunkIndex];
    const totalChunks = content.chunks.length;
    const completedChunks = assessments.size;

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
            {/* Progress Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">
                        Concept {currentChunkIndex + 1} of {totalChunks}
                    </span>
                    <span className="text-xs text-white/40">
                        {Math.round(progress)}% complete
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* All Complete */}
            {allComplete && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
                        <span className="text-4xl mb-4 block">🎉</span>
                        <h3 className="text-lg font-bold text-white mb-2">Lesson Complete!</h3>
                        <p className="text-sm text-white/70">{content.completionMessage}</p>
                        <div className="mt-4 flex gap-2 justify-center">
                            {content.chunks.map((_, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"
                                >
                                    <span className="text-green-400">✓</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Learning Phase */}
            {!allComplete && phase === 'learning' && (
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-white/10 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🧠</span>
                            <h3 className="text-sm font-semibold text-white">{currentChunk.concept}</h3>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                            {currentChunk.aiExplanation}
                        </p>
                    </div>

                    <button
                        onClick={handleStartExplaining}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium text-sm transition-colors"
                    >
                        I'm ready to explain! →
                    </button>
                </div>
            )}

            {/* Explaining Phase */}
            {!allComplete && phase === 'explaining' && (
                <div className="flex-1 flex flex-col">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                        <h4 className="text-sm font-medium text-amber-400 mb-2">🎤 Your turn!</h4>
                        <p className="text-sm text-white/70">{currentChunk.promptForStudent}</p>
                    </div>

                    <textarea
                        value={userExplanation}
                        onChange={(e) => setUserExplanation(e.target.value)}
                        placeholder="Explain the concept in your own words..."
                        className="flex-1 min-h-[150px] p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20"
                    />

                    <button
                        onClick={handleSubmitExplanation}
                        disabled={!userExplanation.trim() || isAssessing}
                        className="mt-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl text-white font-medium text-sm transition-colors"
                    >
                        {isAssessing ? 'Checking...' : 'Submit my explanation'}
                    </button>
                </div>
            )}

            {/* Feedback Phase */}
            {!allComplete && phase === 'feedback' && currentAssessment && (
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {/* Score */}
                    <div className={`rounded-xl p-4 border mb-4 ${currentAssessment.level === 'excellent' ? 'bg-green-500/10 border-green-500/20' :
                            currentAssessment.level === 'good' ? 'bg-blue-500/10 border-blue-500/20' :
                                'bg-amber-500/10 border-amber-500/20'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">
                                {currentAssessment.level === 'excellent' ? '🌟' :
                                    currentAssessment.level === 'good' ? '👍' : '💪'}
                            </span>
                            <span className={`text-2xl font-bold ${currentAssessment.level === 'excellent' ? 'text-green-400' :
                                    currentAssessment.level === 'good' ? 'text-blue-400' :
                                        'text-amber-400'
                                }`}>
                                {currentAssessment.score}%
                            </span>
                        </div>
                        <p className="text-sm text-white/80">{currentAssessment.feedback}</p>
                    </div>

                    {/* Matched Points */}
                    {currentAssessment.matchedKeyPoints.length > 0 && (
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 mb-3">
                            <h5 className="text-xs font-semibold text-green-400 mb-2">✓ You covered:</h5>
                            <ul className="space-y-1">
                                {currentAssessment.matchedKeyPoints.map((point, i) => (
                                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                        <span className="text-green-400">•</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Missed Points */}
                    {currentAssessment.missedKeyPoints.length > 0 && (
                        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20 mb-3">
                            <h5 className="text-xs font-semibold text-amber-400 mb-2">Areas to improve:</h5>
                            <ul className="space-y-1">
                                {currentAssessment.missedKeyPoints.map((point, i) => (
                                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        onClick={handleContinue}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium text-sm transition-colors"
                    >
                        {currentAssessment.shouldRetry
                            ? 'Try again →'
                            : currentChunkIndex < totalChunks - 1
                                ? 'Next concept →'
                                : 'Finish lesson'
                        }
                    </button>
                </div>
            )}
        </div>
    );
}
