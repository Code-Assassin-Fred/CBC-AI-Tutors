import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { CareerPath, PersonalizedLearningPlan } from '@/types/career';
import { UserCareerData } from '@/types/careerAgents';

// GET: Fetch user's saved career paths
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Fetch user's career profile
        const profileDoc = await adminDb.collection('userCareerProfiles').doc(userId).get();

        if (!profileDoc.exists) {
            return NextResponse.json({
                savedCareers: [],
                activeCareerPathId: null,
                activeLearningPlanId: null,
                skillStates: {}
            });
        }

        const profile = profileDoc.data() as UserCareerData;

        // Fetch saved career paths
        const savedCareers: CareerPath[] = [];
        if (profile.savedCareerIds && profile.savedCareerIds.length > 0) {
            for (const careerId of profile.savedCareerIds) {
                const careerDoc = await adminDb.collection('careerPaths').doc(careerId).get();
                if (careerDoc.exists) {
                    savedCareers.push(careerDoc.data() as CareerPath);
                }
            }
        }

        // Fetch active learning plan if exists
        let activeLearningPlan: PersonalizedLearningPlan | null = null;
        if (profile.activeLearningPlanId) {
            const planDoc = await adminDb.collection('learningPlans').doc(profile.activeLearningPlanId).get();
            if (planDoc.exists) {
                activeLearningPlan = planDoc.data() as PersonalizedLearningPlan;
            }
        }

        return NextResponse.json({
            savedCareers,
            activeCareerPathId: profile.activeCareerPathId,
            activeLearningPlan,
            skillStates: profile.skillStates || {}
        });

    } catch (error) {
        console.error('[Career Save API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch saved careers' }, { status: 500 });
    }
}

// POST: Save a career path to user's profile
export async function POST(req: NextRequest) {
    try {
        const { userId, careerPathId, setActive = true } = await req.json();

        if (!userId || !careerPathId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify career path exists
        const careerDoc = await adminDb.collection('careerPaths').doc(careerPathId).get();

        if (!careerDoc.exists) {
            return NextResponse.json({ error: 'Career path not found' }, { status: 404 });
        }

        // Update user's career profile
        const userCareerRef = adminDb.collection('userCareerProfiles').doc(userId);

        const updateData: Record<string, unknown> = {
            odI: userId,
            savedCareerIds: FieldValue.arrayUnion(careerPathId),
            updatedAt: FieldValue.serverTimestamp()
        };

        if (setActive) {
            updateData.activeCareerPathId = careerPathId;
        }

        await userCareerRef.set(updateData, { merge: true });

        // Update the career path to mark it as saved by this user
        await adminDb.collection('careerPaths').doc(careerPathId).update({
            userId,
            savedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ success: true, careerPathId });

    } catch (error) {
        console.error('[Career Save API] Error:', error);
        return NextResponse.json({ error: 'Failed to save career path' }, { status: 500 });
    }
}

// DELETE: Remove a career path from user's saved list
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const careerPathId = searchParams.get('careerPathId');

        if (!userId || !careerPathId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update user's career profile
        const userCareerRef = adminDb.collection('userCareerProfiles').doc(userId);
        const profileDoc = await userCareerRef.get();

        if (profileDoc.exists) {
            const profile = profileDoc.data() as UserCareerData;

            const updateData: Record<string, unknown> = {
                savedCareerIds: (profile.savedCareerIds || []).filter((id: string) => id !== careerPathId),
                updatedAt: FieldValue.serverTimestamp()
            };

            // If this was the active career, clear it
            if (profile.activeCareerPathId === careerPathId) {
                updateData.activeCareerPathId = null;
                updateData.activeLearningPlanId = null;
            }

            await userCareerRef.update(updateData);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Career Save API] Error:', error);
        return NextResponse.json({ error: 'Failed to remove career path' }, { status: 500 });
    }
}
