'use client';

import React from 'react';
import { useGamification } from '@/lib/context/GamificationContext';

interface NeuronBalanceProps {
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export default function NeuronBalance({ size = 'md', showLabel = false, className = '' }: NeuronBalanceProps) {
    const { neurons } = useGamification();

    const sizes = {
        sm: {
            icon: 'text-sm',
            text: 'text-xs',
            container: 'gap-1',
        },
        md: {
            icon: 'text-base',
            text: 'text-sm',
            container: 'gap-1.5',
        },
        lg: {
            icon: 'text-lg',
            text: 'text-base',
            container: 'gap-2',
        },
    };

    return (
        <div className={`flex items-center ${sizes[size].container} ${className}`}>
            <span className={`${sizes[size].icon}`}>💎</span>
            <span className={`${sizes[size].text} font-bold text-white`}>
                {neurons}
            </span>
            {showLabel && (
                <span className={`${sizes[size].text} text-white/50`}>
                    neurons
                </span>
            )}
        </div>
    );
}
