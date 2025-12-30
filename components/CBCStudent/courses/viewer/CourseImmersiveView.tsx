"use client";

import { useState } from 'react';
import { ImmersiveContent, ImmersiveChunk } from '@/lib/types/agents';
import { useCourses } from '@/lib/context/CoursesContext';

interface CourseImmersiveViewProps {
    content: ImmersiveContent;
}

export default function CourseImmersiveView({ content }: CourseImmersiveViewProps) {
    const { speak, isPlaying } = useCourses();
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [userExplanation, setUserExplanation] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState<{ level: string; message: string } | null>(null);

    const currentChunk = content.chunks[currentChunkIndex];
    const isLastChunk = currentChunkIndex === content.chunks.length - 1;

    const handleListenExplanation = () => {
        if (currentChunk) {
            speak(currentChunk.aiExplanation);
        }
    };

    const handleSubmitExplanation = () => {
        if (!userExplanation.trim() || !currentChunk) return;

        // Simple assessment based on key points
        const explanation = userExplanation.toLowerCase();
        const matchedPoints = currentChunk.keyPointsToCheck.filter(point =>
            explanation.includes(point.toLowerCase().split(' ')[0])
        );

        const score = matchedPoints.length / currentChunk.keyPointsToCheck.length;

        let level: string;
        let message: string;

        if (score >= 0.7) {
            level = 'excellent';
            message = "Excellent! You've demonstrated a strong understanding of this concept.";
        } else if (score >= 0.4) {
            level = 'good';
            message = "Good effort! You've covered some key points. Consider reviewing the explanation again.";
        } else {
            level = 'needs-work';
            message = currentChunk.followUpIfStruggling || "Let's try again. Focus on the key concepts mentioned in the explanation.";
        }

        setFeedback({ level, message });
        setShowFeedback(true);
    };

    const handleContinue = () => {
        if (isLastChunk) {
            // Show completion message
            setFeedback({
                level: 'complete',
                message: content.completionMessage || 'Congratulations! You have completed this immersive lesson.',
            });
            setShowFeedback(true);
        } else {
            setCurrentChunkIndex(prev => prev + 1);
            setUserExplanation('');
            setShowFeedback(false);
            setFeedback(null);
        }
    };

    const handleRetry = () => {
        setUserExplanation('');
        setShowFeedback(false);
        setFeedback(null);
    };

    return (
        <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
                {content.chunks.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full flex-1 transition-all ${index < currentChunkIndex
                            ? 'bg-violet-500'
                            : index === currentChunkIndex
                                ? 'bg-violet-500/50'
                                : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>

            {/* Introduction (only on first chunk) */}
            {currentChunkIndex === 0 && content.introduction && (
                <p className="text-white/60 text-sm leading-relaxed">{content.introduction}</p>
            )}

            {/* Current Chunk */}
            {currentChunk && !showFeedback && (
                <div className="space-y-6">
                    {/* Concept Title */}
                    <div>
                        <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                            Concept {currentChunk.order} of {content.chunks.length}
                        </span>
                        <h3 className="text-lg font-semibold text-white mt-1">
                            {currentChunk.concept}
                        </h3>
                    </div>

                    {/* AI Explanation */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40">Explanation</span>
                            <button
                                onClick={handleListenExplanation}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${isPlaying
                                    ? 'bg-white/10 text-white/80'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                Listen
                            </button>
                        </div>
                        <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                            {currentChunk.aiExplanation}
                        </p>
                    </div>

                    {/* Student Response */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            {currentChunk.promptForStudent}
                        </label>
                        <textarea
                            value={userExplanation}
                            onChange={(e) => setUserExplanation(e.target.value)}
                            placeholder="Type your explanation here..."
                            className="w-full h-32 px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleSubmitExplanation}
                                disabled={!userExplanation.trim()}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all ${userExplanation.trim()
                                    ? 'bg-violet-500 text-white hover:bg-violet-600'
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
            {showFeedback && feedback && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-white/50 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {feedback.level === 'excellent' || feedback.level === 'complete' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white/80">
                                {feedback.level === 'excellent' ? 'Excellent Work!' :
                                    feedback.level === 'good' ? 'Good Effort!' :
                                        feedback.level === 'complete' ? 'Lesson Complete!' :
                                            'Keep Trying!'}
                            </p>
                            <p className="text-sm text-white/50 mt-1">
                                {feedback.message}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3">
                        {feedback.level === 'needs-work' && (
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                        {feedback.level !== 'complete' && (
                            <button
                                onClick={handleContinue}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
                            >
                                {isLastChunk ? 'Complete Lesson' : 'Continue'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
