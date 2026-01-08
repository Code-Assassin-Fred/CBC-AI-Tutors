"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ImmersiveContent, ImmersiveChunk, AssessmentResult } from '@/lib/types/agents';
import { useCourses } from '@/lib/context/CoursesContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiOutlineMicrophone, HiOutlineStop, HiOutlineSpeakerWave } from 'react-icons/hi2';

interface CourseImmersiveViewProps {
    content: ImmersiveContent;
}

export default function CourseImmersiveView({ content }: CourseImmersiveViewProps) {
    const { speak, isPlaying, stopSpeaking, currentCourse } = useCourses();
    const { user } = useAuth();
    const { addXP, showXPPopup } = useGamification();
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [userExplanation, setUserExplanation] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
    const [assessments, setAssessments] = useState<Map<string, { result: AssessmentResult; response: string }>>(new Map());
    const [isListening, setIsListening] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const currentChunk = content.chunks[currentChunkIndex];
    const isLastChunk = currentChunkIndex === content.chunks.length - 1;

    // Initialize Web Speech API
    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let transcript = '';
                for (let i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setUserExplanation(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const handleListenExplanation = () => {
        if (isPlaying) {
            stopSpeaking();
        } else if (currentChunk) {
            speak(currentChunk.aiExplanation);
        }
    };

    const assessExplanation = (chunk: ImmersiveChunk, explanation: string): AssessmentResult => {
        const lowerExplanation = explanation.toLowerCase();
        const matchedPoints: string[] = [];
        const missedPoints: string[] = [];

        chunk.keyPointsToCheck.forEach(point => {
            // Simple keyword matching
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

    const handleSubmitExplanation = async () => {
        if (!userExplanation.trim() || !currentChunk) return;

        // Stop listening if active
        if (isListening) {
            stopListening();
        }

        const result = assessExplanation(currentChunk, userExplanation);
        setAssessment(result);
        setAssessments(prev => new Map(prev).set(currentChunk.id, { result, response: userExplanation }));
        setShowFeedback(true);

        // Award XP based on assessment level
        const xpAmount = result.level === 'excellent' ? 8 : result.level === 'good' ? 6 : XP_CONFIG.immersiveChunk;
        await addXP(xpAmount, 'immersive', `Practice: ${currentChunk.concept}`);
        showXPPopup(xpAmount);
    };

    // Save session results to Firebase
    const saveSessionResults = async () => {
        if (!user || !currentCourse) return;

        setIsSaving(true);
        try {
            const assessmentData = Array.from(assessments.values()).map(({ result, response }) => ({
                chunkId: result.chunkId,
                score: result.score,
                level: result.level,
                matchedKeyPoints: result.matchedKeyPoints,
                missedKeyPoints: result.missedKeyPoints,
                studentResponse: response,
            }));

            const averageScore = assessmentData.length > 0
                ? Math.round(assessmentData.reduce((sum, a) => sum + a.score, 0) / assessmentData.length)
                : 0;

            await fetch('/api/courses/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    courseId: currentCourse.id,
                    type: 'practice',
                    assessments: assessmentData,
                    averageScore,
                    totalChunks: content.chunks.length,
                    completedAt: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('Failed to save practice session:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleContinue = () => {
        if (isLastChunk) {
            // Save session results
            saveSessionResults();

            // Show completion message
            setAssessment({
                chunkId: 'complete',
                score: 100,
                level: 'excellent',
                matchedKeyPoints: [],
                missedKeyPoints: [],
                feedback: content.completionMessage || 'Congratulations! You have completed this immersive lesson.',
                shouldRetry: false,
            });
            setShowFeedback(true);
        } else {
            setCurrentChunkIndex(prev => prev + 1);
            setUserExplanation('');
            setShowFeedback(false);
            setAssessment(null);
        }
    };

    const handleRetry = () => {
        setUserExplanation('');
        setShowFeedback(false);
        setAssessment(null);
    };

    const progress = ((currentChunkIndex + (showFeedback ? 1 : 0)) / content.chunks.length) * 100;
    const allComplete = assessment?.chunkId === 'complete';

    return (
        <div className="space-y-6">
            {/* Progress indicator */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        Section {currentChunkIndex + 1} / {content.chunks.length}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {content.chunks.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full flex-1 transition-all ${index < currentChunkIndex
                                ? 'bg-emerald-500'
                                : index === currentChunkIndex
                                    ? 'bg-emerald-500/50'
                                    : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* All Complete */}
            {allComplete && (
                <div className="flex-1 flex items-center justify-center py-8">
                    <div className="text-center w-full">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Lesson Complete</h3>
                        <p className="text-sm text-white/60 leading-relaxed max-w-xs mx-auto mb-6">{assessment?.feedback}</p>
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

            {/* Introduction (only on first chunk) */}
            {currentChunkIndex === 0 && content.introduction && !allComplete && (
                <p className="text-white/60 text-sm leading-relaxed">{content.introduction}</p>
            )}

            {/* Current Chunk - Learning Phase */}
            {currentChunk && !showFeedback && !allComplete && (
                <div className="space-y-6">
                    {/* Concept Title */}
                    <div>
                        <span className="text-xs font-medium text-sky-400 uppercase tracking-wider">
                            Concept {currentChunk.order} of {content.chunks.length}
                        </span>
                        <h3 className="text-lg font-semibold text-white mt-1">
                            {currentChunk.concept}
                        </h3>
                    </div>

                    {/* AI Explanation */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">
                                {(userExplanation.trim() || isListening) ? 'Explanation (hidden to test your understanding)' : 'Explanation'}
                            </span>
                            <button
                                onClick={handleListenExplanation}
                                disabled={userExplanation.trim().length > 0 || isListening}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${isPlaying
                                    ? 'bg-sky-500/20 text-sky-400'
                                    : (userExplanation.trim() || isListening)
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                                    }`}
                            >
                                {isPlaying ? (
                                    <>
                                        <HiOutlineStop className="w-3.5 h-3.5" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineSpeakerWave className="w-3.5 h-3.5" />
                                        Listen
                                    </>
                                )}
                            </button>
                        </div>
                        <p className={`leading-relaxed whitespace-pre-wrap transition-all duration-300 select-none ${(userExplanation.trim() || isListening)
                            ? 'blur-md text-white/30 pointer-events-none'
                            : 'text-white/70'
                            }`}>
                            {currentChunk.aiExplanation}
                        </p>
                    </div>

                    {/* Student Response */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-white/70">
                            {currentChunk.promptForStudent}
                        </label>
                        <div className="relative">
                            <textarea
                                value={userExplanation}
                                onChange={(e) => setUserExplanation(e.target.value)}
                                placeholder="Type or speak your explanation here..."
                                className="w-full h-32 px-4 py-3 pr-12 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 resize-none"
                            />
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`absolute right-3 bottom-3 p-2.5 rounded-full transition-all ${isListening
                                    ? 'bg-red-500 text-white scale-110 animate-pulse'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                    }`}
                                title={isListening ? 'Stop recording' : 'Start voice input'}
                            >
                                <HiOutlineMicrophone className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Recording indicator */}
                        {isListening && (
                            <div className="flex items-center gap-3 py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                <VoiceVisualization isActive={true} color="bg-red-500" />
                                <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">Recording...</span>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmitExplanation}
                                disabled={!userExplanation.trim()}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all ${userExplanation.trim()
                                    ? 'bg-sky-500 text-white hover:bg-sky-600'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Submit Explanation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback */}
            {showFeedback && assessment && !allComplete && (
                <div className="space-y-6">
                    {/* Score Summary */}
                    <div className="pb-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase tracking-widest text-white/40">Assessment Result</span>
                            <span className={`text-xl font-bold font-mono ${assessment.level === 'excellent' ? 'text-emerald-400' :
                                assessment.level === 'good' ? 'text-sky-400' : 'text-amber-400'
                                }`}>
                                {assessment.score}%
                            </span>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed italic">{assessment.feedback}</p>
                    </div>

                    {/* Checkpoints */}
                    <div className="space-y-4">
                        {assessment.matchedKeyPoints.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Concept Clarity</h5>
                                <ul className="space-y-1">
                                    {assessment.matchedKeyPoints.map((point, i) => (
                                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                            <span className="text-emerald-500">•</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {assessment.missedKeyPoints.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Points to Refine</h5>
                                <ul className="space-y-1">
                                    {assessment.missedKeyPoints.map((point, i) => (
                                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        {assessment.shouldRetry && (
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                        <button
                            onClick={handleContinue}
                            className="px-4 py-2.5 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
                        >
                            {assessment.shouldRetry ? 'Refine Explanation' : isLastChunk ? 'Complete Lesson' : 'Continue'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
