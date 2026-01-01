/**
 * Assessment Generator Agent
 * 
 * Generates comprehensive skill assessment banks with 10-15 questions per skill domain.
 * This agent creates questions across easy, medium, and hard difficulties.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerAgentConfig, SkillAssessmentBank, AssessmentQuestion } from '@/types/careerAgents';
import { SkillDomainBrief } from '@/types/careerAgents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '');

export class AssessmentGeneratorAgent {
    private model: ReturnType<typeof genAI.getGenerativeModel>;
    private config: CareerAgentConfig;

    constructor(config?: Partial<CareerAgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.5,
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

    async generateAssessmentBank(
        skillDomain: SkillDomainBrief,
        careerPathId: string,
        questionCount: number = 12
    ): Promise<SkillAssessmentBank> {
        console.log(`[AssessmentGeneratorAgent] Generating ${questionCount} questions for: ${skillDomain.name}`);

        const topicsText = skillDomain.keyTopics.join(', ');

        const prompt = `You are an expert assessment designer. Create a comprehensive skill assessment for "${skillDomain.name}".

SKILL DOMAIN: ${skillDomain.name}
CATEGORY: ${skillDomain.category}
KEY TOPICS: ${topicsText}

Generate exactly ${questionCount} multiple-choice questions with:
- 4 easy questions (fundamental concepts)
- 5 medium questions (application and understanding)
- 3 hard questions (advanced problem-solving)

Return a JSON object with this EXACT structure:
{
    "questions": [
        {
            "id": "q1",
            "question": "Clear, well-formatted question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "difficulty": "easy" | "medium" | "hard",
            "explanation": "Brief explanation of why this answer is correct",
            "topic": "The specific topic this question covers"
        }
    ]
}

IMPORTANT GUIDELINES:
1. Questions should test real understanding, not just definitions
2. Each question must have exactly 4 options
3. correctAnswer is the 0-indexed position of the correct option
4. Cover different topics from the key topics list
5. Easy questions: test basic knowledge and terminology
6. Medium questions: test application and understanding
7. Hard questions: test analysis, synthesis, and problem-solving
8. Explanations should be educational and helpful
9. Avoid trick questions - focus on genuine understanding`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse assessment questions');
            }

            const data = JSON.parse(jsonMatch[0]);

            // Validate questions
            const questions: AssessmentQuestion[] = data.questions.map((q: AssessmentQuestion, idx: number) => ({
                id: q.id || `q${idx + 1}`,
                question: q.question,
                options: q.options.slice(0, 4), // Ensure exactly 4 options
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty,
                explanation: q.explanation || 'This is the correct answer based on the topic concepts.',
                topic: q.topic || skillDomain.keyTopics[idx % skillDomain.keyTopics.length]
            }));

            const bank: SkillAssessmentBank = {
                skillId: `skill-${skillDomain.name.toLowerCase().replace(/\s+/g, '-')}`,
                skillName: skillDomain.name,
                careerPathId,
                questions,
                questionCount: questions.length,
                createdAt: new Date()
            };

            console.log(`[AssessmentGeneratorAgent] Generated ${bank.questionCount} questions for ${skillDomain.name}`);
            return bank;

        } catch (error) {
            console.error('[AssessmentGeneratorAgent] Error:', error);
            throw new Error(`Failed to generate assessment for: ${skillDomain.name}`);
        }
    }

    async generateBatchAssessments(
        skillDomains: SkillDomainBrief[],
        careerPathId: string,
        questionsPerSkill: number = 12
    ): Promise<SkillAssessmentBank[]> {
        console.log(`[AssessmentGeneratorAgent] Generating assessments for ${skillDomains.length} skills`);

        const banks: SkillAssessmentBank[] = [];

        for (const domain of skillDomains) {
            try {
                const bank = await this.generateAssessmentBank(domain, careerPathId, questionsPerSkill);
                banks.push(bank);
            } catch (error) {
                console.error(`[AssessmentGeneratorAgent] Failed for ${domain.name}:`, error);
                // Continue with other skills
            }
        }

        console.log(`[AssessmentGeneratorAgent] Generated ${banks.length}/${skillDomains.length} assessment banks`);
        return banks;
    }

    calculateProficiency(
        questions: AssessmentQuestion[],
        answers: Record<string, number>
    ): {
        score: number;
        byDifficulty: { easy: { total: number; correct: number }; medium: { total: number; correct: number }; hard: { total: number; correct: number } };
        proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
    } {
        const byDifficulty = {
            easy: { total: 0, correct: 0 },
            medium: { total: 0, correct: 0 },
            hard: { total: 0, correct: 0 }
        };

        questions.forEach(q => {
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

        let proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
        if (score >= 80) {
            proficiencyLevel = 'advanced';
        } else if (score >= 50) {
            proficiencyLevel = 'intermediate';
        } else {
            proficiencyLevel = 'beginner';
        }

        return { score, byDifficulty, proficiencyLevel };
    }
}
