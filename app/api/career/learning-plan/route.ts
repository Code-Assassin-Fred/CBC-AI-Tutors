import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PersonalizedLearningPlan, LearningPhase, UserSkillState } from '@/types/career';

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
    try {
        const { userId, careerId, skillStates, careerTitle } = await req.json();

        if (!userId || !careerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`[LearningPlan] Generating plan for user: ${userId}, career: ${careerId} (${careerTitle || 'Unknown Career'})`);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        // Build skill context from current skill states
        const skillsContext = Object.values(skillStates as Record<string, UserSkillState>)
            .map(skill => `- ${skill.skillName}: ${skill.proficiency}% proficiency`)
            .join('\n') || 'No skills assessed yet';

        const prompt = `You are a career learning advisor AI. Generate a personalized learning plan for someone pursuing a career as a "${careerTitle || 'professional'}" based on their current skill levels.

Career Goal: ${careerTitle || 'Professional Development'}

User's Current Skills:
${skillsContext}

Generate a comprehensive learning plan with 3-4 phases. Return a JSON object with this exact structure:
{
    "phases": [
        {
            "order": 1,
            "title": "Phase Title",
            "description": "Brief description of what this phase covers",
            "estimatedDuration": "2-4 weeks",
            "targetSkills": [
                {
                    "skillId": "skill-id",
                    "skillName": "Skill Name",
                    "targetProficiency": 80
                }
            ],
            "recommendedCourses": ["Course 1", "Course 2"],
            "externalResources": [
                {
                    "title": "Resource Title",
                    "url": "https://example.com",
                    "type": "article",
                    "free": true
                }
            ],
            "milestones": [
                {
                    "id": "milestone-1",
                    "title": "Complete fundamentals course",
                    "type": "course",
                    "requirement": "Finish the introductory module",
                    "completed": false
                }
            ],
            "status": "active",
            "progress": 0
        }
    ],
    "estimatedTotalDuration": "3-6 months",
    "overallProgress": 0
}

Focus on:
1. Starting with foundational skills that have low proficiency
2. Building up to more advanced skills progressively
3. Including practical milestones and projects
4. Providing free resources when possible

Make the plan realistic and actionable.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse learning plan data');
        }

        const planData = JSON.parse(jsonMatch[0]);

        // Set phase statuses: first is active, rest are locked
        const phases: LearningPhase[] = planData.phases.map((phase: LearningPhase, index: number) => ({
            ...phase,
            status: index === 0 ? 'active' : 'locked',
            progress: 0,
        }));

        // Create the learning plan object
        const learningPlan: PersonalizedLearningPlan = {
            id: `plan-${Date.now()}`,
            userId,
            careerPathId: careerId,
            careerTitle: careerTitle || '',
            createdAt: new Date(),
            lastAdaptedAt: new Date(),
            currentPhaseIndex: 0,
            overallProgress: 0,
            estimatedCompletion: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // ~6 months
            phases,
            adaptationHistory: [],
        };

        console.log(`[LearningPlan] Successfully generated plan with ${phases.length} phases`);

        return NextResponse.json(learningPlan);

    } catch (error) {
        console.error('Learning plan generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate learning plan' },
            { status: 500 }
        );
    }
}
