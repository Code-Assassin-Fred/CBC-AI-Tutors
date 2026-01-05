"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
    UserGamification,
    XPSource,
    XPAwardResult,
    Badge,
    StreakData,
    DEFAULT_GAMIFICATION,
    calculateLevelFromXP,
    getLevelProgress,
    getXPForNextLevel,
    getLevelConfig,
    LEVEL_CONFIG,
} from '@/types/gamification';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

interface GamificationContextType {
    // State
    xp: number;
    level: number;
    levelTitle: string;
    levelProgress: number;
    xpToNextLevel: number;
    neurons: number;
    streak: StreakData;
    badges: Badge[];
    stats: UserGamification['stats'];
    preferences: UserGamification['preferences'];
    isLoading: boolean;

    // Level up state
    showLevelUp: boolean;
    levelUpData: { newLevel: number; title: string; neurons: number } | null;
    dismissLevelUp: () => void;

    // XP popup state
    xpPopup: { amount: number; x: number; y: number } | null;
    showXPPopup: (amount: number, x?: number, y?: number) => void;
    hideXPPopup: () => void;

    // Actions
    addXP: (amount: number, source: XPSource, description?: string, multiplier?: number) => Promise<XPAwardResult>;
    refreshStats: () => Promise<void>;
    useStreakFreeze: () => Promise<boolean>;
    spendNeurons: (amount: number, reason: string) => Promise<boolean>;
    checkStreak: () => Promise<void>;
    updatePreferences: (prefs: Partial<UserGamification['preferences']>) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface GamificationProviderProps {
    children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
    const { user } = useAuth();

    // Core state
    const [gamification, setGamification] = useState<UserGamification>(DEFAULT_GAMIFICATION);
    const [isLoading, setIsLoading] = useState(true);
    const [badges, setBadges] = useState<Badge[]>([]);

    // UI state
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpData, setLevelUpData] = useState<{ newLevel: number; title: string; neurons: number } | null>(null);
    const [xpPopup, setXpPopup] = useState<{ amount: number; x: number; y: number } | null>(null);

    // Derived values
    const { level, title } = calculateLevelFromXP(gamification.xp);
    const levelProgress = getLevelProgress(gamification.xp, level);
    const xpToNextLevel = getXPForNextLevel(level) - gamification.xp;

    // ============================================
    // LOAD USER DATA
    // ============================================

