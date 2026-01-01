import { GoogleGenerativeAI } from '@google/generative-ai';
import { ResearchBrief, DraftArticle, AgentConfig, ArticleSection } from '@/types/resourceAgents';
import { ResourceDifficulty } from '@/types/resource';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class WriterAgent {
    private model: any;
    private config: AgentConfig;

    constructor(config?: Partial<AgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.4, // Slightly higher for creativity in writing
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
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const data = JSON.parse(text);

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
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const data = JSON.parse(text);

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
