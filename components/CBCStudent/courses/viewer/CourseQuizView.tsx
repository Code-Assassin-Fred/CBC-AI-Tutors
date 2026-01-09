"use client";

import { useState, useEffect } from 'react';
import { CourseQuiz } from '@/types/course';
import { QuizQuestion } from '@/lib/types/agents';
import { useCourses } from '@/lib/context/CoursesContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGamification } from '@/lib/context/GamificationContext';
import { XP_CONFIG } from '@/types/gamification';

interface CourseQuizViewProps {
    quiz: CourseQuiz;
}

interface QuizState {
    currentIndex: number;
    answers: Map<string, string>;
    showResult: boolean;
    showFinalResults: boolean;
    isSaving: boolean;
    hasSaved: boolean;
}

interface NextCourseInfo {
    title: string;
    careerPathId: string;
}

export default function CourseQuizView({ quiz }: CourseQuizViewProps) {
    const router = useRouter();
    const { selectLesson, currentCourse, saveQuizScore } = useCourses();
    const { user } = useAuth();
    const { addXP, showXPPopup } = useGamification();

    // Streak tracking for XP multipliers
    const [correctStreak, setCorrectStreak] = useState(0);
    const [streakMultiplier, setStreakMultiplier] = useState(1);
    const [xpAwarded, setXpAwarded] = useState(false);

    const [state, setState] = useState<QuizState>({
        currentIndex: 0,
        answers: new Map(),
        showResult: false,
        showFinalResults: false,
        isSaving: false,
        hasSaved: false,
    });
    const [nextCourse, setNextCourse] = useState<NextCourseInfo | null>(null);

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

    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    // Fetch next course in career path when final exam is completed
    useEffect(() => {
        if (state.showFinalResults && passed && quiz.type === 'final' && currentCourse?.careerPathId) {
            const fetchNextCourse = async () => {
                try {
                    const response = await fetch(`/api/career-paths/${currentCourse.careerPathId}`);
                    if (response.ok) {
                        const data = await response.json();
                        const courses = data.path?.courses || [];
                        // Find current course index and get next one
                        const currentIndex = courses.findIndex(
                            (c: { title: string }) => c.title.toLowerCase() === currentCourse.title.toLowerCase()
                        );
                        if (currentIndex !== -1 && currentIndex < courses.length - 1) {
                            const next = courses[currentIndex + 1];
                            setNextCourse({
                                title: next.title,
                                careerPathId: currentCourse.careerPathId!,
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error fetching next course:', err);
                }
            };
            fetchNextCourse();
        }
    }, [state.showFinalResults, passed, quiz.type, currentCourse]);

    // Save quiz score when final results are shown
    useEffect(() => {
        if (state.showFinalResults && !state.hasSaved && user) {
            const saveScore = async () => {
                setState(prev => ({ ...prev, isSaving: true }));

                const answers = Array.from(state.answers.entries()).map(([qId, answer]) => ({
                    questionId: qId,
                    userAnswer: answer,
                    isCorrect: quiz.questions.find(q => q.id === qId)?.correctAnswer === answer,
                }));

                const success = await saveQuizScore(
                    quiz.id,
                    score,
                    passed,
                    quiz.questions.length,
                    answers
                );

                setState(prev => ({ ...prev, isSaving: false, hasSaved: success }));
            };

            saveScore();
        }
    }, [state.showFinalResults, state.hasSaved, user, quiz, score, passed, saveQuizScore, state.answers]);

    const handleContinueToNextCourse = () => {
        if (nextCourse) {
            const params = new URLSearchParams({
                enroll: nextCourse.title,
                careerPathId: nextCourse.careerPathId,
            });
            router.push(`/dashboard/student/courses?${params.toString()}`);
        }
    };

    const handleSelectAnswer = (answer: string) => {
        if (state.showResult) return;
        setState(prev => ({
            ...prev,
            answers: new Map(prev.answers).set(currentQuestion.id, answer),
        }));
    };

    const handleSubmitAnswer = async () => {
        const isAnswerCorrect = selectedAnswer === currentQuestion?.correctAnswer;

        if (isAnswerCorrect) {
            // Update streak
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);

            // Calculate multiplier based on streak
            let newMultiplier = 1;
            if (newStreak >= 10) newMultiplier = 2;
            else if (newStreak >= 5) newMultiplier = 1.5;
            else if (newStreak >= 3) newMultiplier = 1.25;
            setStreakMultiplier(newMultiplier);

            // Award XP for correct answer
            const baseXP = currentQuestion.difficulty === 'hard' ? XP_CONFIG.quizCorrectHard : XP_CONFIG.quizCorrect;
            const xpAmount = Math.round(baseXP * newMultiplier);
            await addXP(xpAmount, 'quiz', `Course quiz correct: ${currentQuestion.question.substring(0, 30)}...`);
            showXPPopup(xpAmount);
        } else {
            // Reset streak on wrong answer
            setCorrectStreak(0);
            setStreakMultiplier(1);
        }

        setState(prev => ({ ...prev, showResult: true }));
    };

    const handleNext = async () => {
        if (isLastQuestion) {
            setState(prev => ({ ...prev, showFinalResults: true }));

            // Award quiz completion XP
            const quizCompletionXP = Math.round(XP_CONFIG.quizComplete * streakMultiplier);
            await addXP(quizCompletionXP, 'quiz', `Completed course quiz: ${quiz.title}`);
            showXPPopup(quizCompletionXP);

            // Award course completion bonus for passing final exam
            if (quiz.type === 'final' && passed && !xpAwarded) {
                setXpAwarded(true);
                setTimeout(async () => {
                    await addXP(XP_CONFIG.courseComplete, 'course_complete', `Completed course: ${currentCourse?.title}`);
                    showXPPopup(XP_CONFIG.courseComplete);
                }, 1500); // Delay to show separately
            }
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
            isSaving: false,
            hasSaved: false,
        });
        // Reset streak on retry
        setCorrectStreak(0);
        setStreakMultiplier(1);
    };

    const handleBackToLesson = () => {
        if (quiz.lessonId && currentCourse) {
            selectLesson(quiz.lessonId);
        }
    };

    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

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
                <div className="flex flex-col items-center gap-4">
                    {/* Next Course Button - shown when passing final exam from a career path */}
                    {passed && quiz.type === 'final' && nextCourse && (
                        <button
                            onClick={handleContinueToNextCourse}
                            className="w-full max-w-xs px-6 py-3 rounded-full font-medium bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 transition-colors"
                        >
                            Continue to Next Course →
                        </button>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={handleRetry}
                            className="px-6 py-2.5 rounded-full font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            Retry Quiz
                        </button>
                        {quiz.lessonId && (
                            <button
                                onClick={handleBackToLesson}
                                className="px-6 py-2.5 rounded-full font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                Back to Lesson
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Question View
    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-white/50">
                        Question {state.currentIndex + 1} of {quiz.questions.length}
                    </span>
                    {/* Streak indicator */}
                    {streakMultiplier > 1 && (
                        <span className="text-xs text-amber-400 font-medium">
                            🔥 {streakMultiplier}x
                        </span>
                    )}
                    {/* Potential XP */}
                    <span className="text-xs text-white/40">
                        +{Math.round((currentQuestion?.difficulty === 'hard' ? XP_CONFIG.quizCorrectHard : XP_CONFIG.quizCorrect) * streakMultiplier)} XP
                    </span>
                </div>
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

            {/* Options or Text Input */}
            <div className="space-y-3 mb-6">
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    /* Multiple choice options */
                    currentQuestion.options.map((option, index) => {
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
                                className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all text-sm sm:text-base ${optionClass}`}
                            >
                                <span className="text-white/80">{option}</span>
                            </button>
                        );
                    })
                ) : (
                    /* Open-ended text input */
                    <div className="space-y-2">
                        <textarea
                            value={selectedAnswer || ''}
                            onChange={(e) => !state.showResult && handleSelectAnswer(e.target.value)}
                            disabled={state.showResult}
                            placeholder="Type your answer here..."
                            className="w-full min-h-[120px] p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-white/30 focus:outline-none focus:border-sky-500/50 resize-none"
                        />
                        {state.showResult && (
                            <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30">
                                <p className="text-xs text-sky-400 font-medium mb-1">Sample Answer:</p>
                                <p className="text-sm text-white/70">{currentQuestion.correctAnswer}</p>
                            </div>
                        )}
                    </div>
                )}
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
