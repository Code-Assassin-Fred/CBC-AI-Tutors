"use client";

import { useCareer } from '@/lib/context/CareerContext';

export default function CareerGenerating() {
    const { generationProgress, generationError, setCurrentView } = useCareer();

    const steps = [
        { key: 'researching', label: 'Researching career' },
        { key: 'analyzing-skills', label: 'Analyzing required skills' },
        { key: 'market-research', label: 'Gathering market intelligence' },
        { key: 'building-path', label: 'Building your path' },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === generationProgress?.step);

    if (generationError) {
        return (
            <div className="max-w-md mx-auto pt-24 text-center px-4">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Generation Failed</h2>
                <p className="text-white/50 mb-6">{generationError}</p>
                <button
                    onClick={() => setCurrentView('entry')}
                    className="px-6 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto pt-24 px-4">
            {/* Progress indicator */}
            <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#0ea5e9] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                    Creating Your Career Path
                </h2>
                <p className="text-white/50">
                    {generationProgress?.message || 'Please wait...'}
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isComplete = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.key} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete
                                    ? 'bg-[#10b981] text-white'
                                    : isCurrent
                                        ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/50'
                                        : 'bg-white/5 text-white/30'
                                }`}>
                                {isComplete ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-sm">{index + 1}</span>
                                )}
                            </div>
                            <span className={`text-sm ${isComplete
                                    ? 'text-[#10b981]'
                                    : isCurrent
                                        ? 'text-white'
                                        : 'text-white/40'
                                }`}>
                                {step.label}
                            </span>
                            {isCurrent && (
                                <div className="ml-auto flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress bar */}
            <div className="mt-8">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#0ea5e9] transition-all duration-500"
                        style={{ width: `${generationProgress?.percentage || 0}%` }}
                    />
                </div>
                <p className="text-center text-xs text-white/40 mt-2">
                    {generationProgress?.percentage || 0}% complete
                </p>
            </div>
        </div>
    );
}
