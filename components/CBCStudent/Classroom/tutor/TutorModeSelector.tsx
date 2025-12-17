"use client";

import React from 'react';
import { LearningSubMode } from '@/lib/types/agents';

interface TutorModeSelectorProps {
    currentMode: LearningSubMode;
    onModeChange: (mode: LearningSubMode) => void;
}

const modes: { id: LearningSubMode; icon: string; label: string; description: string }[] = [
    {
        id: 'read',
        icon: '📖',
        label: 'Read',
        description: 'Interactive AI explanations'
    },
    {
        id: 'podcast',
        icon: '🎧',
        label: 'Podcast',
        description: 'Listen & learn'
    },
    {
        id: 'immersive',
        icon: '🧠',
        label: 'Immersive',
        description: 'Teach it back'
    },
];

export default function TutorModeSelector({ currentMode, onModeChange }: TutorModeSelectorProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${currentMode === mode.id
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                        }
          `}
                    title={mode.description}
                >
                    <span>{mode.icon}</span>
                    <span className="hidden sm:inline">{mode.label}</span>
                </button>
            ))}
        </div>
    );
}
