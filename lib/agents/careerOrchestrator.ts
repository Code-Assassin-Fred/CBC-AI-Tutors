/**
 * Career Orchestrator
 * 
 * Coordinates all career agents in a pipeline to generate complete career paths
 * with courses, assessments, and learning plans.
 */

import { CareerResearcherAgent } from './careerResearcherAgent';
import { CareerPlannerAgent } from './careerPlannerAgent';
import { AssessmentGeneratorAgent } from './assessmentGeneratorAgent';
import { CareerCourseGeneratorAgent } from './careerCourseGeneratorAgent';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import {
    CareerGenerationEvent,
    CareerGenerationPhase,
    CareerResearchBrief,
    DetailedLearningPlan,
    SkillAssessmentBank,
    CareerCourse,
    CareerCourseGenerationRequest
} from '@/types/careerAgents';
import { CareerPath, SkillCategory, Skill, PersonalizedLearningPlan, LearningPhase } from '@/types/career';
import { CourseLesson } from '@/types/course';

export interface OrchestrationCallbacks {
    onProgress: (event: CareerGenerationEvent) => void;
}

export interface OrchestrationResult {
    careerPath: CareerPath;
    learningPlan: PersonalizedLearningPlan;
    courses: CareerCourse[];
    assessmentBanks: SkillAssessmentBank[];
}

export class CareerOrchestrator {
    private researcher: CareerResearcherAgent;
    private planner: CareerPlannerAgent;
    private assessmentGenerator: AssessmentGeneratorAgent;
    private courseGenerator: CareerCourseGeneratorAgent;

    constructor() {
        this.researcher = new CareerResearcherAgent();
        this.planner = new CareerPlannerAgent();
        this.assessmentGenerator = new AssessmentGeneratorAgent();
        this.courseGenerator = new CareerCourseGeneratorAgent();
    }

