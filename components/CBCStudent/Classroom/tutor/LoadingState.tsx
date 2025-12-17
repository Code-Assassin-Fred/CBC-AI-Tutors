"use client";

import React from 'react';
import { LoadingProgress } from '@/lib/types/agents';

interface LoadingStateProps {
    progress: LoadingProgress;
}

export default function LoadingState({ progress }: LoadingStateProps) {
    const completedSteps = progress.steps.filter(s => s.status === 'complete').length;
    const progressPercent = Math.round((completedSteps / progress.totalSteps) * 100);

    const getIcon = () => {
        if (progress.type === 'planner') {
            return '🎯';
        }
        return '📝';
    };

    const getTitle = () => {
        if (progress.type === 'planner') {
            return 'Preparing Your Lesson';
        }
        return 'Creating Your Quiz';
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-full max-w-sm bg-white/5 rounded-2xl border border-white/10 p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{getIcon()}</span>
                    <h3 className="text-lg font-semibold text-white">{getTitle()}</h3>
                </div>

                {/* Steps */}
                <div className="space-y-3 mb-6">
                    {progress.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                            {/* Step indicator */}
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                {step.status === 'complete' && (
                                    <span className="text-green-400 text-sm">✓</span>
                                )}
                                {step.status === 'in-progress' && (
                                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                )}
                                {step.status === 'pending' && (
                                    <div className="w-3 h-3 rounded-full bg-white/20" />
                                )}
                                {step.status === 'error' && (
                                    <span className="text-red-400 text-sm">✕</span>
                                )}
                            </div>

                            {/* Step text */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${step.status === 'complete' ? 'text-white/60' :
                                        step.status === 'in-progress' ? 'text-white' :
                                            step.status === 'error' ? 'text-red-400' :
                                                'text-white/40'
                                    }`}>
                                    {step.status === 'in-progress' && step.message
                                        ? step.message
                                        : `Step ${index + 1}: ${step.name}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-center text-sm text-white/50">
                        {progressPercent}% complete
                    </p>
                </div>
            </div>
        </div>
    );
}
