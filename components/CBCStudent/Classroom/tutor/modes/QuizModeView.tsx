"use client";

import React, { useState } from 'react';
import { QuizOutput, QuizQuestion } from '@/lib/types/agents';
import { useTutor } from '@/lib/context/TutorContext';

interface QuizModeViewProps {
    quiz: QuizOutput;
}

interface QuizState {
    currentIndex: number;
    answers: Map<string, string>;
    showResult: boolean;
    showFinalResults: boolean;
}

export default function QuizModeView({ quiz }: QuizModeViewProps) {
    const { exitMode } = useTutor();
    const [state, setState] = useState<QuizState>({
        currentIndex: 0,
        answers: new Map(),
        showResult: false,
        showFinalResults: false,
    });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const currentQuestion = quiz.questions[state.currentIndex];
    const totalQuestions = quiz.questions.length;

    // Calculate scores
    const correctAnswers = Array.from(state.answers.entries()).filter(([qId, answer]) => {
        const question = quiz.questions.find(q => q.id === qId);
        return question?.correctAnswer === answer;
    }).length;

    const wrongAnswers = state.answers.size - correctAnswers;
    const progress = ((state.currentIndex + (state.showResult ? 1 : 0)) / totalQuestions) * 100;

    const handleSelectAnswer = (answer: string) => {
        if (state.showResult) return;
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;

        const newAnswers = new Map(state.answers);
        newAnswers.set(currentQuestion.id, selectedAnswer);

        setState({
            ...state,
            answers: newAnswers,
            showResult: true,
        });
    };

    const handleNext = () => {
        if (state.currentIndex < totalQuestions - 1) {
            setState({
                ...state,
                currentIndex: state.currentIndex + 1,
                showResult: false,
            });
            setSelectedAnswer(null);
        } else {
            setState({
                ...state,
                showFinalResults: true,
            });
        }
    };

    const isCorrect = state.showResult && selectedAnswer === currentQuestion.correctAnswer;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Final Results Screen
    if (state.showFinalResults) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-4">
                <div className={`w-full max-w-sm p-6 rounded-2xl border ${passed
                        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20'
                        : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'
                    }`}>
                    <div className="text-center mb-6">
                        <span className="text-5xl mb-4 block">{passed ? '🎉' : '💪'}</span>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {passed ? 'Congratulations!' : 'Keep Practicing!'}
                        </h2>
                        <p className="text-sm text-white/60">
                            {passed ? 'You passed the quiz!' : `You need ${quiz.passingScore}% to pass`}
                        </p>
                    </div>

                    <div className="flex justify-center gap-6 mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{score}%</div>
                            <div className="text-xs text-white/40">Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{correctAnswers}</div>
                            <div className="text-xs text-white/40">Correct</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-400">{wrongAnswers}</div>
                            <div className="text-xs text-white/40">Wrong</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setState({
                                    currentIndex: 0,
                                    answers: new Map(),
                                    showResult: false,
                                    showFinalResults: false,
                                });
                                setSelectedAnswer(null);
                            }}
                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
                        >
                            Retry Quiz
                        </button>
                        <button
                            onClick={exitMode}
                            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-sm font-medium transition-colors"
                        >
                            Exit Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header with progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">{quiz.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-red-400">✕ {wrongAnswers}</span>
                        <span className="text-green-400">✓ {correctAnswers}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs text-white/40">
                        {state.currentIndex + 1}/{totalQuestions}
                    </span>
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="mb-4">
                    <span className="text-xs text-white/40 uppercase tracking-wide">
                        Question {state.currentIndex + 1}
                    </span>
                    <p className="text-sm text-white mt-2 leading-relaxed">
                        {currentQuestion.question}
                    </p>
                    {currentQuestion.hint && !state.showResult && (
                        <p className="text-xs text-blue-400 mt-2">💡 Hint: {currentQuestion.hint}</p>
                    )}
                </div>

                {/* Options */}
                <div className="space-y-2">
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
                                className={`w-full p-4 rounded-xl border text-left transition-all ${isCorrectAnswer && state.showResult
                                        ? 'bg-green-500/20 border-green-500 text-white'
                                        : isWrongSelected
                                            ? 'bg-red-500/20 border-red-500 text-white'
                                            : isSelected
                                                ? 'bg-white/10 border-white/30 text-white'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${isCorrectAnswer && state.showResult
                                            ? 'border-green-500 bg-green-500/20 text-green-400'
                                            : isWrongSelected
                                                ? 'border-red-500 bg-red-500/20 text-red-400'
                                                : isSelected
                                                    ? 'border-white/50 bg-white/10'
                                                    : 'border-white/20'
                                        }`}>
                                        {isCorrectAnswer && state.showResult ? '✓' :
                                            isWrongSelected ? '✕' : letter}
                                    </span>
                                    <span className="text-sm">{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Fill in the blank for that type */}
                {currentQuestion.type === 'fill_blank' && (
                    <input
                        type="text"
                        value={selectedAnswer || ''}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        disabled={state.showResult}
                        placeholder="Type your answer..."
                        className="w-full mt-4 p-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
                    />
                )}

                {/* Result explanation */}
                {state.showResult && (
                    <div className={`mt-4 p-4 rounded-xl border ${isCorrect
                            ? 'bg-green-500/10 border-green-500/20'
                            : 'bg-red-500/10 border-red-500/20'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                {isCorrect ? '✓' : '✕'}
                            </span>
                            <span className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                {isCorrect ? "That's right!" : 'Not quite'}
                            </span>
                        </div>
                        <p className="text-xs text-white/70">{currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                {!state.showResult ? (
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/30 rounded-xl text-white text-sm font-medium transition-colors"
                    >
                        Submit Answer
                    </button>
                ) : (
                    <>
                        {state.currentIndex > 0 && (
                            <button
                                onClick={() => {
                                    setState({
                                        ...state,
                                        currentIndex: state.currentIndex - 1,
                                        showResult: true,
                                    });
                                    setSelectedAnswer(state.answers.get(quiz.questions[state.currentIndex - 1].id) || null);
                                }}
                                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-sm font-medium transition-colors"
                        >
                            {state.currentIndex < totalQuestions - 1 ? 'Next' : 'See Results'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