    const refreshStats = useCallback(async () => {
        if (!user) {
            setGamification(DEFAULT_GAMIFICATION);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/gamification/stats?userId=${user.uid}`);
            if (response.ok) {
                const data = await response.json();
                setGamification(data.gamification || DEFAULT_GAMIFICATION);
                setBadges(data.badges || []);
            }
        } catch (error) {
            console.error('Failed to load gamification stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshStats();
    }, [refreshStats]);

    // ============================================
    // CHECK STREAK ON LOAD
    // ============================================

    const checkStreak = useCallback(async () => {
        if (!user) return;

        try {
            const response = await fetch('/api/gamification/streak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
            });

            if (response.ok) {
                const data = await response.json();
                setGamification(prev => ({
                    ...prev,
                    streak: data.streak,
                    xp: data.newXP ?? prev.xp,
                }));

                // Show XP popup for daily login bonus if applicable
                if (data.dailyBonusAwarded) {
                    showXPPopupFn(data.dailyBonusAmount || 5);
                }
            }
        } catch (error) {
            console.error('Failed to check streak:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user && !isLoading) {
            checkStreak();
        }
    }, [user, isLoading, checkStreak]);

    // ============================================
    // ADD XP
    // ============================================

    const addXP = useCallback(async (
        amount: number,
        source: XPSource,
        description?: string,
        multiplier?: number
    ): Promise<XPAwardResult> => {
        if (!user) {
            return { xpAwarded: 0, newTotalXP: gamification.xp, leveledUp: false };
        }

        const finalAmount = multiplier ? Math.floor(amount * multiplier) : amount;

        try {
            const response = await fetch('/api/gamification/xp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    amount: finalAmount,
                    source,
                    description: description || `${source} activity`,
                    multiplier,
                }),
            });

            if (response.ok) {
                const result: XPAwardResult = await response.json();

                // Update local state
                setGamification(prev => ({
                    ...prev,
                    xp: result.newTotalXP,
                    level: result.newLevel || prev.level,
                    neurons: prev.neurons + (result.neuronsAwarded || 0),
                    stats: {
                        ...prev.stats,
                        totalXPEarned: prev.stats.totalXPEarned + result.xpAwarded,
                    },
                }));

                // Handle level up
                if (result.leveledUp && result.newLevel) {
                    const config = getLevelConfig(result.newLevel);
                    setLevelUpData({
                        newLevel: result.newLevel,
                        title: config?.title || 'Unknown',
                        neurons: result.neuronsAwarded || 0,
                    });
                    setShowLevelUp(true);
                }

                // Handle new badges
                if (result.badgesEarned && result.badgesEarned.length > 0) {
                    setBadges(prev => [...prev, ...result.badgesEarned!]);
                }

                return result;
            }
        } catch (error) {
            console.error('Failed to add XP:', error);
        }

        return { xpAwarded: 0, newTotalXP: gamification.xp, leveledUp: false };
    }, [user, gamification.xp]);

    // ============================================
    // STREAK FREEZE
    // ============================================

    const useStreakFreeze = useCallback(async (): Promise<boolean> => {
        if (!user || gamification.streak.freezesRemaining <= 0) {
            return false;
        }

        try {
            const response = await fetch('/api/gamification/streak/freeze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
            });

            if (response.ok) {
                const data = await response.json();
                setGamification(prev => ({
                    ...prev,
                    streak: data.streak,
                }));
                return true;
            }
        } catch (error) {
            console.error('Failed to use streak freeze:', error);
        }

        return false;
    }, [user, gamification.streak.freezesRemaining]);

    // ============================================
    // SPEND NEURONS
    // ============================================

    const spendNeurons = useCallback(async (amount: number, reason: string): Promise<boolean> => {
        if (!user || gamification.neurons < amount) {
            return false;
        }

        try {
            const response = await fetch('/api/gamification/neurons/spend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, amount, reason }),
            });

            if (response.ok) {
                setGamification(prev => ({
                    ...prev,
                    neurons: prev.neurons - amount,
                }));
                return true;
            }
        } catch (error) {
            console.error('Failed to spend neurons:', error);
        }

        return false;
    }, [user, gamification.neurons]);

    // ============================================
    // UPDATE PREFERENCES
    // ============================================

    const updatePreferences = useCallback(async (
        prefs: Partial<UserGamification['preferences']>
    ): Promise<void> => {
        if (!user) return;

        setGamification(prev => ({
            ...prev,
            preferences: { ...prev.preferences, ...prefs },
        }));

        try {
            await fetch('/api/gamification/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, preferences: prefs }),
            });
        } catch (error) {
            console.error('Failed to update preferences:', error);
        }
    }, [user]);

    // ============================================
    // UI HELPERS
    // ============================================

    const dismissLevelUp = useCallback(() => {
        setShowLevelUp(false);
        setLevelUpData(null);
    }, []);

    const showXPPopupFn = useCallback((amount: number, x?: number, y?: number) => {
        setXpPopup({
            amount,
            x: x ?? window.innerWidth / 2,
            y: y ?? window.innerHeight / 2,
        });

        // Auto-hide after animation
        setTimeout(() => {
            setXpPopup(null);
        }, 1500);
    }, []);

    const hideXPPopup = useCallback(() => {
        setXpPopup(null);
    }, []);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value: GamificationContextType = {
        xp: gamification.xp,
        level,
        levelTitle: title,
        levelProgress,
        xpToNextLevel,
        neurons: gamification.neurons,
        streak: gamification.streak,
        badges,
        stats: gamification.stats,
        preferences: gamification.preferences,
        isLoading,

        showLevelUp,
        levelUpData,
        dismissLevelUp,

        xpPopup,
        showXPPopup: showXPPopupFn,
        hideXPPopup,

        addXP,
        refreshStats,
        useStreakFreeze,
        spendNeurons,
        checkStreak,
        updatePreferences,
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
