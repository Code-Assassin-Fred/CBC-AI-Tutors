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
            return 'System Preparation';
        }
        return 'Data Synthesis';
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-full max-w-sm space-y-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">{getTitle()}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Constructing learning environment</p>
                </div>

                {/* Steps */}
                <div className="space-y-6">
                    {progress.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-4">
                            {/* Step indicator */}
                            <div className="flex-shrink-0 w-8 h-[2px] bg-white/5 overflow-hidden">
                                {step.status === 'complete' ? (
                                    <div className="h-full bg-emerald-500 w-full" />
                                ) : step.status === 'in-progress' ? (
                                    <div className="h-full bg-sky-500 w-1/2 animate-pulse" />
                                ) : (
                                    <div className="h-full bg-white/5 w-0" />
                                )}
                            </div>

                            {/* Step text */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${step.status === 'complete' ? 'text-white/40' :
                                    step.status === 'in-progress' ? 'text-white' :
                                        step.status === 'error' ? 'text-red-400' :
                                            'text-white/20'
                                    }`}>
                                    {step.status === 'in-progress' && step.message
                                        ? step.message
                                        : step.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-3">
                    <div className="h-[2px] bg-white/5 w-full overflow-hidden">
                        <div
                            className="h-full bg-sky-500 transition-all duration-700 ease-in-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold font-mono">
                        <span className="text-white/20">Operational</span>
                        <span className="text-white/40">{progressPercent}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
