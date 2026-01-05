import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { DEFAULT_GAMIFICATION, UserGamification } from '@/types/gamification';

// GET /api/gamification/stats?userId=xxx
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
            // Initialize default gamification for new user
            const defaultData = {
                ...DEFAULT_GAMIFICATION,
                updatedAt: new Date(),
            };
            await gamificationRef.set(defaultData);

            return NextResponse.json({
                gamification: defaultData,
                badges: [],
            });
        }

        const gamification = doc.data() as UserGamification;

        // Get earned badges
        const badgesSnapshot = await adminDb
            .collection('badges')
            .where('__name__', 'in', gamification.earnedBadges.length > 0 ? gamification.earnedBadges : ['_none_'])
            .get();

        const badges = badgesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        return NextResponse.json({
            gamification,
            badges,
        });
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
