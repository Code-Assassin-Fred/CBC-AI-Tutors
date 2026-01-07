/**
 * Gamification Types
 * 
 * Types for XP, levels, streaks, badges, and currencies
 */

// ============================================
// CORE TYPES
// ============================================

export interface UserGamification {
    xp: number;
    level: number;
    neurons: number;

    streak: StreakData;
    stats: GamificationStats;
    earnedBadges: string[];

    preferences: GamificationPreferences;

    updatedAt: Date;
}

export interface StreakData {
    current: number;
    longest: number;
    lastActiveDate: string; // ISO date YYYY-MM-DD
    freezesRemaining: number;
    freezeUsedThisWeek: boolean;
}

export interface GamificationStats {
    totalXPEarned: number;
    totalQuizzes: number;
    perfectQuizzes: number;
    longestCombo: number;
    totalLessons: number;
    totalCoursesCompleted: number;
    totalStudyTimeMinutes: number;
}

export interface GamificationPreferences {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    profileTheme: string;
}

// ============================================
// XP TYPES
// ============================================

export type XPSource =
    | 'quiz'
    | 'lesson'
    | 'immersive'
    | 'podcast'
    | 'conversational'
    | 'streak'
    | 'community'
    | 'course_complete'
    | 'daily_login';

export interface XPLogEntry {
    id: string;
    amount: number;
    source: XPSource;
    description: string;
    multiplier?: number;
    timestamp: Date;
}

export interface XPAwardRequest {
    userId: string;
    amount: number;
    source: XPSource;
    description: string;
    multiplier?: number;
}

export interface XPAwardResult {
    xpAwarded: number;
    newTotalXP: number;
    leveledUp: boolean;
    newLevel?: number;
    neuronsAwarded?: number;
    badgesEarned?: Badge[];
}

// ============================================
// BADGE TYPES
// ============================================

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji or icon name
    category: BadgeCategory;
    tier: 'bronze' | 'silver' | 'gold';
    earnedAt?: Date;
}

export type BadgeCategory =
    | 'learning'
    | 'quiz'
    | 'streak'
    | 'mode'
    | 'career'
    | 'community'
    | 'special';

export interface BadgeCriteria {
    type: 'count' | 'streak' | 'perfect' | 'combo' | 'time';
    threshold: number;
    stat?: keyof GamificationStats;
}

export interface BadgeDefinition extends Badge {
    criteria: BadgeCriteria;
}

// ============================================
// LEVEL TYPES
// ============================================

export interface LevelConfig {
    level: number;
    title: string;
    xpRequired: number;
    cumulativeXP: number;
    neuronsReward: number;
}

export const LEVEL_CONFIG: LevelConfig[] = [
    { level: 1, title: 'Novice', xpRequired: 0, cumulativeXP: 0, neuronsReward: 0 },
    { level: 2, title: 'Learner', xpRequired: 100, cumulativeXP: 100, neuronsReward: 10 },
    { level: 3, title: 'Explorer', xpRequired: 200, cumulativeXP: 300, neuronsReward: 10 },
    { level: 4, title: 'Apprentice', xpRequired: 400, cumulativeXP: 700, neuronsReward: 10 },
    { level: 5, title: 'Practitioner', xpRequired: 600, cumulativeXP: 1300, neuronsReward: 10 },
    { level: 6, title: 'Scholar', xpRequired: 900, cumulativeXP: 2200, neuronsReward: 10 },
    { level: 7, title: 'Expert', xpRequired: 1200, cumulativeXP: 3400, neuronsReward: 10 },
    { level: 8, title: 'Master', xpRequired: 1600, cumulativeXP: 5000, neuronsReward: 10 },
    { level: 9, title: 'Sage', xpRequired: 2000, cumulativeXP: 7000, neuronsReward: 10 },
    { level: 10, title: 'Polymath', xpRequired: 3000, cumulativeXP: 10000, neuronsReward: 10 },
];

// ============================================
// XP CONFIG
// ============================================

export const XP_CONFIG = {
    lesson: 10,
    quizCorrect: 2,
    quizCorrectHard: 4,
    perfectQuizBonus: 15,
    quizComplete: 20,
    immersiveChunk: 5,
    podcast: 8,
    conversational: 10,
    dailyLogin: 5,
    streakBonus7: 2,
    streakBonus30: 5,
    communityPost: 3,
    helpfulAnswer: 10,
    courseComplete: 100,
} as const;

export const COMBO_MULTIPLIERS = [
    { minStreak: 1, multiplier: 1 },
    { minStreak: 3, multiplier: 1.25 },
    { minStreak: 5, multiplier: 1.5 },
    { minStreak: 7, multiplier: 1.75 },
    { minStreak: 10, multiplier: 2 },
] as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(xp: number): { level: number; title: string } {
    for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_CONFIG[i].cumulativeXP) {
            return { level: LEVEL_CONFIG[i].level, title: LEVEL_CONFIG[i].title };
        }
    }
    return { level: 1, title: 'Novice' };
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_CONFIG.length) return 0;
    return LEVEL_CONFIG[currentLevel].cumulativeXP;
}

/**
 * Get XP progress within current level (0-100)
 */
export function getLevelProgress(xp: number, level: number): number {
    if (level >= LEVEL_CONFIG.length) return 100;

    const currentLevelXP = LEVEL_CONFIG[level - 1].cumulativeXP;
    const nextLevelXP = LEVEL_CONFIG[level].cumulativeXP;
    const xpInLevel = xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;

    return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));
}

/**
 * Get combo multiplier for consecutive correct answers
 */
export function getComboMultiplier(streak: number): number {
    for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
        if (streak >= COMBO_MULTIPLIERS[i].minStreak) {
            return COMBO_MULTIPLIERS[i].multiplier;
        }
    }
    return 1;
}

/**
 * Get level config for a specific level
 */
export function getLevelConfig(level: number): LevelConfig | undefined {
    return LEVEL_CONFIG.find(l => l.level === level);
}

/**
 * Check if date is today (ISO date strings)
 */
export function isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
}

/**
 * Check if date was yesterday
 */
export function isYesterday(dateStr: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateStr === yesterday.toISOString().split('T')[0];
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_GAMIFICATION: UserGamification = {
    xp: 0,
    level: 1,
    neurons: 0,
    streak: {
        current: 0,
        longest: 0,
        lastActiveDate: '',
        freezesRemaining: 1,
        freezeUsedThisWeek: false,
    },
    stats: {
        totalXPEarned: 0,
        totalQuizzes: 0,
        perfectQuizzes: 0,
        longestCombo: 0,
        totalLessons: 0,
        totalCoursesCompleted: 0,
        totalStudyTimeMinutes: 0,
    },
    earnedBadges: [],
    preferences: {
        soundEnabled: true,
        animationsEnabled: true,
        profileTheme: 'default',
    },
    updatedAt: new Date(),
};
