/**
 * Career Planner Agent
 * 
 * Creates detailed learning plans with proper skill sequencing and phase breakdowns.
 * This is Step 2 of the career generation pipeline.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerAgentConfig, CareerResearchBrief, DetailedLearningPlan, LearningPhasePlan } from '@/types/careerAgents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export class CareerPlannerAgent {
    private model: ReturnType<typeof genAI.getGenerativeModel>;
    private config: CareerAgentConfig;

    constructor(config?: Partial<CareerAgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.4,
            ...config
        };
        this.model = genAI.getGenerativeModel({
            model: this.config.model,
            generationConfig: {
                temperature: this.config.temperature,
                responseMimeType: "application/json",
            }
        });
    }

    async createLearningPlan(research: CareerResearchBrief): Promise<DetailedLearningPlan> {
        console.log(`[CareerPlannerAgent] Creating learning plan for: ${research.careerTitle}`);

        const skillDomainsText = research.skillDomains
            .map((s, i) => `${i + 1}. ${s.name} (${s.category}, ${s.importance}) - Topics: ${s.keyTopics.join(', ')}`)
            .join('\n');

        const prompt = `You are an expert curriculum designer and career coach. Create a comprehensive, structured learning plan for someone pursuing a career as a "${research.careerTitle}".

RESEARCH CONTEXT:
${research.overview}

SKILL DOMAINS TO COVER:
${skillDomainsText}

TIME TO CAREER ENTRY: ${research.entryRequirements.timeToEntry}

Create a learning plan with 4-6 phases that:
1. Start with foundation skills and prerequisites
2. Progress through core competencies
3. Build to advanced/specialized skills
4. End with job-ready preparation

Return a JSON object with this EXACT structure:
{
    "careerTitle": "${research.careerTitle}",
    "totalDuration": "X-Y months",
    "phases": [
        {
            "order": 1,
            "title": "Phase Title",
            "description": "Detailed description of what this phase covers and why",
            "estimatedDuration": "X-Y weeks",
            "targetSkills": [
                {
                    "skillId": "unique-skill-id",
                    "skillName": "Skill Name",
                    "targetProficiency": 70
                }
            ],
            "courseTopics": ["Topic for course 1", "Topic for course 2"],
            "milestones": [
                {
                    "id": "milestone-id",
                    "title": "Milestone title",
                    "type": "course" | "project" | "assessment" | "certification",
                    "requirement": "What needs to be done"
                }
            ]
        }
    ]
}

IMPORTANT:
- Each phase should have 2-4 target skills
- Each phase should have 2-4 course topics to generate courses for
- Include 2-4 milestones per phase
- Target proficiency should range from 50-90 depending on skill importance
- Milestones should be specific and measurable
- Ensure logical skill dependencies (foundation before advanced)`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse learning plan');
            }

            const data = JSON.parse(jsonMatch[0]);

            // Calculate estimated completion date
            const durationMatch = data.totalDuration?.match(/(\d+)/);
            const months = durationMatch ? parseInt(durationMatch[1]) : 6;
            const estimatedCompletion = new Date();
            estimatedCompletion.setMonth(estimatedCompletion.getMonth() + months);

            const plan: DetailedLearningPlan = {
                careerTitle: research.careerTitle,
                totalDuration: data.totalDuration || '6-9 months',
                phases: data.phases as LearningPhasePlan[],
                estimatedCompletion
            };

            console.log(`[CareerPlannerAgent] Plan created with ${plan.phases.length} phases`);
            return plan;

        } catch (error) {
            console.error('[CareerPlannerAgent] Error:', error);
            throw new Error(`Failed to create learning plan for: ${research.careerTitle}`);
        }
    }

    async refinePlan(
        plan: DetailedLearningPlan,
        userSkillStates: Record<string, number>
    ): Promise<DetailedLearningPlan> {
        // Adjust plan based on user's existing skills
        console.log(`[CareerPlannerAgent] Refining plan based on user skills`);

        const refinedPhases = plan.phases.map(phase => {
            const adjustedSkills = phase.targetSkills.map(skill => {
                const currentProficiency = userSkillStates[skill.skillId] || 0;
                // If user already has proficiency, adjust target or skip
                const adjustedTarget = Math.max(skill.targetProficiency, currentProficiency + 20);
                return {
                    ...skill,
                    targetProficiency: Math.min(adjustedTarget, 100)
                };
            });

            return {
                ...phase,
                targetSkills: adjustedSkills
            };
        });

        return {
            ...plan,
            phases: refinedPhases
        };
    }
}
