import { NextRequest, NextResponse } from 'next/server';
import {
    StudyBlock,
    LearningGoal,
    StudyStreak,
} from '@/types/schedule';

// Sample data (in production, this would come from Firestore)
const sampleBlocks: StudyBlock[] = [];
const sampleGoals: LearningGoal[] = [];
const sampleStreak: StudyStreak = {
    userId: '',
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalStudyDays: 0,
    weeklyStudyDays: [0, 0, 0, 0, 0, 0, 0],
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const weekStart = searchParams.get('weekStart');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // TODO: Fetch from Firestore based on userId and weekStart
        // For now, return sample/empty data

        return NextResponse.json({
            blocks: sampleBlocks,
            goals: sampleGoals,
            streak: { ...sampleStreak, userId },
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

        if (type === 'block') {
            // Create study block
            const block: StudyBlock = {
                id: `block-${Date.now()}`,
                userId: data.userId,
                date: data.date,
                duration: data.duration,
                topic: data.topic,
                startTime: data.startTime,
                color: data.color || 'cyan',
                notes: data.notes,
                completed: false,
                createdAt: new Date(),
            };

            // TODO: Save to Firestore

            return NextResponse.json({ success: true, block });

        } else if (type === 'goal') {
            // Create learning goal
            const goal: LearningGoal = {
                id: `goal-${Date.now()}`,
                userId: data.userId,
                title: data.title,
                targetHours: data.targetHours,
                weekStart: data.weekStart,
                color: data.color || 'cyan',
                completedHours: 0,
                createdAt: new Date(),
            };

            // TODO: Save to Firestore

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
        const { type, id, updates } = body;

        // TODO: Update in Firestore

        return NextResponse.json({ success: true, id, updates });

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

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
        }

        // TODO: Delete from Firestore

        return NextResponse.json({ success: true, deleted: id });

    } catch (error) {
        console.error('Schedule DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
