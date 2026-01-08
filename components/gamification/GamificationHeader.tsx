'use client';

import React from 'react';
import { useGamification } from '@/lib/context/GamificationContext';
import XPBar from './XPBar';
import LevelBadge from './LevelBadge';
import StreakDisplay from './StreakDisplay';
import NeuronBalance from './NeuronBalance';
import XPPopup from './XPPopup';
import LevelUpModal from './LevelUpModal';

interface GamificationHeaderProps {
    className?: string;
}

export default function GamificationHeader({ className = '' }: GamificationHeaderProps) {
    const { xpPopup, hideXPPopup, isLoading } = useGamification();

    if (isLoading) {
        return (
            <div className={`bg-white/5 border border-white/10 rounded-xl p-4 ${className}`}>
                <div className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-full" />
                        <div className="h-4 w-20 bg-white/10 rounded" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-16 bg-white/10 rounded" />
                        <div className="h-4 w-12 bg-white/10 rounded" />
                    </div>
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full" />
            </div>
        );
    }

    return (
        <>
            <div className={`bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 ${className}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3">
                    {/* Left: Level Badge */}
                    <LevelBadge size="md" showTitle={true} />

                    {/* Right: Streak + Neurons */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <StreakDisplay size="md" showLabel={true} />
                        <div className="w-px h-4 bg-white/20" />
                        <NeuronBalance size="md" />
                    </div>
                </div>

                {/* XP Progress Bar */}
                <XPBar showLabel={true} size="md" />
            </div>

            {/* XP Popup Animation */}
            {xpPopup && (
                <XPPopup
                    amount={xpPopup.amount}
                    x={xpPopup.x}
                    y={xpPopup.y}
                    onComplete={hideXPPopup}
                />
            )}

            {/* Level Up Modal */}
            <LevelUpModal />
        </>
    );
}
