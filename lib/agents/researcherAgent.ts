import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
import { ResourceCategory } from '@/types/resource';
import { ResearchBrief, AgentConfig } from '@/types/resourceAgents';

export class ResearcherAgent {
    private model: any;
    private config: AgentConfig;

    constructor(config?: Partial<AgentConfig>) {
        this.config = {
            model: MODELS.flash,
            temperature: 0.2, // Low temperature for factual accuracy
            ...config
        };
    }

    async generateResearchBrief(
        topic: string,
        category: ResourceCategory,
        subcategory: string
    ): Promise<ResearchBrief> {
        console.log(`[ResearcherAgent] Starting research on: ${topic} (${category}/${subcategory})`);

        const prompt = `
            You are an expert academic researcher. Your task is to conduct a scholarly research brief on the topic: "${topic}".
            Context: This is for a high-quality educational resource in the category "${category}" > "${subcategory}".

            Please provide the following in valid JSON format:
            1. An overview of the topic.
            2. 5-7 key facts/concepts that must be covered, ensuring factual accuracy.
            3. 3-5 scholarly sources or reputable industry references (books, journals, seminal papers, or authoritative websites). Include credibility scores (1-10) for each.
            4. Detailed analysis of the target audience (likely students/professionals) and what they need to know.
            5. A suggested article outline/structure.
            6. 3 related topics for further learning.

            Output Schema:
            {
                "topic": "${topic}",
                "overview": "string",
                "keyFacts": ["string"],
                "scholarlySources": [
                    { "title": "string", "author": "string", "year": "string", "publication": "string", "url": "string", "credibilityScore": number }
                ],
                "targetAudienceAnalysis": "string",
                "suggestedStructure": ["string"],
                "relatedTopics": ["string"]
            }
        `;

        try {
            const data = await generateGeminiJSON<any>(prompt, this.config.model);

            return {
                ...data,
                topic, // Ensure topic matches input
                generatedAt: new Date()
            };

        } catch (error) {
            console.error('[ResearcherAgent] Error generating brief:', error);
            throw new Error('Failed to generate research brief');
        }
    }

    async identifyTopics(category: ResourceCategory, subcategory: string, count: number = 3): Promise<string[]> {
        const prompt = `
            Identify ${count} emerging, high-impact, or foundational topics for an educational article in the field of "${category}" specific to the subcategory "${subcategory}".
            Return ONLY a JSON array of strings. 
            Example: ["Topic 1", "Topic 2", "Topic 3"]
        `;

        try {
            const data = await generateGeminiJSON<string[]>(prompt, this.config.model);
            return data;
        } catch (error) {
            console.error('[ResearcherAgent] Error identifying topics:', error);
            // Fallback topics if generation fails
            return [`Introduction to ${subcategory}`, `Advanced ${subcategory} Techniques`, `Future of ${subcategory}`];
        }
    }
}
