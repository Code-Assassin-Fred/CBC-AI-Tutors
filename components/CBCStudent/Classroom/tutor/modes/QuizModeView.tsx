"use client";

import React, { useState, useCallback } from 'react';
import { QuizOutput } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useGamification } from '@/lib/context/GamificationContext';
import { ComboIndicator, XPPopup } from '@/components/gamification';
import { getComboMultiplier, XP_CONFIG } from '@/types/gamification';
import axios from 'axios';

interface QuizModeViewProps {
    quiz: QuizOutput;
}

interface QuizState {
    currentIndex: number;
    answers: Map<string, string>;
    showResult: boolean;
    showFinalResults: boolean;
    isSaving: boolean;
    isAssessing: boolean;
    aiSummary?: string;
    fillBlankCorrect?: boolean;
    // Gamification
    combo: number;
    xpEarned: number;
}

interface XPPopupData {
    amount: number;
    x: number;
    y: number;
    id: number;
}

export default function QuizModeView({ quiz }: QuizModeViewProps) {
    const { exitMode } = useTutor();
    const { user } = useAuth();
    const { context } = useTutor();
    const { addXP, showXPPopup } = useGamification();

    const [state, setState] = useState<QuizState>({
        currentIndex: 0,
        answers: new Map(),
        showResult: false,
        showFinalResults: false,
        isSaving: false,
        isAssessing: false,
        combo: 0,
        xpEarned: 0,
    });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [localXPPopup, setLocalXPPopup] = useState<XPPopupData | null>(null);

    const currentQuestion = quiz.questions[state.currentIndex];
    const totalQuestions = quiz.questions.length;

    // Calculate scores
    const correctAnswers = Array.from(state.answers.entries()).filter(([qId, answer]) => {
        const question = quiz.questions.find(q => q.id === qId);
        return question?.correctAnswer === answer;
    }).length;

    const wrongAnswers = state.answers.size - correctAnswers;
    const progress = ((state.currentIndex + (state.showResult ? 1 : 0)) / totalQuestions) * 100;

    // Award XP for correct answer
    const awardQuestionXP = useCallback(async (isCorrect: boolean, isHard: boolean) => {
        if (!isCorrect) {
            // Reset combo on wrong answer
            setState(prev => ({ ...prev, combo: 0 }));
            return;
        }

        const newCombo = state.combo + 1;
        const multiplier = getComboMultiplier(newCombo);
        const baseXP = isHard ? XP_CONFIG.quizCorrectHard : XP_CONFIG.quizCorrect;
        const xpAmount = Math.floor(baseXP * multiplier);

        // Update local state
        setState(prev => ({
            ...prev,
            combo: newCombo,
            xpEarned: prev.xpEarned + xpAmount,
        }));

        // Show XP popup
        setLocalXPPopup({
            amount: xpAmount,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 - 50,
            id: Date.now(),
        });

        // Award XP via context
        await addXP(baseXP, 'quiz', `Quiz question correct`, multiplier);

        // Clear popup after animation
        setTimeout(() => setLocalXPPopup(null), 1500);
    }, [state.combo, addXP]);

    const handleSelectAnswer = async (answer: string) => {
        if (state.showResult) return;
        setSelectedAnswer(answer);

        // Auto-submit for multiple choice and true/false questions
        if (currentQuestion.type !== 'fill_blank') {
            const isCorrect = answer === currentQuestion.correctAnswer ||
                String.fromCharCode(65 + (currentQuestion.options?.indexOf(currentQuestion.correctAnswer) ?? -1)) === answer;
            const isHard = currentQuestion.difficulty === 'hard';

            const newAnswers = new Map(state.answers);
            newAnswers.set(currentQuestion.id, answer);

            setState(prev => ({
                ...prev,
                answers: newAnswers,
                showResult: true,
            }));

            // Award XP after state update
            await awardQuestionXP(isCorrect, isHard);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer) return;

        // For fill-blank questions, use AI assessment
        if (currentQuestion.type === 'fill_blank') {
            setState(prev => ({ ...prev, isAssessing: true }));

            try {
                const response = await axios.post('/api/tutor/assess', {
                    studentAnswer: selectedAnswer,
                    concept: currentQuestion.concept,
                    keyPointsToCheck: [currentQuestion.correctAnswer],
                    rubric: {
                        excellent: ['Correct answer or semantically equivalent'],
                        good: ['Partially correct'],
                        needsWork: ['Incorrect answer'],
                    },
                    promptForStudent: currentQuestion.question,
                });

                const isCorrectByAI = response.data.score >= 70;
                const newAnswers = new Map(state.answers);
                // Store the correct answer if AI says it's correct (for scoring)
                newAnswers.set(currentQuestion.id, isCorrectByAI ? currentQuestion.correctAnswer : selectedAnswer);

                setState(prev => ({
                    ...prev,
                    answers: newAnswers,
                    showResult: true,
                    isAssessing: false,
                    fillBlankCorrect: isCorrectByAI,
                }));

                // Award XP for fill-blank
                await awardQuestionXP(isCorrectByAI, currentQuestion.difficulty === 'hard');
            } catch (error) {
                console.error('Fill-blank assessment failed:', error);
                const newAnswers = new Map(state.answers);
                newAnswers.set(currentQuestion.id, selectedAnswer);
                setState(prev => ({
                    ...prev,
                    answers: newAnswers,
                    showResult: true,
                    isAssessing: false,
                }));
            }
        } else {
            const newAnswers = new Map(state.answers);
            newAnswers.set(currentQuestion.id, selectedAnswer);

            setState({
                ...state,
                answers: newAnswers,
                showResult: true,
            });
        }
    };

    const handleNext = async () => {
        if (state.currentIndex < totalQuestions - 1) {
            setState({
                ...state,
                currentIndex: state.currentIndex + 1,
                showResult: false,
            });
            setSelectedAnswer(null);
        } else {
            // Check for perfect quiz bonus
            const isPerfect = correctAnswers === totalQuestions;
            if (isPerfect) {
                await addXP(XP_CONFIG.perfectQuizBonus, 'quiz', 'Perfect quiz bonus!');
                setState(prev => ({
                    ...prev,
                    showFinalResults: true,
                    isSaving: true,
                    xpEarned: prev.xpEarned + XP_CONFIG.perfectQuizBonus,
                }));
            } else {
                setState(prev => ({ ...prev, showFinalResults: true, isSaving: true }));
            }
            saveResults();
        }
    };

    const saveResults = async () => {
        if (!user || !context) {
            setState(prev => ({ ...prev, isSaving: false }));
            return;
        }

        try {
            const response = await axios.post('/api/user/activity', {
                userId: user.uid,
                type: 'quiz',
                context: {
                    grade: context.grade,
                    subject: context.subject,
                    strand: context.strand,
                    substrand: context.substrand,
                },
                score,
                totalQuestions,
                answers: Array.from(state.answers.entries()).map(([qId, answer]) => ({
                    questionId: qId,
                    userAnswer: answer,
                    isCorrect: quiz.questions.find(q => q.id === qId)?.correctAnswer === answer
                }))
            });

            if (response.data.success) {
                setState(prev => ({
                    ...prev,
                    isSaving: false,
                    aiSummary: response.data.aiSummary
                }));
            } else {
                // API returned but without success - still complete the UI
                setState(prev => ({ ...prev, isSaving: false }));
            }
        } catch {
            // Silently fail - quiz completion should still work without saving
            setState(prev => ({ ...prev, isSaving: false }));
        }
    };

    // For fill-blank, use AI assessment result; for others, use exact match
    const isCorrect = state.showResult && (
        currentQuestion.type === 'fill_blank'
            ? state.fillBlankCorrect ?? false
            : selectedAnswer === currentQuestion.correctAnswer
    );
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Final Results Screen - Minimalist
    if (state.showFinalResults) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="space-y-2">
                        <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">
                            {passed ? 'Quiz Complete' : 'Session Incomplete'}
                        </h2>
                        <p className="text-xs text-white/40 uppercase tracking-widest">
                            {passed ? 'Requirement Met' : `Target: ${quiz.passingScore}%`}
                        </p>
                    </div>

                    <div className="flex justify-center gap-8 py-8 border-y border-white/10">
                        <div className="space-y-1">
                            <div className="text-3xl font-bold font-mono text-white">{score}%</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Score</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold font-mono text-emerald-400">{correctAnswers}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Correct</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold font-mono text-cyan-400">+{state.xpEarned}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">XP Earned</div>
                        </div>
                    </div>

                    {/* AI Summary */}
                    {(state.isSaving || state.aiSummary) && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                            <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                Tutor Feedback
                            </h4>
                            {state.isSaving ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-2 bg-white/10 rounded w-3/4" />
                                    <div className="h-2 bg-white/10 rounded w-1/2" />
                                </div>
                            ) : (
                                <p className="text-xs text-white/70 leading-relaxed italic">
                                    "{state.aiSummary}"
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                setState({
                                    currentIndex: 0,
                                    answers: new Map(),
                                    showResult: false,
                                    showFinalResults: false,
                                    isSaving: false,
                                    isAssessing: false,
                                    combo: 0,
                                    xpEarned: 0,
                                });
                                setSelectedAnswer(null);
                            }}
                            className="w-full py-4 border border-white/10 hover:bg-white/5 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                        >
                            Restart Quiz
                        </button>
                        <button
                            onClick={exitMode}
                            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                        >
                            Resume Lesson
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* XP Popup */}
            {localXPPopup && (
                <XPPopup
                    key={localXPPopup.id}
                    amount={localXPPopup.amount}
                    x={localXPPopup.x}
                    y={localXPPopup.y}
                />
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{quiz.title}</h3>
                    <div className="flex items-center gap-4">
                        {/* Combo Indicator */}
                        <ComboIndicator streak={state.combo} size="sm" />

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-mono">
                            <span className="text-cyan-400">+{state.xpEarned} XP</span>
                            <span className="text-white/20">|</span>
                            <span className="text-emerald-500">{correctAnswers}/{totalQuestions}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="h-[2px] bg-white/5 w-full overflow-hidden">
                    <div
                        className="h-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 pr-2">
                <div className="space-y-3">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
                        Question {state.currentIndex + 1} / {totalQuestions}
                    </span>
                    <p className="text-sm text-white leading-relaxed font-medium">
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Options - Minimalist */}
                <div className="space-y-3">
                    {(currentQuestion.options || ['True', 'False']).map((option, index) => {
                        const letter = String.fromCharCode(65 + index); // A, B, C, D
                        const isSelected = selectedAnswer === option || selectedAnswer === letter;
                        const isCorrectAnswer = state.showResult && (
                            option === currentQuestion.correctAnswer ||
                            letter === currentQuestion.correctAnswer
                        );
                        const isWrongSelected = state.showResult && isSelected && !isCorrectAnswer;

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(currentQuestion.type === 'multiple_choice' ? letter : option)}
                                disabled={state.showResult}
                                className={`w-full p-4 text-left transition-all border ${isCorrectAnswer && state.showResult
                                    ? 'border-emerald-500 bg-emerald-500/5'
                                    : isWrongSelected
                                        ? 'border-red-500 bg-red-500/5'
                                        : isSelected
                                            ? 'border-white/40 bg-white/5'
                                            : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-mono ${isCorrectAnswer && state.showResult ? 'text-emerald-400' :
                                        isWrongSelected ? 'text-red-400' : 'text-white/20'
                                        }`}>
                                        {letter}
                                    </span>
                                    <span className={`text-sm ${isSelected ? 'text-white' : 'text-white/60'}`}>{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Fill Blank - Minimalist */}
                {currentQuestion.type === 'fill_blank' && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={selectedAnswer || ''}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            disabled={state.showResult || state.isAssessing}
                            placeholder="Type answer..."
                            className="w-full bg-transparent border-b border-white/20 p-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && !state.showResult && handleSubmitAnswer()}
                        />
                        {!state.showResult && (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer || state.isAssessing}
                                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-white/5 disabled:text-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                            >
                                {state.isAssessing ? 'Checking...' : 'Submit Answer'}
                            </button>
                        )}
                    </div>
                )}

                {/* Explanation Area */}
                {state.showResult && (
                    <div className="pt-6 border-t border-white/10">
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCorrect ? "Validated" : "Correction Required"}
                        </h4>
                        <p className="text-xs text-white/50 leading-relaxed italic">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            {/* Navigation - Minimalist */}
            {state.showResult && (
                <div className="mt-8 pt-4 border-t border-white/10 flex gap-2">
                    <button
                        onClick={handleNext}
                        className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                    >
                        {state.currentIndex < totalQuestions - 1 ? 'Next Phase' : 'Finalize'}
                    </button>
                </div>
            )}
        </div>
    );
}
