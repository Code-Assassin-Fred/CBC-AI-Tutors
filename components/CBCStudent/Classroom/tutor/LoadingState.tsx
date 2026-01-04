"use client";

import React from 'react';
import { LoadingProgress } from '@/lib/types/agents';

interface LoadingStateProps {
    progress: LoadingProgress;
}

export default function LoadingState({ progress }: LoadingStateProps) {
    const completedSteps = progress.steps.filter(s => s.status === 'complete').length;
    const progressPercent = Math.round((completedSteps / progress.totalSteps) * 100);

    const getTitle = () => {
        if (progress.type === 'planner') {
            return 'Preparing Your Lesson';
        }
        return 'Creating Your Quiz';
    };

    // Get current step message - show the one that's in-progress, or the last completed one
    const getCurrentMessage = () => {
        const inProgressStep = progress.steps.find(s => s.status === 'in-progress');
        if (inProgressStep) {
            return inProgressStep.message || inProgressStep.name;
        }
        // Fall back to last completed step or first step
        const lastCompleted = [...progress.steps].reverse().find(s => s.status === 'complete');
        if (lastCompleted) {
            return lastCompleted.name;
        }
        return progress.steps[0]?.name || 'Starting...';
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-full max-w-sm space-y-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">{getTitle()}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">This might take a moment...</p>
                </div>

                {/* Single animated message */}
                <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm font-medium text-sky-400 uppercase tracking-widest animate-pulse text-center">
                        {getCurrentMessage()}
                    </p>
                </div>


            </div>
        </div>
    );
}
