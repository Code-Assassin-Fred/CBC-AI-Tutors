import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { SkillAssessmentBank, AssessmentResult } from '@/types/careerAgents';

// GET: Fetch assessment bank for a skill
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const skillId = searchParams.get('skillId');
        const careerPathId = searchParams.get('careerPathId');

        if (skillId) {
            // Fetch specific skill assessment bank
            const bankDoc = await adminDb.collection('skillAssessmentBanks').doc(skillId).get();

            if (!bankDoc.exists) {
                return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
            }

            const bank = bankDoc.data() as SkillAssessmentBank;
            return NextResponse.json({ assessmentBank: bank });
        }

        if (careerPathId) {
            // Fetch all assessment banks for a career path
            const banksSnapshot = await adminDb
                .collection('skillAssessmentBanks')
                .where('careerPathId', '==', careerPathId)
                .get();

            const banks: SkillAssessmentBank[] = banksSnapshot.docs.map(doc => doc.data() as SkillAssessmentBank);

            return NextResponse.json({ assessmentBanks: banks });
        }

        return NextResponse.json({ error: 'Missing skillId or careerPathId' }, { status: 400 });

    } catch (error) {
        console.error('[Career Assessment API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
    }
}

// POST: Submit assessment answers and get results
export async function POST(req: NextRequest) {
    try {
        const { skillId, userId, answers, careerPathId } = await req.json();

        if (!skillId || !userId || !answers) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch the assessment bank
        const bankDoc = await adminDb.collection('skillAssessmentBanks').doc(skillId).get();

        if (!bankDoc.exists) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const bank = bankDoc.data() as SkillAssessmentBank;

        // Calculate scores
        const byDifficulty = {
            easy: { total: 0, correct: 0 },
            medium: { total: 0, correct: 0 },
            hard: { total: 0, correct: 0 }
        };

        bank.questions.forEach(q => {
            byDifficulty[q.difficulty].total++;
            if (answers[q.id] === q.correctAnswer) {
                byDifficulty[q.difficulty].correct++;
            }
        });

        // Weighted scoring: easy=1, medium=1.5, hard=2
        const totalWeighted = byDifficulty.easy.total * 1 +
            byDifficulty.medium.total * 1.5 +
            byDifficulty.hard.total * 2;

        const correctWeighted = byDifficulty.easy.correct * 1 +
            byDifficulty.medium.correct * 1.5 +
            byDifficulty.hard.correct * 2;

        const score = Math.round((correctWeighted / totalWeighted) * 100);

        // Determine proficiency level
        let proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
        let feedback: string;

        if (score >= 80) {
            proficiencyLevel = 'advanced';
            feedback = `Excellent! You have strong proficiency in ${bank.skillName}. You're ready for advanced topics.`;
        } else if (score >= 50) {
            proficiencyLevel = 'intermediate';
            feedback = `Good progress on ${bank.skillName}! Focus on strengthening medium and hard difficulty areas.`;
        } else {
            proficiencyLevel = 'beginner';
            feedback = `You're just getting started with ${bank.skillName}. Review the foundational concepts before moving on.`;
        }

        const result: AssessmentResult = {
            skillId,
            skillName: bank.skillName,
            totalQuestions: bank.questionCount,
            correctAnswers: byDifficulty.easy.correct + byDifficulty.medium.correct + byDifficulty.hard.correct,
            score,
            byDifficulty,
            proficiencyLevel,
            feedback,
            completedAt: new Date()
        };

        // Save result to user's career profile
        const userCareerRef = adminDb.collection('userCareerProfiles').doc(userId);
        await userCareerRef.set({
            skillStates: {
                [skillId]: {
                    proficiency: score,
                    lastAssessedAt: FieldValue.serverTimestamp(),
                    sources: FieldValue.arrayUnion({
                        type: 'assessment',
                        value: score,
                        timestamp: new Date().toISOString()
                    })
                }
            },
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // Save detailed result
        const resultRef = adminDb.collection('assessmentResults').doc();
        await resultRef.set({
            ...result,
            id: resultRef.id,
            odI: userId,
            careerPathId,
            completedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ result });

    } catch (error) {
        console.error('[Career Assessment API] Error:', error);
        return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }
}

// PUT: Generate new assessment bank for a skill
export async function PUT(req: NextRequest) {
    try {
        const { skillName, keyTopics, careerPathId, userId } = await req.json();

        if (!skillName || !keyTopics || !careerPathId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Import assessment generator dynamically
        const { AssessmentGeneratorAgent } = await import('@/lib/agents/assessmentGeneratorAgent');
        const generator = new AssessmentGeneratorAgent();

        const bank = await generator.generateAssessmentBank(
            {
                name: skillName,
                category: 'core',
                importance: 'essential',
                dependencies: [],
                estimatedTimeToLearn: '2-4 weeks',
                keyTopics
            },
            careerPathId,
            12
        );

        // Save to Firestore
        await adminDb.collection('skillAssessmentBanks').doc(bank.skillId).set({
            ...bank,
            createdAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json({ assessmentBank: bank });

    } catch (error) {
        console.error('[Career Assessment API] Error:', error);
        return NextResponse.json({ error: 'Failed to generate assessment' }, { status: 500 });
    }
}
