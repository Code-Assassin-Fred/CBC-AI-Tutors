import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { CareerPlannerAgent } from '@/lib/agents/careerPlannerAgent';
import { PersonalizedLearningPlan, LearningPhase, CareerPath } from '@/types/career';
import { CareerResearchBrief, CareerCourse } from '@/types/careerAgents';

export async function POST(req: NextRequest) {
    try {
        const { userId, careerId, careerTitle, skillStates } = await req.json();

        if (!userId || !careerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`[LearningPlan] Generating plan for user: ${userId}, career: ${careerId}`);

        // Fetch the career path from Firestore
        const careerDoc = await adminDb.collection('careerPaths').doc(careerId).get();

        let careerPath: CareerPath | null = null;
        if (careerDoc.exists) {
            careerPath = careerDoc.data() as CareerPath;
        }

        // Fetch existing courses for this career (avoiding composite index by sorting in-memory)
        const coursesSnapshot = await adminDb
            .collection('careerCourses')
            .where('careerPathId', '==', careerId)
            .get();

        const courses: CareerCourse[] = coursesSnapshot.docs
            .map(doc => doc.data() as CareerCourse)
            .sort((a, b) => {
                // Sort by phaseOrder first, then by order
                if (a.phaseOrder !== b.phaseOrder) {
                    return (a.phaseOrder || 0) - (b.phaseOrder || 0);
                }
                return (a.order || 0) - (b.order || 0);
            });

        // If we have a career path with skill categories, use the planner agent
        if (careerPath && careerPath.skillCategories) {
            const planner = new CareerPlannerAgent();

            // Build a research brief from the career path data
            const researchBrief: CareerResearchBrief = {
                careerTitle: careerPath.title,
                overview: careerPath.description,
                marketData: {
                    demand: careerPath.market.demand,
                    demandTrend: careerPath.market.demandTrend,
                    salaryRange: careerPath.market.salaryRange,
                    topIndustries: careerPath.market.topHiringIndustries,
                    topLocations: careerPath.market.topLocations,
                    growthOutlook: careerPath.market.growthOutlook
                },
                entryRequirements: {
                    difficulty: careerPath.entry.difficulty,
                    typicalBackgrounds: careerPath.entry.typicalBackground,
                    timeToEntry: careerPath.entry.timeToEntry,
                    certifications: careerPath.entry.certifications
                },
                aiImpact: careerPath.aiImpact,
                skillDomains: careerPath.skillCategories.flatMap(cat =>
                    cat.skills.map(skill => ({
                        name: skill.name,
                        category: cat.name.toLowerCase().includes('foundation') ? 'foundation' as const
                            : cat.name.toLowerCase().includes('advanced') ? 'advanced' as const
                                : cat.name.toLowerCase().includes('soft') ? 'soft-skill' as const
                                    : 'core' as const,
                        importance: skill.importance,
                        dependencies: skill.dependencies,
                        estimatedTimeToLearn: skill.learningResources.estimatedTimeToLearn,
                        keyTopics: []
                    }))
                ),
                relatedCareers: careerPath.relatedCareers,
                generatedAt: new Date()
            };

            // Generate detailed learning plan
            const detailedPlan = await planner.createLearningPlan(researchBrief);

            // Build phases with course links
            const phases: LearningPhase[] = detailedPlan.phases.map((phase, idx) => {
                // Find courses for this phase
                const phaseCourses = courses.filter(c => c.phaseOrder === phase.order);

                return {
                    order: phase.order,
                    title: phase.title,
                    description: phase.description,
                    estimatedDuration: phase.estimatedDuration,
                    targetSkills: phase.targetSkills,
                    courseIds: phaseCourses.map(c => c.id),
                    recommendedCourses: phaseCourses.map(c => c.title),
                    externalResources: [],
                    milestones: phase.milestones.map(m => ({
                        id: m.id,
                        title: m.title,
                        type: m.type as 'course' | 'quiz' | 'project' | 'skill-level',
                        requirement: m.requirement,
                        completed: false
                    })),
                    status: idx === 0 ? 'active' as const : 'locked' as const,
                    progress: 0
                };
            });

            const learningPlan: PersonalizedLearningPlan = {
                id: `plan-${Date.now()}`,
                userId,
                careerPathId: careerId,
                careerTitle: careerPath.title,
                createdAt: new Date(),
                lastAdaptedAt: new Date(),
                currentPhaseIndex: 0,
                overallProgress: 0,
                estimatedCompletion: detailedPlan.estimatedCompletion,
                phases,
                adaptationHistory: []
            };

            // Save to Firestore
            await adminDb.collection('learningPlans').doc(learningPlan.id).set({
                ...learningPlan,
                createdAt: FieldValue.serverTimestamp(),
                lastAdaptedAt: FieldValue.serverTimestamp()
            });

            // Update user's active learning plan
            await adminDb.collection('userCareerProfiles').doc(userId).set({
                activeLearningPlanId: learningPlan.id,
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`[LearningPlan] Generated plan with ${phases.length} phases`);
            return NextResponse.json(learningPlan);
        }

        // Fallback: Generate a simple plan without the full agent
        const fallbackPhases: LearningPhase[] = [
            {
                order: 1,
                title: 'Foundations',
                description: `Build core knowledge and fundamental skills for ${careerTitle || 'your career'}`,
                estimatedDuration: '4-6 weeks',
                targetSkills: [],
                courseIds: courses.filter(c => c.phaseOrder === 1).map(c => c.id),
                recommendedCourses: courses.filter(c => c.phaseOrder === 1).map(c => c.title),
                externalResources: [],
                milestones: [
                    { id: '1', title: 'Complete introductory courses', type: 'course', requirement: 'Finish basics', completed: false },
                    { id: '2', title: 'Pass fundamentals quiz', type: 'quiz', requirement: 'Score 70%+', completed: false }
                ],
                status: 'active',
                progress: 0
            },
            {
                order: 2,
                title: 'Core Skills',
                description: 'Develop essential skills required for this career path',
                estimatedDuration: '6-8 weeks',
                targetSkills: [],
                courseIds: courses.filter(c => c.phaseOrder === 2).map(c => c.id),
                recommendedCourses: courses.filter(c => c.phaseOrder === 2).map(c => c.title),
                externalResources: [],
                milestones: [
                    { id: '3', title: 'Build first project', type: 'project', requirement: 'Complete project', completed: false }
                ],
                status: 'locked',
                progress: 0
            },
            {
                order: 3,
                title: 'Advanced Topics',
                description: 'Master advanced concepts and specializations',
                estimatedDuration: '4-6 weeks',
                targetSkills: [],
                courseIds: courses.filter(c => c.phaseOrder === 3).map(c => c.id),
                recommendedCourses: courses.filter(c => c.phaseOrder === 3).map(c => c.title),
                externalResources: [],
                milestones: [
                    { id: '4', title: 'Complete advanced course', type: 'course', requirement: 'Finish advanced material', completed: false }
                ],
                status: 'locked',
                progress: 0
            },
            {
                order: 4,
                title: 'Job Ready',
                description: 'Prepare for interviews and real-world work',
                estimatedDuration: '4 weeks',
                targetSkills: [],
                courseIds: courses.filter(c => c.phaseOrder === 4).map(c => c.id),
                recommendedCourses: courses.filter(c => c.phaseOrder === 4).map(c => c.title),
                externalResources: [],
                milestones: [
                    { id: '5', title: 'Build portfolio project', type: 'project', requirement: 'Showcase-ready project', completed: false },
                    { id: '6', title: 'Pass final assessment', type: 'quiz', requirement: 'Score 80%+', completed: false }
                ],
                status: 'locked',
                progress: 0
            }
        ];

        const learningPlan: PersonalizedLearningPlan = {
            id: `plan-${Date.now()}`,
            userId,
            careerPathId: careerId,
            careerTitle: careerTitle || '',
            createdAt: new Date(),
            lastAdaptedAt: new Date(),
            currentPhaseIndex: 0,
            overallProgress: 0,
            estimatedCompletion: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            phases: fallbackPhases,
            adaptationHistory: []
        };

        // Save to Firestore
        await adminDb.collection('learningPlans').doc(learningPlan.id).set({
            ...learningPlan,
            createdAt: FieldValue.serverTimestamp(),
            lastAdaptedAt: FieldValue.serverTimestamp()
        });

        return NextResponse.json(learningPlan);

    } catch (error) {
        console.error('Learning plan generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate learning plan' },
            { status: 500 }
        );
    }
}

// GET: Fetch a learning plan
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');
        const userId = searchParams.get('userId');

        if (planId) {
            const planDoc = await adminDb.collection('learningPlans').doc(planId).get();

            if (!planDoc.exists) {
                return NextResponse.json({ error: 'Learning plan not found' }, { status: 404 });
            }

            return NextResponse.json({ learningPlan: planDoc.data() });
        }

        if (userId) {
            // Fetch user's active learning plan
            const profileDoc = await adminDb.collection('userCareerProfiles').doc(userId).get();

            if (!profileDoc.exists) {
                return NextResponse.json({ learningPlan: null });
            }

            const profile = profileDoc.data();
            if (!profile?.activeLearningPlanId) {
                return NextResponse.json({ learningPlan: null });
            }

            const planDoc = await adminDb.collection('learningPlans').doc(profile.activeLearningPlanId).get();

            if (!planDoc.exists) {
                return NextResponse.json({ learningPlan: null });
            }

            return NextResponse.json({ learningPlan: planDoc.data() });
        }

        return NextResponse.json({ error: 'Missing planId or userId' }, { status: 400 });

    } catch (error) {
        console.error('[LearningPlan API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch learning plan' }, { status: 500 });
    }
}
