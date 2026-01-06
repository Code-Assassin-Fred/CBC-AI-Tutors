'use client';

import React from 'react';
import { useGamification } from '@/lib/context/GamificationContext';

interface XPBarProps {
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function XPBar({ showLabel = true, size = 'md', className = '' }: XPBarProps) {
    const { xp, level, levelProgress, xpToNextLevel } = useGamification();

    const heights = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    const textSizes = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
    };

    // Max level reached
    const isMaxLevel = level >= 10;

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className={`flex items-center justify-between mb-1 ${textSizes[size]}`}>
                    <span className="text-white/60 font-medium">
                        {isMaxLevel ? 'MAX LEVEL' : `Level ${level}`}
                    </span>
                    <span className="text-white/40 font-mono">
                        {isMaxLevel ? (
                            <span className="text-amber-400">✨ {xp.toLocaleString()} XP</span>
                        ) : (
                            <>
                                {xp.toLocaleString()} / {(xp + xpToNextLevel).toLocaleString()} XP
                            </>
                        )}
                    </span>
                </div>
            )}

            <div className={`w-full ${heights[size]} bg-white/10 rounded-full overflow-hidden`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${isMaxLevel
                        ? 'bg-amber-500'
                        : ''
                        }`}
                    style={{
                        width: `${isMaxLevel ? 100 : levelProgress}%`,
                        backgroundColor: isMaxLevel ? undefined : '#228B22' // Forest green
                    }}
                />
            </div>
        </div>
    );
}
