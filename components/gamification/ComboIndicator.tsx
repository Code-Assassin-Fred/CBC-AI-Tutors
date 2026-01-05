'use client';

import React from 'react';
import { getComboMultiplier } from '@/types/gamification';

interface ComboIndicatorProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ComboIndicator({ streak, size = 'md', className = '' }: ComboIndicatorProps) {
    const multiplier = getComboMultiplier(streak);
    const isOnFire = streak >= 10;

    const sizes = {
        sm: {
            container: 'px-2 py-0.5',
            text: 'text-xs',
            icon: 'text-sm',
        },
        md: {
            container: 'px-3 py-1',
            text: 'text-sm',
            icon: 'text-base',
        },
        lg: {
            container: 'px-4 py-1.5',
            text: 'text-base',
            icon: 'text-lg',
        },
    };

    // No combo yet
    if (streak < 3) {
        return null;
    }

    // Intensity increases with combo
    const getIntensity = () => {
        if (isOnFire) return 'from-orange-500 to-red-500 shadow-orange-500/50';
        if (streak >= 7) return 'from-amber-500 to-orange-500 shadow-amber-500/40';
        if (streak >= 5) return 'from-yellow-500 to-amber-500 shadow-yellow-500/30';
        return 'from-emerald-500 to-teal-500 shadow-emerald-500/20';
    };

    return (
        <div
            className={`
                inline-flex items-center gap-1.5 rounded-full
                bg-gradient-to-r ${getIntensity()}
                ${sizes[size].container}
                shadow-lg
                ${isOnFire ? 'animate-pulse' : ''}
                ${className}
            `}
        >
            <span className={sizes[size].icon}>
                {isOnFire ? '🔥' : '⚡'}
            </span>
            <span className={`${sizes[size].text} font-bold text-white`}>
                {multiplier}x
            </span>
            {isOnFire && (
                <span className={`${sizes[size].text} font-semibold text-white/90 uppercase tracking-wider`}>
                    On Fire!
                </span>
            )}
        </div>
    );
}