    async generateCareerPath(
        careerTitle: string,
        userId: string,
        callbacks: OrchestrationCallbacks
    ): Promise<OrchestrationResult> {
        const careerPathId = `career-${Date.now()}`;
        let currentPhase: CareerGenerationPhase = 'initializing';

        const sendProgress = (phase: CareerGenerationPhase, message: string, progress: number) => {
            currentPhase = phase;
            callbacks.onProgress({
                type: 'progress',
                phase,
                message,
                progress
            });
        };

        try {
            // ========================================
            // PHASE 1: RESEARCH
            // ========================================
            sendProgress('researching', `Researching ${careerTitle} career...`, 5);
            const research = await this.researcher.researchCareer(careerTitle);
            console.log(`[CareerOrchestrator] Research complete: ${research.skillDomains.length} skill domains`);
            sendProgress('researching', 'Market analysis complete', 15);

            // ========================================
            // PHASE 2: PLANNING
            // ========================================
            sendProgress('planning', 'Creating personalized learning roadmap...', 20);
            const detailedPlan = await this.planner.createLearningPlan(research);
            console.log(`[CareerOrchestrator] Plan created: ${detailedPlan.phases.length} phases`);
            sendProgress('planning', `${detailedPlan.phases.length}-phase learning plan ready`, 30);

            // ========================================
            // PHASE 3: GENERATE COURSES
            // ========================================
            sendProgress('generating-courses', 'Generating AI-curated courses...', 35);
            const allCourses: CareerCourse[] = [];
            const allLessons: CourseLesson[] = [];

            // Generate 1-2 courses per phase to avoid overwhelming
            for (let phaseIdx = 0; phaseIdx < detailedPlan.phases.length; phaseIdx++) {
                const phase = detailedPlan.phases[phaseIdx];
                const courseTopics = phase.courseTopics.slice(0, 2); // Max 2 courses per phase

                for (let topicIdx = 0; topicIdx < courseTopics.length; topicIdx++) {
                    const topic = courseTopics[topicIdx];
                    const progressPercent = 35 + ((phaseIdx * courseTopics.length + topicIdx) / (detailedPlan.phases.length * 2)) * 25;

                    sendProgress('generating-courses', `Creating course: ${topic}`, progressPercent);

                    try {
                        const request: CareerCourseGenerationRequest = {
                            careerTitle,
                            skillName: topic,
                            skillTopics: research.skillDomains
                                .find(d => d.keyTopics.some(t => t.includes(topic.split(' ')[0])))?.keyTopics || [topic],
                            difficulty: phaseIdx === 0 ? 'beginner' : phaseIdx === detailedPlan.phases.length - 1 ? 'advanced' : 'intermediate',
                            targetAudience: `Someone learning ${careerTitle}`
                        };

                        const { course, lessons } = await this.courseGenerator.generateCourse(
                            request,
                            careerPathId,
                            `skill-${phaseIdx}-${topicIdx}`,
                            phase.order
                        );
                        course.order = allCourses.length + 1;
                        allCourses.push(course);
                        allLessons.push(...lessons);

                        callbacks.onProgress({
                            type: 'course-generated',
                            message: `Generated: ${course.title}`,
                            progress: progressPercent,
                            data: { courseId: course.id, title: course.title }
                        });
                    } catch (error) {
                        console.error(`[CareerOrchestrator] Course generation failed for ${topic}:`, error);
                    }
                }
            }

            console.log(`[CareerOrchestrator] Courses generated: ${allCourses.length}`);
            sendProgress('generating-courses', `${allCourses.length} courses created`, 60);

            // ========================================
            // PHASE 4: GENERATE ASSESSMENTS
            // ========================================
            sendProgress('generating-assessments', 'Creating skill assessments...', 65);
            const assessmentBanks: SkillAssessmentBank[] = [];

            // Generate assessments for top skill domains
            const importantDomains = research.skillDomains
                .filter(d => d.importance === 'essential' || d.importance === 'important')
                .slice(0, 6);

            for (let i = 0; i < importantDomains.length; i++) {
                const domain = importantDomains[i];
                const progressPercent = 65 + (i / importantDomains.length) * 15;

                sendProgress('generating-assessments', `Assessment: ${domain.name}`, progressPercent);

                try {
                    const bank = await this.assessmentGenerator.generateAssessmentBank(domain, careerPathId, 12);
                    assessmentBanks.push(bank);
                } catch (error) {
                    console.error(`[CareerOrchestrator] Assessment generation failed for ${domain.name}:`, error);
                }
            }

            console.log(`[CareerOrchestrator] Assessments generated: ${assessmentBanks.length}`);
            sendProgress('generating-assessments', `${assessmentBanks.length} skill assessments ready`, 80);

            // ========================================
            // PHASE 5: BUILD CAREER PATH OBJECT
            // ========================================
            sendProgress('saving', 'Finalizing your career path...', 85);

            // Build skill categories from research
            const skillCategories: SkillCategory[] = this.buildSkillCategories(research, assessmentBanks, allCourses);

            // Build the complete career path
            const careerPath: CareerPath = {
                id: careerPathId,
                title: careerTitle,
                description: research.overview,
                generatedAt: new Date(),
                source: 'ai-generated',
                userId,
                savedAt: new Date(),
                skillCategories,
                totalSkillCount: research.skillDomains.length,
                courseIds: allCourses.map(c => c.id),
                market: {
                    demand: research.marketData.demand,
                    demandTrend: research.marketData.demandTrend,
                    salaryRange: research.marketData.salaryRange,
                    topHiringIndustries: research.marketData.topIndustries,
                    topLocations: research.marketData.topLocations,
                    growthOutlook: research.marketData.growthOutlook
                },
                entry: {
                    difficulty: research.entryRequirements.difficulty,
                    typicalBackground: research.entryRequirements.typicalBackgrounds,
                    timeToEntry: research.entryRequirements.timeToEntry,
                    certifications: research.entryRequirements.certifications
                },
                aiImpact: research.aiImpact,
                resources: {
                    platformCourses: allCourses.map(c => c.id),
                    externalResources: [],
                    communities: [],
                    books: []
                },
                relatedCareers: research.relatedCareers,
                transitionPaths: []
            };

            // Build the learning plan with course IDs
            const learningPlan = this.buildLearningPlan(detailedPlan, careerPath, allCourses, userId);

            // ========================================
            // PHASE 6: SAVE TO FIRESTORE
            // ========================================
            sendProgress('saving', 'Saving your career path...', 90);
            await this.saveToFirestore(careerPath, learningPlan, allCourses, allLessons, assessmentBanks);
            sendProgress('saving', 'All data saved', 95);

            // ========================================
            // COMPLETE
            // ========================================
            sendProgress('complete', 'Career path ready!', 100);
            callbacks.onProgress({
                type: 'complete',
                phase: 'complete',
                message: 'Career path generated successfully!',
                progress: 100,
                data: { careerPathId, courseCount: allCourses.length, assessmentCount: assessmentBanks.length }
            });

            return {
                careerPath,
                learningPlan,
                courses: allCourses,
                assessmentBanks
            };

        } catch (error) {
            console.error('[CareerOrchestrator] Pipeline error:', error);
            callbacks.onProgress({
                type: 'error',
                phase: currentPhase,
                error: error instanceof Error ? error.message : 'Unknown error',
                progress: 0
            });
            throw error;
        }
    }

