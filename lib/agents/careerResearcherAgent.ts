/**
 * Career Researcher Agent
 * 
 * Researches career requirements, market data, skills, and creates comprehensive research briefs.
 * This is Step 1 of the career generation pipeline.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CareerAgentConfig, CareerResearchBrief, SkillDomainBrief } from '@/types/careerAgents';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_IMAGE_API_KEY || '';
if (!apiKey) {
    console.error('[CareerResearcherAgent] WARNING: No API key found in GEMINI_API_KEY, GOOGLE_API_KEY, or GEMINI_IMAGE_API_KEY');
}
const genAI = new GoogleGenerativeAI(apiKey);

export class CareerResearcherAgent {
    private model: ReturnType<typeof genAI.getGenerativeModel>;
    private config: CareerAgentConfig;

    constructor(config?: Partial<CareerAgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash',
            temperature: 0.3, // Lower temperature for factual accuracy
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

    async researchCareer(careerTitle: string): Promise<CareerResearchBrief> {
        console.log(`[CareerResearcherAgent] Researching career: ${careerTitle}`);

        if (!apiKey) {
            throw new Error('No Gemini API key configured. Please set GEMINI_API_KEY, GOOGLE_API_KEY, or GEMINI_IMAGE_API_KEY environment variable.');
        }

        const prompt = `You are an expert career advisor and labor market analyst. Research the career "${careerTitle}" comprehensively.

Provide detailed, accurate, and current information about this career path.

Return a JSON object with this EXACT structure:
{
    "careerTitle": "${careerTitle}",
    "overview": "Comprehensive 3-4 sentence overview of this career",
    "marketData": {
        "demand": "low" | "medium" | "high" | "very-high",
        "demandTrend": "declining" | "stable" | "growing" | "booming",
        "salaryRange": { "min": 50000, "max": 150000, "median": 85000 },
        "topIndustries": ["Industry 1", "Industry 2", "Industry 3"],
        "topLocations": ["City 1", "City 2", "City 3"],
        "growthOutlook": "Detailed outlook explanation"
    },
    "entryRequirements": {
        "difficulty": "beginner-friendly" | "moderate" | "challenging" | "expert",
        "typicalBackgrounds": ["Background 1", "Background 2"],
        "timeToEntry": "X-Y months",
        "certifications": [
            { "name": "Cert Name", "provider": "Provider", "importance": "essential" | "important" | "nice-to-have" }
        ]
    },
    "aiImpact": {
        "automationRisk": "very-low" | "low" | "medium" | "high",
        "riskExplanation": "Explanation of AI impact on this career",
        "futureProofSkills": ["Skill 1", "Skill 2"],
        "aiAugmentation": "How AI tools help professionals in this field"
    },
    "skillDomains": [
        {
            "name": "Skill Domain Name",
            "category": "foundation" | "core" | "advanced" | "soft-skill",
            "importance": "essential" | "important" | "nice-to-have",
            "dependencies": ["Prerequisite skill if any"],
            "estimatedTimeToLearn": "X-Y weeks",
            "keyTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]
        }
    ],
    "relatedCareers": ["Related Career 1", "Related Career 2", "Related Career 3"]
}

IMPORTANT:
- Include 6-10 skill domains covering foundation, core, advanced, and soft skills
- Each skill domain should have 5-8 key topics for course generation
- Salary ranges should be realistic USD annual figures
- Be specific and actionable, not generic`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse and clean the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('[CareerResearcherAgent] Response was not valid JSON:', text.substring(0, 500));
                throw new Error('Failed to parse research brief - AI response was not valid JSON');
            }

            const data = JSON.parse(jsonMatch[0]);

            // Validate skill domains
            if (!data.skillDomains || data.skillDomains.length < 5) {
                console.warn('[CareerResearcherAgent] Insufficient skill domains, may need revision');
            }

            const brief: CareerResearchBrief = {
                ...data,
                careerTitle, // Ensure title matches input
                generatedAt: new Date()
            };

            console.log(`[CareerResearcherAgent] Research complete: ${brief.skillDomains?.length || 0} skill domains identified`);
            return brief;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[CareerResearcherAgent] Error researching career:', errorMessage);

            // Check for specific error types
            if (errorMessage.includes('403') || errorMessage.includes('API_KEY')) {
                throw new Error(`API key error: ${errorMessage}. Please verify your Gemini API key is valid.`);
            } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
                throw new Error(`Rate limit exceeded. Please wait a moment and try again.`);
            } else if (errorMessage.includes('Failed to parse')) {
                throw error; // Re-throw parsing errors as-is
            }

            throw new Error(`Failed to research career "${careerTitle}": ${errorMessage}`);
        }
    }

    async identifyRelatedCareers(careerTitle: string, count: number = 5): Promise<string[]> {
        const prompt = `List ${count} careers closely related to "${careerTitle}" that share transferable skills.
Return ONLY a JSON array of career title strings.
Example: ["Career 1", "Career 2", "Career 3"]`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error('[CareerResearcherAgent] Error identifying related careers:', error);
            return [`Senior ${careerTitle}`, `Lead ${careerTitle}`, `${careerTitle} Manager`];
        }
    }
}
