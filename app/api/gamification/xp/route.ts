import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    XPAwardRequest,
    XPAwardResult,
    UserGamification,
    DEFAULT_GAMIFICATION,
    calculateLevelFromXP,
    getLevelConfig,
} from '@/types/gamification';

// POST /api/gamification/xp
export async function POST(request: NextRequest) {
    try {
        const body: XPAwardRequest = await request.json();
        const { userId, amount, source, description, multiplier } = body;

        if (!userId || amount === undefined || !source) {
            return NextResponse.json(
                { error: 'userId, amount, and source are required' },
                { status: 400 }
            );
        }

        const gamificationRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('gamification')
            .doc('stats');

        const xpLogRef = adminDb
            .collection('users')
            .doc(userId)
            .collection('gamification')
            .doc('stats')
            .collection('xpLog');

        // Get current stats
        const doc = await gamificationRef.get();
        let gamification: UserGamification;

        if (!doc.exists) {
            gamification = { ...DEFAULT_GAMIFICATION, updatedAt: new Date() };
        } else {
            gamification = doc.data() as UserGamification;
        }

        // Calculate XP with multiplier
        const xpAwarded = multiplier ? Math.floor(amount * multiplier) : amount;
        const newTotalXP = gamification.xp + xpAwarded;

        // Check for level up
        const oldLevel = gamification.level;
        const { level: newLevel, title } = calculateLevelFromXP(newTotalXP);
        const leveledUp = newLevel > oldLevel;

        // Calculate neurons if leveled up
        let neuronsAwarded = 0;
        if (leveledUp) {
            // Award neurons for each level gained
            for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
                const config = getLevelConfig(lvl);
                if (config) {
                    neuronsAwarded += config.neuronsReward;
                }
            }
        }

        // Update stats based on source
        const updatedStats = { ...gamification.stats };
        updatedStats.totalXPEarned += xpAwarded;

        switch (source) {
            case 'quiz':
                updatedStats.totalQuizzes += 1;
                break;
            case 'lesson':
                updatedStats.totalLessons += 1;
                break;
            case 'course_complete':
                updatedStats.totalCoursesCompleted += 1;
                break;
        }

        // Update gamification document
        const updatedGamification: Partial<UserGamification> = {
            xp: newTotalXP,
            level: newLevel,
            neurons: gamification.neurons + neuronsAwarded,
            stats: updatedStats,
            updatedAt: new Date(),
        };

        await gamificationRef.set(updatedGamification, { merge: true });

        // Log XP entry
        await xpLogRef.add({
            amount: xpAwarded,
            source,
            description: description || `Earned from ${source}`,
            multiplier: multiplier || 1,
            timestamp: new Date(),
        });

        const result: XPAwardResult = {
            xpAwarded,
            newTotalXP,
            leveledUp,
            newLevel: leveledUp ? newLevel : undefined,
            neuronsAwarded: neuronsAwarded > 0 ? neuronsAwarded : undefined,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error awarding XP:', error);
        return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 });
    }
}