    private buildSkillCategories(
        research: CareerResearchBrief,
        assessmentBanks: SkillAssessmentBank[],
        courses: CareerCourse[]
    ): SkillCategory[] {
        const categories: Record<string, Skill[]> = {
            'Foundation': [],
            'Core Skills': [],
            'Advanced': [],
            'Soft Skills': []
        };

        research.skillDomains.forEach((domain, idx) => {
            const categoryName = domain.category === 'foundation' ? 'Foundation'
                : domain.category === 'core' ? 'Core Skills'
                    : domain.category === 'advanced' ? 'Advanced'
                        : 'Soft Skills';

            const assessmentBank = assessmentBanks.find(b => b.skillName === domain.name);
            const linkedCourse = courses.find(c => c.skillName === domain.name);

            const skill: Skill = {
                id: `skill-${idx}`,
                name: domain.name,
                importance: domain.importance,
                dependencies: domain.dependencies,
                assessmentQuestions: assessmentBank?.questions.slice(0, 3).map(q => ({
                    id: q.id,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty
                })) || [],
                assessmentBankId: assessmentBank?.skillId,
                proficiencyLevels: {
                    beginner: `Basic understanding of ${domain.name}`,
                    intermediate: `Can apply ${domain.name} concepts independently`,
                    advanced: `Expert level, can teach ${domain.name} to others`
                },
                learningResources: {
                    platformCourses: linkedCourse ? [linkedCourse.id] : [],
                    estimatedTimeToLearn: domain.estimatedTimeToLearn
                },
                linkedCourseId: linkedCourse?.id
            };

            categories[categoryName].push(skill);
        });

        return Object.entries(categories)
            .filter(([_, skills]) => skills.length > 0)
            .map(([name, skills], idx) => ({
                name,
                weight: name === 'Core Skills' ? 40 : name === 'Foundation' ? 30 : name === 'Advanced' ? 20 : 10,
                skills
            }));
    }

    private buildLearningPlan(
        detailedPlan: DetailedLearningPlan,
        careerPath: CareerPath,
        courses: CareerCourse[],
        userId: string
    ): PersonalizedLearningPlan {
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
                status: idx === 0 ? 'active' : 'locked',
                progress: 0
            };
        });

        return {
            id: `plan-${Date.now()}`,
            userId,
            careerPathId: careerPath.id,
            careerTitle: careerPath.title,
            createdAt: new Date(),
            lastAdaptedAt: new Date(),
            currentPhaseIndex: 0,
            overallProgress: 0,
            estimatedCompletion: detailedPlan.estimatedCompletion,
            phases,
            adaptationHistory: []
        };
    }

    private async saveToFirestore(
        careerPath: CareerPath,
        learningPlan: PersonalizedLearningPlan,
        courses: CareerCourse[],
        lessons: CourseLesson[],
        assessmentBanks: SkillAssessmentBank[]
    ): Promise<void> {
        const batch = adminDb.batch();

        // Save career path
        const careerRef = adminDb.collection('careerPaths').doc(careerPath.id);
        batch.set(careerRef, {
            ...careerPath,
            generatedAt: FieldValue.serverTimestamp(),
            savedAt: FieldValue.serverTimestamp()
        });

        // Save learning plan
        const planRef = adminDb.collection('learningPlans').doc(learningPlan.id);
        batch.set(planRef, {
            ...learningPlan,
            createdAt: FieldValue.serverTimestamp(),
            lastAdaptedAt: FieldValue.serverTimestamp()
        });

        // Save courses
        for (const course of courses) {
            const courseRef = adminDb.collection('careerCourses').doc(course.id);
            batch.set(courseRef, {
                ...course,
                createdAt: FieldValue.serverTimestamp()
            });
        }

        // Save lessons
        for (const lesson of lessons) {
            const lessonRef = adminDb.collection('careerCourseLessons').doc(lesson.id);
            batch.set(lessonRef, lesson);
        }

        // Save assessment banks
        for (const bank of assessmentBanks) {
            const bankRef = adminDb.collection('skillAssessmentBanks').doc(bank.skillId);
            batch.set(bankRef, {
                ...bank,
                createdAt: FieldValue.serverTimestamp()
            });
        }

        // Update user's career profile
        const userCareerRef = adminDb.collection('userCareerProfiles').doc(learningPlan.userId);
        batch.set(userCareerRef, {
            odI: learningPlan.userId,
            savedCareerIds: FieldValue.arrayUnion(careerPath.id),
            activeCareerPathId: careerPath.id,
            activeLearningPlanId: learningPlan.id,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        await batch.commit();
        console.log(`[CareerOrchestrator] Saved all data to Firestore`);
    }
}
