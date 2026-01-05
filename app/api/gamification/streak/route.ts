import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    UserGamification,
    DEFAULT_GAMIFICATION,
    getTodayISO,
    isYesterday,
    XP_CONFIG,
} from '@/types/gamification';

// POST /api/gamification/streak
// Check and update streak on daily login
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const gamificationRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('gamification')
            .doc('stats');

        const doc = await gamificationRef.get();
        let gamification: UserGamification;

        if (!doc.exists) {
            gamification = { ...DEFAULT_GAMIFICATION, updatedAt: new Date() };
        } else {
            gamification = doc.data() as UserGamification;
        }

        const today = getTodayISO();
        const lastActiveDate = gamification.streak.lastActiveDate;

        // Already checked in today
        if (lastActiveDate === today) {
            return NextResponse.json({
                streak: gamification.streak,
                dailyBonusAwarded: false,
            });
        }

        let newStreak = gamification.streak;
        let dailyBonusAwarded = false;
        let dailyBonusAmount = 0;
        let newXP = gamification.xp;

        if (isYesterday(lastActiveDate)) {
            // Streak continues!
            const newCurrent = gamification.streak.current + 1;
            newStreak = {
                ...gamification.streak,
                current: newCurrent,
                longest: Math.max(newCurrent, gamification.streak.longest),
                lastActiveDate: today,
            };

            // Award daily login XP + streak bonus
            dailyBonusAmount = XP_CONFIG.dailyLogin;
            if (newCurrent >= 30) {
                dailyBonusAmount += XP_CONFIG.streakBonus30;
            } else if (newCurrent >= 7) {
                dailyBonusAmount += XP_CONFIG.streakBonus7;
            }

            newXP += dailyBonusAmount;
            dailyBonusAwarded = true;
        } else if (lastActiveDate === '') {
            // First time user
            newStreak = {
                ...gamification.streak,
                current: 1,
                longest: 1,
                lastActiveDate: today,
            };
            dailyBonusAmount = XP_CONFIG.dailyLogin;
            newXP += dailyBonusAmount;
            dailyBonusAwarded = true;
        } else {
            // Streak broken - check if freeze was used
            if (gamification.streak.freezesRemaining > 0 && !gamification.streak.freezeUsedThisWeek) {
                // Could use freeze, but that's a separate action
                // For now, reset streak
                newStreak = {
                    current: 1,
                    longest: gamification.streak.longest,
                    lastActiveDate: today,
                    freezesRemaining: gamification.streak.freezesRemaining,
                    freezeUsedThisWeek: false,
                };
            } else {
                newStreak = {
                    current: 1,
                    longest: gamification.streak.longest,
                    lastActiveDate: today,
                    freezesRemaining: 1, // Reset weekly freeze
                    freezeUsedThisWeek: false,
                };
            }
            dailyBonusAmount = XP_CONFIG.dailyLogin;
            newXP += dailyBonusAmount;
            dailyBonusAwarded = true;
        }

        // Update in database
        await gamificationRef.set({
            streak: newStreak,
            xp: newXP,
            stats: {
                ...gamification.stats,
                totalXPEarned: gamification.stats.totalXPEarned + (dailyBonusAwarded ? dailyBonusAmount : 0),
            },
            updatedAt: new Date(),
        }, { merge: true });

        return NextResponse.json({
            streak: newStreak,
            dailyBonusAwarded,
            dailyBonusAmount,
            newXP,
        });
    } catch (error) {
        console.error('Error checking streak:', error);
        return NextResponse.json({ error: 'Failed to check streak' }, { status: 500 });
    }
}

// GET /api/gamification/streak?userId=xxx
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const gamificationRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('gamification')
            .doc('stats');

        const doc = await gamificationRef.get();

        if (!doc.exists) {
            return NextResponse.json({ streak: DEFAULT_GAMIFICATION.streak });
        }

        const gamification = doc.data() as UserGamification;
        return NextResponse.json({ streak: gamification.streak });
    } catch (error) {
        console.error('Error fetching streak:', error);
        return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
    }
}
