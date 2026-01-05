'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/lib/context/GamificationContext';
import confetti from 'canvas-confetti';

export default function LevelUpModal() {
    const { showLevelUp, levelUpData, dismissLevelUp, preferences } = useGamification();

    useEffect(() => {
        if (showLevelUp && preferences.animationsEnabled) {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'],
            });
        }
    }, [showLevelUp, preferences.animationsEnabled]);

    if (!levelUpData) return null;

    return (
        <AnimatePresence>
            {showLevelUp && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={dismissLevelUp}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-white/10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Sparkle effect */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <div className="absolute top-4 left-4 text-2xl">✨</div>
                            <div className="absolute top-8 right-8 text-xl">⭐</div>
                            <div className="absolute bottom-12 left-8 text-lg">✨</div>
                        </motion.div>

                        <motion.h2
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2"
                        >
                            LEVEL UP!
                        </motion.h2>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="my-8"
                        >
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <span className="text-4xl font-bold text-white">
                                    {levelUpData.newLevel}
                                </span>
                            </div>
                        </motion.div>

                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl font-semibold text-white mb-2"
                        >
                            {levelUpData.title}
                        </motion.h3>

                        {levelUpData.neurons > 0 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-amber-400 font-medium mb-6"
                            >
                                +{levelUpData.neurons} 💎 neurons earned!
                            </motion.p>
                        )}

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            onClick={dismissLevelUp}
                            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all"
                        >
                            Continue →
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
