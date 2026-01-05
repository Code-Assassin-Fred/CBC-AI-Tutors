'use client';

import React from 'react';
import { useGamification } from '@/lib/context/GamificationContext';

interface LevelBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    showTitle?: boolean;
    className?: string;
}

export default function LevelBadge({ size = 'md', showTitle = true, className = '' }: LevelBadgeProps) {
    const { level, levelTitle } = useGamification();

    const sizes = {
        sm: {
            container: 'w-6 h-6',
            text: 'text-xs',
            title: 'text-[10px]',
        },
        md: {
            container: 'w-8 h-8',
            text: 'text-sm',
            title: 'text-xs',
        },
        lg: {
            container: 'w-12 h-12',
            text: 'text-lg',
            title: 'text-sm',
        },
    };

    // Color tiers based on level
    const getTierColors = () => {
        if (level >= 9) return 'from-amber-400 to-yellow-300 text-amber-900'; // Gold
        if (level >= 7) return 'from-slate-300 to-slate-100 text-slate-800'; // Silver
        if (level >= 5) return 'from-orange-500 to-amber-400 text-white'; // Bronze
        if (level >= 3) return 'from-emerald-500 to-teal-400 text-white'; // Green
        return 'from-slate-500 to-slate-400 text-white'; // Default
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div
                className={`${sizes[size].container} rounded-full bg-gradient-to-br ${getTierColors()} 
                    flex items-center justify-center font-bold ${sizes[size].text}
                    shadow-lg ring-2 ring-white/20`}
            >
                {level}
            </div>

            {showTitle && (
                <span className={`${sizes[size].title} text-white/80 font-medium`}>
                    {levelTitle}
                </span>
            )}
        </div>
    );
}
