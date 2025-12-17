"use client";

import React from 'react';
import { LearningSubMode } from '@/lib/types/agents';

interface TutorModeSelectorProps {
    currentMode: LearningSubMode;
    onModeChange: (mode: LearningSubMode) => void;
}

const modes: { id: LearningSubMode; label: string; description: string }[] = [
    {
        id: 'read',
        label: 'Read',
        description: 'Interactive AI explanations'
    },
    {
        id: 'podcast',
        label: 'Podcast',
        description: 'Listen & learn'
    },
    {
        id: 'immersive',
        label: 'Immersive',
        description: 'Teach it back'
    },
];

export default function TutorModeSelector({ currentMode, onModeChange }: TutorModeSelectorProps) {
    return (
        <div className="flex items-center gap-1 p-1">
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={`
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${currentMode === mode.id
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }
          `}
                    title={mode.description}
                >
                    <span>{mode.label}</span>
                </button>
            ))}
        </div>
    );
}
