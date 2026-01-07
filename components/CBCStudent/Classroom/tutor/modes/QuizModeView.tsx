"use client";

import React, { useState, useEffect } from 'react';
import { QuizOutput, QuizQuestion, AssessmentResult } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';
import axios from 'axios';
import VoiceVisualization from '@/components/shared/VoiceVisualization';
import { HiOutlineMicrophone, HiOutlineStop } from 'react-icons/hi2';

interface QuizModeViewProps {
    quiz: QuizOutput;
}

interface QuizState {
    currentIndex: number;
    answers: Map<string, string>;
    showResult: boolean;
    showFinalResults: boolean;
    isAssessing: boolean;
    isSaving: boolean;
    hasSaved: boolean;
    explanationAssessments: Map<string, AssessmentResult>;
}

export default function QuizModeView({ quiz }: QuizModeViewProps) {
    const { audio, startListening, stopListening, setAudioState, context, exitMode } = useTutor();
    const { addXP, showXPPopup } = useGamification();
    const { user } = useAuth();

    const [state, setState] = useState<QuizState>({
        currentIndex: 0,
        answers: new Map(),
        showResult: false,
        showFinalResults: false,
        isAssessing: false,
        isSaving: false,
        hasSaved: false,
        explanationAssessments: new Map(),
    });
    const [userExplanation, setUserExplanation] = useState('');
    const [streakMultiplier, setStreakMultiplier] = useState(1);
    const [correctStreak, setCorrectStreak] = useState(0);

    const currentQuestion = quiz.questions[state.currentIndex];
    const isLastQuestion = state.currentIndex === quiz.questions.length - 1;
    const selectedAnswer = state.answers.get(currentQuestion?.id);
    const isExplanationQuestion = currentQuestion?.type === 'explanation';

    // Update explanation from audio transcript
    useEffect(() => {
        if (audio.transcript) {
            setUserExplanation(audio.transcript);
        }
    }, [audio.transcript]);

    // Calculate score
    const calculateScore = () => {
        let correct = 0;
        let total = quiz.questions.length;

        quiz.questions.forEach((q) => {
            if (q.type === 'explanation') {
                const assessment = state.explanationAssessments.get(q.id);
                if (assessment) {
                    // Count as correct if score >= 60%
                    if (assessment.score >= 60) correct++;
                }
            } else {
                const answer = state.answers.get(q.id);
                if (answer === q.correctAnswer) {
                    correct++;
                }
            }
        });

        return Math.round((correct / total) * 100);
    };

    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    // Handle choice question answer selection
    const handleSelectAnswer = (answer: string) => {
        if (state.showResult) return;
        setState(prev => ({
            ...prev,
            answers: new Map(prev.answers).set(currentQuestion.id, answer),
        }));
    };

    // Submit choice question answer
    const handleSubmitChoiceAnswer = async () => {
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        if (isCorrect) {
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);
            if (newStreak >= 3 && streakMultiplier < 2) {
                setStreakMultiplier(1.25);
            } else if (newStreak >= 5) {
                setStreakMultiplier(1.5);
            }
            // Award XP for correct multiple choice answer
            const xpAmount = Math.round(XP_CONFIG.quizCorrect * streakMultiplier);
            await addXP(xpAmount, 'quiz', `Correct answer: ${currentQuestion.question.substring(0, 30)}...`);
            showXPPopup(xpAmount);
        } else {
            setCorrectStreak(0);
            setStreakMultiplier(1);
        }

        setState(prev => ({ ...prev, showResult: true }));
    };

    // Submit explanation question answer
    const handleSubmitExplanation = async () => {
        if (!userExplanation.trim()) return;

        // Stop listening if still active
        if (audio.isListening) {
            stopListening();
        }

        setState(prev => ({ ...prev, isAssessing: true }));

        try {
            // Call AI assessment API
            const response = await axios.post('/api/tutor/assess', {
                studentAnswer: userExplanation,
                concept: currentQuestion.concept,
                keyPointsToCheck: currentQuestion.expectedKeyPoints || [],
                rubric: currentQuestion.scoringRubric || {
                    excellent: ['Complete understanding', 'Clear explanation'],
                    good: ['Partial understanding'],
                    needsWork: ['Missing key concepts']
                },
                promptForStudent: currentQuestion.question,
            });

            const assessment: AssessmentResult = {
                chunkId: currentQuestion.id,
                score: response.data.score,
                level: response.data.level,
                matchedKeyPoints: response.data.matchedKeyPoints,
                missedKeyPoints: response.data.missedKeyPoints,
                feedback: response.data.feedback,
                shouldRetry: response.data.shouldRetry,
            };

            setState(prev => ({
                ...prev,
                explanationAssessments: new Map(prev.explanationAssessments).set(currentQuestion.id, assessment),
                showResult: true,
                isAssessing: false,
            }));

            // Update streak based on score
            if (assessment.score >= 60) {
                const newStreak = correctStreak + 1;
                setCorrectStreak(newStreak);
                if (newStreak >= 3 && streakMultiplier < 2) {
                    setStreakMultiplier(1.25);
                } else if (newStreak >= 5) {
                    setStreakMultiplier(1.5);
                }
            } else {
                setCorrectStreak(0);
                setStreakMultiplier(1);
            }

            // Award XP based on explanation score (higher than multiple choice)
            // Excellent (80%+): 15 XP, Good (60-79%): 10 XP, Needs Work (<60%): 5 XP
            const baseXP = assessment.level === 'excellent' ? 15 :
                assessment.level === 'good' ? 10 : 5;
            const xpAmount = Math.round(baseXP * streakMultiplier);
            await addXP(xpAmount, 'quiz', `Explanation: ${currentQuestion.concept || currentQuestion.question.substring(0, 30)}...`);
            showXPPopup(xpAmount);
        } catch (error) {
            console.error('Assessment failed:', error);
            // Fallback assessment
            const fallbackAssessment: AssessmentResult = {
                chunkId: currentQuestion.id,
                score: 50,
                level: 'needs-work',
                matchedKeyPoints: [],
                missedKeyPoints: currentQuestion.expectedKeyPoints || [],
                feedback: 'Unable to assess your explanation. Please try again.',
                shouldRetry: true,
            };
            setState(prev => ({
                ...prev,
                explanationAssessments: new Map(prev.explanationAssessments).set(currentQuestion.id, fallbackAssessment),
                showResult: true,
                isAssessing: false,
            }));
        } finally {
            // Clear transcript for next input
            setAudioState(prev => ({ ...prev, transcript: '' }));
        }
    };

    // Move to next question
    const handleNext = async () => {
        if (isLastQuestion) {
            setState(prev => ({ ...prev, showFinalResults: true }));
            // Award XP for completing quiz
            const xpAmount = Math.round(XP_CONFIG.quizComplete * streakMultiplier);
            await addXP(xpAmount, 'quiz', `Completed quiz: ${quiz.title}`);
            showXPPopup(xpAmount);
        } else {
            setState(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1,
                showResult: false,
            }));
            setUserExplanation('');
        }
    };

    // Retry quiz
    const handleRetry = () => {
        setState({
            currentIndex: 0,
            answers: new Map(),
            showResult: false,
            showFinalResults: false,
            isAssessing: false,
            isSaving: false,
            hasSaved: false,
            explanationAssessments: new Map(),
        });
        setUserExplanation('');
        setStreakMultiplier(1);
        setCorrectStreak(0);
    };

    // Save results when final results shown
    useEffect(() => {
        if (state.showFinalResults && !state.hasSaved && user && context) {
            const saveResults = async () => {
                setState(prev => ({ ...prev, isSaving: true }));
                try {
                    const answers = quiz.questions.map(q => ({
                        questionId: q.id,
                        userAnswer: q.type === 'explanation'
                            ? (state.explanationAssessments.get(q.id)?.feedback || '')
                            : (state.answers.get(q.id) || ''),
                        isCorrect: q.type === 'explanation'
                            ? (state.explanationAssessments.get(q.id)?.score || 0) >= 60
                            : state.answers.get(q.id) === q.correctAnswer,
                    }));

                    await axios.post('/api/user/activity', {
                        userId: user.uid,
                        type: 'quiz',
                        context: {
                            grade: context.grade,
                            subject: context.subject,
                            strand: context.strand,
                            substrand: context.substrand,
                        },
                        score,
                        totalQuestions: quiz.questions.length,
                        answers,
                    });
                    setState(prev => ({ ...prev, isSaving: false, hasSaved: true }));
                } catch (error) {
                    console.error('Failed to save quiz results:', error);
                    setState(prev => ({ ...prev, isSaving: false }));
                }
            };
            saveResults();
        }
    }, [state.showFinalResults, state.hasSaved, user, context, quiz, score, state.answers, state.explanationAssessments]);

    const isCorrect = !isExplanationQuestion && selectedAnswer === currentQuestion?.correctAnswer;
    const currentAssessment = isExplanationQuestion ? state.explanationAssessments.get(currentQuestion?.id) : null;
    const isExplanationCorrect = currentAssessment && currentAssessment.score >= 60;

    // Final Results View
    if (state.showFinalResults) {
        return (
            <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">
                <div className="text-center py-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${passed ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                        {passed ? (
                            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h2 className="text-lg font-bold text-white mb-1">
                        {passed ? 'Excellent Work!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-sm text-white/60 mb-4">
                        {passed
                            ? `You scored ${score}% on this quiz`
                            : `You scored ${score}%. You need ${quiz.passingScore}% to pass.`}
                    </p>

                    {/* Score display */}
                    <div className="inline-flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{score}%</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Your Score</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white/50">{quiz.passingScore}%</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider">Passing</p>
                        </div>
                    </div>

                    {/* Streak bonus if applicable */}
                    {streakMultiplier > 1 && (
                        <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg inline-block">
                            <span className="text-xs text-amber-400">🔥 {streakMultiplier}x Streak Bonus Applied!</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2.5 rounded-full font-medium bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
                        >
                            Retry Quiz
                        </button>
                        <button
                            onClick={exitMode}
                            className="px-6 py-2.5 rounded-full font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors text-sm"
                        >
                            Back to Lesson
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Question View
    return (
        <div className="flex flex-col h-full">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest text-white/40">
                    Question {state.currentIndex + 1} / {quiz.questions.length}
                </span>
                <div className="flex items-center gap-2">
                    {streakMultiplier > 1 && (
                        <span className="text-xs text-amber-400 font-medium">
                            🔥 {streakMultiplier}x
                        </span>
                    )}
                    <span className="text-xs text-white/60">
                        +{Math.round((isExplanationQuestion ? 15 : XP_CONFIG.quizCorrect) * streakMultiplier)} XP
                    </span>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 mb-4">
                {quiz.questions.map((_, index) => (
                    <div
                        key={index}
                        className={`flex-1 h-1 rounded-full ${index < state.currentIndex
                            ? 'bg-emerald-500'
                            : index === state.currentIndex
                                ? 'bg-sky-500'
                                : 'bg-white/10'
                            }`}
                    />
                ))}
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Question */}
                <div className="mb-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-2 ${currentQuestion.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-400'
                        : currentQuestion.difficulty === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                        {currentQuestion.difficulty}
                    </span>
                    {isExplanationQuestion && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-2 ml-2 bg-purple-500/20 text-purple-400">
                            Explanation
                        </span>
                    )}
                    <h3 className="text-sm font-medium text-white leading-relaxed">
                        {currentQuestion.question}
                    </h3>
                </div>

                {/* Choice Options (for multiple_choice and true_false) */}
                {!isExplanationQuestion && (
                    <div className="space-y-2 mb-4">
                        {currentQuestion.options?.map((option, index) => {
                            const optionLetter = option.charAt(0);
                            const isSelected = selectedAnswer === optionLetter;
                            const isCorrectOption = optionLetter === currentQuestion.correctAnswer;

                            let optionClass = 'bg-white/5 border-white/10 hover:bg-white/10';
                            if (state.showResult) {
                                if (isCorrectOption) {
                                    optionClass = 'bg-green-500/20 border-green-500/50';
                                } else if (isSelected && !isCorrectOption) {
                                    optionClass = 'bg-red-500/20 border-red-500/50';
                                }
                            } else if (isSelected) {
                                optionClass = 'bg-sky-500/20 border-sky-500/50';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectAnswer(optionLetter)}
                                    disabled={state.showResult}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${optionClass}`}
                                >
                                    <span className="text-white/80">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Explanation Input (for explanation type questions) */}
                {isExplanationQuestion && !state.showResult && (
                    <div className="space-y-3 mb-4">
                        <div className="relative">
                            <textarea
                                value={userExplanation}
                                onChange={(e) => setUserExplanation(e.target.value)}
                                placeholder="Type or speak your explanation here..."
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-sky-500/50 transition-colors p-3 pr-12"
                            />
                            <button
                                onClick={audio.isListening ? stopListening : startListening}
                                className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${audio.isListening
                                    ? 'bg-red-500 text-white scale-110 animate-pulse'
                                    : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                                    }`}
                            >
                                {audio.isListening ? (
                                    <HiOutlineStop className="w-4 h-4" />
                                ) : (
                                    <HiOutlineMicrophone className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {audio.isListening && (
                            <div className="flex items-center gap-3 py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                <VoiceVisualization isActive={true} color="bg-red-500" />
                                <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">Recording...</span>
                            </div>
                        )}

                        {audio.isTranscribing && (
                            <div className="flex items-center gap-3 py-2 px-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
                                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-sky-500 uppercase font-bold tracking-widest">Transcribing...</span>
                            </div>
                        )}

                        {currentQuestion.hint && (
                            <p className="text-xs text-white/40 italic">
                                💡 Hint: {currentQuestion.hint}
                            </p>
                        )}
                    </div>
                )}

                {/* Choice Question Result */}
                {state.showResult && !isExplanationQuestion && (
                    <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                        }`}>
                        <p className={`font-medium mb-1 text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </p>
                        <p className="text-white/70 text-xs leading-relaxed">
                            {currentQuestion.explanation}
                        </p>
                    </div>
                )}

                {/* Explanation Question Result */}
                {state.showResult && isExplanationQuestion && currentAssessment && (
                    <div className="space-y-3 mb-4">
                        {/* Score */}
                        <div className={`p-3 rounded-lg ${isExplanationCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium text-sm ${isExplanationCorrect ? 'text-green-400' : 'text-amber-400'
                                    }`}>
                                    {currentAssessment.level === 'excellent' ? '🌟 Excellent!' :
                                        currentAssessment.level === 'good' ? '👍 Good!' : '📚 Keep Learning'}
                                </span>
                                <span className={`text-lg font-bold ${currentAssessment.level === 'excellent' ? 'text-emerald-400' :
                                    currentAssessment.level === 'good' ? 'text-sky-400' : 'text-amber-400'
                                    }`}>
                                    {currentAssessment.score}%
                                </span>
                            </div>
                            <p className="text-white/70 text-xs leading-relaxed italic">
                                {currentAssessment.feedback}
                            </p>
                        </div>

                        {/* Key Points */}
                        {currentAssessment.matchedKeyPoints.length > 0 && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">You got right:</h5>
                                <ul className="space-y-1">
                                    {currentAssessment.matchedKeyPoints.map((point, i) => (
                                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                            <span className="text-emerald-500">✓</span>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {currentAssessment.missedKeyPoints.length > 0 && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">To improve:</h5>
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

                        {/* 100% Score Response */}
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                            <h5 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">100% Score Response:</h5>
                            <p className="text-xs text-white/70 leading-relaxed">
                                {currentQuestion.correctAnswer}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10">
                {!state.showResult ? (
                    isExplanationQuestion ? (
                        <button
                            onClick={handleSubmitExplanation}
                            disabled={!userExplanation.trim() || state.isAssessing}
                            className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${userExplanation.trim() && !state.isAssessing
                                ? 'bg-sky-500 text-white hover:bg-sky-600'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            {state.isAssessing ? 'Assessing...' : 'Submit Explanation'}
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmitChoiceAnswer}
                            disabled={!selectedAnswer}
                            className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${selectedAnswer
                                ? 'bg-sky-500 text-white hover:bg-sky-600'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            Submit Answer
                        </button>
                    )
                ) : (
                    <button
                        onClick={handleNext}
                        className="w-full py-2.5 rounded-lg font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors text-xs"
                    >
                        {isLastQuestion ? 'See Results' : 'Next Question →'}
                    </button>
                )}
            </div>
        </div>
    );
}
