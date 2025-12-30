"use client";

import { GenerationProgress } from '@/types/course';

interface GeneratingStateProps {
    progress: GenerationProgress | null;
    error: string | null;
}

export default function GeneratingState({ progress, error }: GeneratingStateProps) {
    const percentage = progress?.percentage || 0;

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Generation Failed</h3>
                    <p className="text-white/60 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="max-w-md text-center">
                {/* Animated icon */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                    {/* Background pulse */}
                    <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping" style={{ animationDuration: '2s' }} />

                    {/* Main circle */}
                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                </div>

                {/* Progress text */}
                <h3 className="text-xl font-semibold text-white mb-2">
                    Creating Your Course
                </h3>
                <p className="text-white/60 mb-6">
                    {progress?.message || 'Initializing...'}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Percentage */}
                <p className="text-white/40 text-sm">
                    {percentage}% complete
                </p>

                {/* Current lesson indicator */}
                {progress?.currentLesson && progress?.totalLessons && (
                    <p className="text-sky-400 text-sm mt-4">
                        Generating lesson {progress.currentLesson} of {progress.totalLessons}
                    </p>
                )}

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-2 mt-8">
                    {['planning', 'outlining', 'generating-lesson', 'generating-quiz', 'finalizing'].map((step, index) => {
                        const stepOrder = ['planning', 'outlining', 'generating-lesson', 'generating-quiz', 'finalizing'];
                        const currentIndex = stepOrder.indexOf(progress?.step || '');
                        const isComplete = index < currentIndex;
                        const isCurrent = step === progress?.step;

                        return (
                            <div
                                key={step}
                                className={`w-2 h-2 rounded-full transition-all ${isComplete
                                    ? 'bg-sky-500'
                                    : isCurrent
                                        ? 'bg-sky-500 animate-pulse scale-125'
                                        : 'bg-white/20'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
