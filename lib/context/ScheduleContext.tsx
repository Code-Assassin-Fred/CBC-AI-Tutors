"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import {
    StudyBlock,
    LearningGoal,
    StudyStreak,
    WeeklySchedule,
    DaySchedule,
    UpcomingReminder,
    StudyBlockColor,
} from '@/types/schedule';
import { validateStreak, calculateNextStreak } from '../utils/streak-utils';
import { useAuth } from './AuthContext';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekEnd(weekStart: Date): Date {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ============================================
// CONTEXT TYPE
// ============================================

interface ScheduleContextType {
    // Week navigation
    currentWeekStart: Date;
    goToPreviousWeek: () => void;
    goToNextWeek: () => void;
    goToCurrentWeek: () => void;

    // Weekly data
    weeklySchedule: WeeklySchedule | null;
    daySchedules: DaySchedule[];
    isLoading: boolean;
    loadWeeklySchedule: () => Promise<void>;

    // Study blocks
    createBlock: (block: Omit<StudyBlock, 'id' | 'userId' | 'createdAt' | 'completed'>) => Promise<void>;
    updateBlock: (blockId: string, updates: Partial<StudyBlock>) => Promise<void>;
    deleteBlock: (blockId: string) => Promise<void>;
    completeBlock: (blockId: string) => Promise<void>;

    // Learning goals
    goals: LearningGoal[];
    createGoal: (goal: Omit<LearningGoal, 'id' | 'userId' | 'createdAt' | 'completedHours'>) => Promise<void>;
    updateGoal: (goalId: string, updates: Partial<LearningGoal>) => Promise<void>;
    deleteGoal: (goalId: string) => Promise<void>;

    // Streak
    streak: StudyStreak | null;

    // Reminders
    reminders: UpcomingReminder[];

    // Modal state
    editingBlock: StudyBlock | null;
    setEditingBlock: (block: StudyBlock | null) => void;
    showBlockModal: boolean;
    setShowBlockModal: (show: boolean) => void;
    modalPrefill: { date: string; startTime: string } | null;
    setModalPrefill: (prefill: { date: string; startTime: string } | null) => void;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface ScheduleProviderProps {
    children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
    const { user } = useAuth();

    // Week navigation
    const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

    // Data state
    const [blocks, setBlocks] = useState<StudyBlock[]>([]);
    const [goals, setGoals] = useState<LearningGoal[]>([]);
    const [streak, setStreak] = useState<StudyStreak | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [modalPrefill, setModalPrefill] = useState<{ date: string; startTime: string } | null>(null);

    // Week navigation
    const goToPreviousWeek = useCallback(() => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
        });
    }, []);

    const goToNextWeek = useCallback(() => {
        setCurrentWeekStart(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });
    }, []);

    const goToCurrentWeek = useCallback(() => {
        setCurrentWeekStart(getWeekStart(new Date()));
    }, []);

    // Build day schedules
    const daySchedules = useMemo((): DaySchedule[] => {
        const schedules: DaySchedule[] = [];
        const today = formatDate(new Date());

        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(date.getDate() + i);
            const dateStr = formatDate(date);

            const dayBlocks = blocks.filter(b => b.date === dateStr);
            const totalMinutes = dayBlocks.reduce((sum, b) => sum + b.duration, 0);

            schedules.push({
                date: dateStr,
                dayName: getDayName(date),
                isToday: dateStr === today,
                blocks: dayBlocks,
                totalMinutes,
            });
        }

        return schedules;
    }, [currentWeekStart, blocks]);

    // Build weekly schedule
    const weeklySchedule = useMemo((): WeeklySchedule | null => {
        const weekEnd = getWeekEnd(currentWeekStart);

        const totalPlannedMinutes = blocks.reduce((sum, b) => sum + b.duration, 0);
        const totalCompletedMinutes = blocks
            .filter(b => b.completed)
            .reduce((sum, b) => sum + (b.actualDuration || b.duration), 0);

        return {
            weekStart: formatDate(currentWeekStart),
            weekEnd: formatDate(weekEnd),
            blocks,
            goals,
            totalPlannedMinutes,
            totalCompletedMinutes,
        };
    }, [currentWeekStart, blocks, goals]);

    // Calculate reminders
    const reminders = useMemo((): UpcomingReminder[] => {
        const result: UpcomingReminder[] = [];
        const now = new Date();
        const today = formatDate(now);

        // Find next upcoming block
        const upcomingBlocks = blocks
            .filter(b => !b.completed && b.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (upcomingBlocks[0]) {
            const block = upcomingBlocks[0];
            const isToday = block.date === today;
            result.push({
                id: `reminder-${block.id}`,
                type: 'study-block',
                title: block.topic,
                description: `${block.duration} min study session`,
                time: isToday ? (block.startTime || 'Today') : block.date,
                urgency: isToday ? 'high' : 'medium',
                relatedBlockId: block.id,
            });
        }

        // Streak risk
        if (streak && streak.currentStreak > 0) {
            const lastStudy = new Date(streak.lastStudyDate);
            const daysSince = Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince >= 1) {
                result.push({
                    id: 'streak-risk',
                    type: 'streak-risk',
                    title: 'Keep your streak!',
                    description: `${streak.currentStreak} day streak at risk`,
                    urgency: 'high',
                });
            }
        }

        return result;
    }, [blocks, streak]);

    // Load schedule for current week
    const loadWeeklySchedule = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const weekStartStr = formatDate(currentWeekStart);
            const response = await fetch(`/api/schedule?userId=${user.uid}&weekStart=${weekStartStr}`);

            if (response.ok) {
                const data = await response.json();
                setBlocks(data.blocks || []);
                setGoals(data.goals || []);

                // Validate streak on load (check if broken)
                const loadedStreak = data.streak || null;
                const validated = validateStreak(loadedStreak);
                setStreak(validated);

                // If streak was reset on load, sync with server
                if (loadedStreak && validated && loadedStreak.currentStreak !== validated.currentStreak) {
                    syncStreakToServer(validated);
                }
            }
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, currentWeekStart]);

    // Create block
    const createBlock = useCallback(async (
        blockData: Omit<StudyBlock, 'id' | 'userId' | 'createdAt' | 'completed'>
    ) => {
        if (!user) return;

        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'block',
                    data: { ...blockData, userId: user.uid }
                }),
            });

            if (response.ok) {
                const { block } = await response.json();
                setBlocks(prev => [...prev, block]);
            }
        } catch (error) {
            console.error('Failed to create block:', error);
            // Fallback for local dev if API fails
            const newBlock: StudyBlock = {
                ...blockData,
                id: `block-${Date.now()}`,
                userId: user.uid,
                completed: false,
                createdAt: new Date(),
            };
            setBlocks(prev => [...prev, newBlock]);
        }
    }, [user]);

    // Update block
    const updateBlock = useCallback(async (blockId: string, updates: Partial<StudyBlock>) => {
        if (!user) return;
        setBlocks(prev => prev.map(b =>
            b.id === blockId ? { ...b, ...updates, updatedAt: new Date() } : b
        ));

        try {
            await fetch('/api/schedule', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'block',
                    id: blockId,
                    updates,
                    userId: user.uid
                }),
            });
        } catch (error) {
            console.error('Failed to update block:', error);
        }
    }, [user]);

    // Delete block
    const deleteBlock = useCallback(async (blockId: string) => {
        if (!user) return;
        setBlocks(prev => prev.filter(b => b.id !== blockId));

        try {
            await fetch(`/api/schedule?id=${blockId}&type=block&userId=${user.uid}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete block:', error);
        }
    }, [user]);

    // Complete block
    const completeBlock = useCallback(async (blockId: string) => {
        if (!user) return;
        setBlocks(prev => prev.map(b =>
            b.id === blockId
                ? { ...b, completed: true, completedAt: new Date(), color: 'emerald' as StudyBlockColor }
                : b
        ));

        try {
            await fetch('/api/schedule', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'block',
                    id: blockId,
                    updates: { completed: true, completedAt: new Date().toISOString(), color: 'emerald' },
                    userId: user.uid
                }),
            });
        } catch (error) {
            console.error('Failed to complete block:', error);
        }

        // Update streak using new utility (handles daily increment and resets correctly)
        setStreak(prev => {
            const nextStreak = calculateNextStreak(prev, user.uid);

            // Persist streak
            syncStreakToServer(nextStreak);

            return nextStreak;
        });
    }, [user]);

    const syncStreakToServer = useCallback(async (nextStreak: StudyStreak) => {
        if (!user) return;
        try {
            await fetch('/api/schedule', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'streak',
                    id: 'studyStreak',
                    updates: nextStreak,
                    userId: user.uid
                }),
            });
        } catch (err) {
            console.error('Failed to sync streak:', err);
        }
    }, [user]);

    // Create goal
    const createGoal = useCallback(async (
        goalData: Omit<LearningGoal, 'id' | 'userId' | 'createdAt' | 'completedHours'>
    ) => {
        if (!user) return;

        const newGoal: LearningGoal = {
            ...goalData,
            id: `goal-${Date.now()}`,
            userId: user.uid,
            completedHours: 0,
            createdAt: new Date(),
        };
        setGoals(prev => [...prev, newGoal]);

        try {
            await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'goal',
                    data: { ...goalData, userId: user.uid }
                }),
            });
        } catch (error) {
            console.error('Failed to create goal:', error);
        }
    }, [user]);

    // Update goal
    const updateGoal = useCallback(async (goalId: string, updates: Partial<LearningGoal>) => {
        if (!user) return;
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, ...updates, updatedAt: new Date() } : g
        ));

        try {
            await fetch('/api/schedule', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'goal',
                    id: goalId,
                    updates,
                    userId: user.uid
                }),
            });
        } catch (error) {
            console.error('Failed to update goal:', error);
        }
    }, [user]);

    // Delete goal
    const deleteGoal = useCallback(async (goalId: string) => {
        if (!user) return;
        setGoals(prev => prev.filter(g => g.id !== goalId));

        try {
            await fetch(`/api/schedule?id=${goalId}&type=goal&userId=${user.uid}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    }, [user]);

    const value: ScheduleContextType = {
        currentWeekStart,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        weeklySchedule,
        daySchedules,
        isLoading,
        loadWeeklySchedule,
        createBlock,
        updateBlock,
        deleteBlock,
        completeBlock,
        goals,
        createGoal,
        updateGoal,
        deleteGoal,
        streak,
        reminders,
        editingBlock,
        setEditingBlock,
        showBlockModal,
        setShowBlockModal,
        modalPrefill,
        setModalPrefill,
    };

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useSchedule() {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useSchedule must be used within ScheduleProvider');
    }
    return context;
}
