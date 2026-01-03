import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import {
    StudyBlock,
    LearningGoal,
    StudyStreak
} from '@/types/schedule';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Fetch blocks
        const blocksSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('studyBlocks')
            .get();

        const blocks = blocksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as StudyBlock[];

        // Fetch goals
        const goalsSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('learningGoals')
            .get();

        const goals = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as LearningGoal[];

        // Fetch streak
        const streakDoc = await adminDb
            .collection('users')
            .doc(userId)
            .collection('metadata')
            .doc('studyStreak')
            .get();

        const streak = streakDoc.exists
            ? streakDoc.data() as StudyStreak
            : {
                userId,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: '',
                totalStudyDays: 0,
                weeklyStudyDays: [0, 0, 0, 0, 0, 0, 0],
            };

        return NextResponse.json({
            blocks,
            goals,
            streak,
        });

    } catch (error) {
        console.error('Schedule GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedule' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, data } = body;

        if (!data.userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        if (type === 'block') {
            const blockRef = adminDb
                .collection('users')
                .doc(data.userId)
                .collection('studyBlocks')
                .doc();

            const block: StudyBlock = {
                ...data,
                id: blockRef.id,
                completed: false,
                createdAt: new Date().toISOString(),
            };

            await blockRef.set(block);
            return NextResponse.json({ success: true, block });

        } else if (type === 'goal') {
            const goalRef = adminDb
                .collection('users')
                .doc(data.userId)
                .collection('learningGoals')
                .doc();

            const goal: LearningGoal = {
                ...data,
                id: goalRef.id,
                completedHours: 0,
                createdAt: new Date().toISOString(),
            };

            await goalRef.set(goal);
            return NextResponse.json({ success: true, goal });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    } catch (error) {
        console.error('Schedule POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create item' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, id, updates, userId } = body;

        if (!id || !type || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const collection = type === 'block' ? 'studyBlocks' : type === 'goal' ? 'learningGoals' : 'metadata';
        const docRef = type === 'streak'
            ? adminDb.collection('users').doc(userId).collection('metadata').doc('studyStreak')
            : adminDb.collection('users').doc(userId).collection(collection).doc(id);

        if (type === 'streak') {
            await docRef.set({
                ...updates,
                userId,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } else {
            await docRef.update({
                ...updates,
                updatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Schedule PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type');
        const userId = searchParams.get('userId');

        if (!id || !type || !userId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const collection = type === 'block' ? 'studyBlocks' : 'learningGoals';
        await adminDb
            .collection('users')
            .doc(userId)
            .collection(collection)
            .doc(id)
            .delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Schedule DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
