/**
 * Streak Validation and Calculation Utilities
 * 
 * Handles:
 * - Checking if a streak should be reset due to missed days
 * - Calculating the next streak state after completion
 * - Calendar day logic (preventing multiple increments in one day)
 */

import { StudyStreak } from "@/types/schedule";

/**
 * Format date as YYYY-MM-DD for consistent comparison
 */
export function formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Validates if the current streak is still valid or if it has been broken.
 * A streak is broken if the last study date was before yesterday.
 */
export function validateStreak(streak: StudyStreak | null): StudyStreak | null {
    if (!streak || !streak.lastStudyDate) return streak;

    const today = new Date();
    const lastDay = new Date(streak.lastStudyDate);

    // Normalize to start of day for comparison
    today.setHours(0, 0, 0, 0);
    lastDay.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If more than 1 day has passed, the streak is broken
    if (diffDays > 1) {
        console.log(`[Streak] Resetting streak. Days since last study: ${diffDays}`);
        return {
            ...streak,
            currentStreak: 0,
            // longestStreak remains preserved
        };
    }

    return streak;
}

/**
 * Calculates the next streak state after a study activity is completed.
 * Only increments the streak if it's the first activity of a new day.
 */
export function calculateNextStreak(
    currentStreak: StudyStreak | null,
    userId: string
): StudyStreak {
    const now = new Date();
    const todayStr = formatDateKey(now);

    // Initial streak if none exists
    if (!currentStreak) {
        return {
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastStudyDate: todayStr,
            totalStudyDays: 1,
            weeklyStudyDays: getInitialWeeklyStudyDays(now),
        };
    }

    const lastDateStr = currentStreak.lastStudyDate;

    // Case 1: Already studied today - no increment
    if (lastDateStr === todayStr) {
        console.log("[Streak] Activity today already logged. No increment.");
        return currentStreak;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterday);

    let nextCurrent = 1;

    // Case 2: Studied yesterday - continue streak
    if (lastDateStr === yesterdayStr) {
        nextCurrent = currentStreak.currentStreak + 1;
    }
    // Case 3: Missed days - streak starts at 1 (handled by default nextCurrent = 1)

    const nextLongest = Math.max(currentStreak.longestStreak, nextCurrent);

    // Update weekly array
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const nextWeekly = [...currentStreak.weeklyStudyDays || [0, 0, 0, 0, 0, 0, 0]];
    nextWeekly[dayOfWeek] = 1;

    return {
        ...currentStreak,
        currentStreak: nextCurrent,
        longestStreak: nextLongest,
        lastStudyDate: todayStr,
        totalStudyDays: currentStreak.totalStudyDays + 1,
        weeklyStudyDays: nextWeekly,
    };
}

function getInitialWeeklyStudyDays(date: Date): number[] {
    const days = [0, 0, 0, 0, 0, 0, 0];
    const dayOfWeek = (date.getDay() + 6) % 7;
    days[dayOfWeek] = 1;
    return days;
}
