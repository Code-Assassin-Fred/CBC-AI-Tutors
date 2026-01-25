import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
import { ResearchBrief, DraftArticle, AgentConfig, ArticleSection } from '@/types/resourceAgents';
import { ResourceDifficulty } from '@/types/resource';

export class WriterAgent {
    private model: any;
    private config: AgentConfig;

    constructor(config?: Partial<AgentConfig>) {
        this.config = {
            model: MODELS.flash,
            temperature: 0.4, // Slightly higher for creativity in writing
            ...config
        };
    }

    async writeArticle(brief: ResearchBrief): Promise<DraftArticle> {
        console.log(`[WriterAgent] Writing article for: ${brief.topic}`);

        const prompt = `
            You are an expert academic writer. Use the provided Research Brief to write a high-quality, scholarly educational article.
            
            Research Brief:
            ${JSON.stringify(brief)}

            Requirements:
            1. Use a professional, engaging, and educational tone.
            2. Structure the content logically using the suggested structure from the brief.
            3. Include an Introduction and Conclusion.
            4. Seamlessly integrate citations from the provided sources (e.g., "According to Author (Year)...").
            5. Use Markdown for formatting (headers, bold, lists).
            6. Determine the appropriate difficulty level and estimated reading time.
            7. Create a compelling title and description.

            Output Schema:
            {
                "title": "string",
                "description": "string",
                "content": "string (full markdown content)",
                "difficulty": "beginner" | "intermediate" | "advanced",
                "estimatedReadingTime": "string (e.g., '8 min read')",
                "tags": ["string"],
                "sections": [
                    { "id": "string", "title": "string", "content": "string" }
                ]
            }
        `;

        try {
            const data = await generateGeminiJSON<any>(prompt, this.config.model);

            return {
                ...data,
                generatedAt: new Date()
            };

        } catch (error) {
            console.error('[WriterAgent] Error writing article:', error);
            throw new Error('Failed to write article');
        }
    }

    async reviseArticle(currentDraft: DraftArticle, feedback: string[]): Promise<DraftArticle> {
        console.log(`[WriterAgent] Revising article: ${currentDraft.title}`);

        const prompt = `
            You are an expert academic editor. Revise the following article based on the provided feedback.
            
            Current Draft:
            ${JSON.stringify(currentDraft)}

            Feedback to address:
            ${JSON.stringify(feedback)}

            Return the fully updated article object in the same JSON schema as before. Ensure ALL feedback points are addressed to improve quality.
        `;

        try {
            const data = await generateGeminiJSON<any>(prompt, this.config.model);

            return {
                ...data,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('[WriterAgent] Error revising article:', error);
            throw new Error('Failed to revise article');
        }
    }
}
