"use client";

import { useState } from 'react';
import { CourseQuiz } from '@/types/course';
import { QuizQuestion } from '@/lib/types/agents';
import { useCourses } from '@/lib/context/CoursesContext';

interface CourseQuizViewProps {
    quiz: CourseQuiz;
}

interface QuizState {
    currentIndex: number;
    answers: Map<string, string>;
    showResult: boolean;
    showFinalResults: boolean;
}

export default function CourseQuizView({ quiz }: CourseQuizViewProps) {
    const { selectLesson, currentCourse } = useCourses();
    const [state, setState] = useState<QuizState>({
        currentIndex: 0,
        answers: new Map(),
        showResult: false,
        showFinalResults: false,
    });

    const currentQuestion = quiz.questions[state.currentIndex];
    const isLastQuestion = state.currentIndex === quiz.questions.length - 1;
    const selectedAnswer = state.answers.get(currentQuestion?.id);

    // Calculate score
    const calculateScore = () => {
        let correct = 0;
        quiz.questions.forEach((q) => {
            const answer = state.answers.get(q.id);
            if (answer === q.correctAnswer) {
                correct++;
            }
        });
        return Math.round((correct / quiz.questions.length) * 100);
    };

    const handleSelectAnswer = (answer: string) => {
        if (state.showResult) return;
        setState(prev => ({
            ...prev,
            answers: new Map(prev.answers).set(currentQuestion.id, answer),
        }));
    };

    const handleSubmitAnswer = () => {
        setState(prev => ({ ...prev, showResult: true }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setState(prev => ({ ...prev, showFinalResults: true }));
        } else {
            setState(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1,
                showResult: false,
            }));
        }
    };

    const handleRetry = () => {
        setState({
            currentIndex: 0,
            answers: new Map(),
            showResult: false,
            showFinalResults: false,
        });
    };

    const handleBackToLesson = () => {
        if (quiz.lessonId && currentCourse) {
            selectLesson(quiz.lessonId);
        }
    };

    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    // Final Results View
    if (state.showFinalResults) {
        return (
            <div className="max-w-xl mx-auto text-center py-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${passed ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                    {passed ? (
                        <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    {passed ? 'Congratulations!' : 'Keep Practicing!'}
                </h2>
                <p className="text-white/60 mb-6">
                    {passed
                        ? `You passed the ${quiz.type === 'final' ? 'final exam' : 'quiz'} with a score of ${score}%`
                        : `You scored ${score}%. You need ${quiz.passingScore}% to pass.`}
                </p>

                {/* Score display */}
                <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-white/5 border border-white/10 mb-8">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white">{score}%</p>
                        <p className="text-xs text-white/40">Your Score</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <p className="text-3xl font-bold text-white/50">{quiz.passingScore}%</p>
                        <p className="text-xs text-white/40">Passing</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleRetry}
                        className="px-6 py-2.5 rounded-full font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        Retry Quiz
                    </button>
                    {quiz.lessonId && (
                        <button
                            onClick={handleBackToLesson}
                            className="px-6 py-2.5 rounded-full font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                        >
                            Back to Lesson
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Question View
    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-white/50">
                    Question {state.currentIndex + 1} of {quiz.questions.length}
                </span>
                <div className="flex gap-1">
                    {quiz.questions.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${index < state.currentIndex
                                ? 'bg-emerald-500'
                                : index === state.currentIndex
                                    ? 'bg-emerald-500/50'
                                    : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Question */}
            <div className="mb-6">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-3 ${currentQuestion.difficulty === 'easy'
                    ? 'bg-green-500/20 text-green-400'
                    : currentQuestion.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                    {currentQuestion.difficulty}
                </span>
                <h3 className="text-lg font-medium text-white">
                    {currentQuestion.question}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
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
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${optionClass}`}
                        >
                            <span className="text-white/80">{option}</span>
                        </button>
                    );
                })}
            </div>

            {/* Explanation (after answering) */}
            {state.showResult && (
                <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                    <p className={`font-medium mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-white/70 text-sm">
                        {currentQuestion.explanation}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end">
                {!state.showResult ? (
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all ${selectedAnswer
                            ? 'bg-sky-500 text-white hover:bg-sky-600'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-full font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                    >
                        {isLastQuestion ? 'See Results' : 'Next Question'}
                    </button>
                )}
            </div>
        </div>
    );
}
