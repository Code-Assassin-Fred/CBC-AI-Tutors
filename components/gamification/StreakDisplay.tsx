'use client';

import React from 'react';
import { useGamification } from '@/lib/context/GamificationContext';
import { HiOutlineFire } from 'react-icons/hi2';

interface StreakDisplayProps {
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export default function StreakDisplay({ size = 'md', showLabel = false, className = '' }: StreakDisplayProps) {
    const { streak } = useGamification();

    const sizes = {
        sm: {
            icon: 'w-4 h-4',
            text: 'text-xs',
            container: 'gap-1',
        },
        md: {
            icon: 'w-5 h-5',
            text: 'text-sm',
            container: 'gap-1.5',
        },
        lg: {
            icon: 'w-6 h-6',
            text: 'text-base',
            container: 'gap-2',
        },
    };

    // Color intensity based on streak length
    const getFireColor = () => {
        if (streak.current >= 30) return 'text-amber-400'; // On fire!
        if (streak.current >= 7) return 'text-orange-400'; // Hot
        if (streak.current >= 3) return 'text-orange-300'; // Warming up
        return 'text-white/60'; // Just started
    };

    const getFireAnimation = () => {
        if (streak.current >= 7) return 'animate-pulse';
        return '';
    };

    return (
        <div className={`flex items-center ${sizes[size].container} ${className}`}>
            <HiOutlineFire
                className={`${sizes[size].icon} ${getFireColor()} ${getFireAnimation()}`}
            />
            <span className={`${sizes[size].text} font-bold text-white`}>
                {streak.current}
            </span>
            {showLabel && (
                <span className={`${sizes[size].text} text-white/50`}>
                    day{streak.current !== 1 ? 's' : ''}
                </span>
            )}
        </div>
    );
}
