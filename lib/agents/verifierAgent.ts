import { GoogleGenerativeAI } from '@google/generative-ai';
import { DraftArticle, VerificationResult, AgentConfig } from '@/types/resourceAgents';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class VerifierAgent {
    private model: any;
    private config: AgentConfig;

    constructor(config?: Partial<AgentConfig>) {
        this.config = {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.1, // Very low temperature for strict evaluation
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

    async verifyArticle(article: DraftArticle, topic: string): Promise<VerificationResult> {
        console.log(`[VerifierAgent] Verifying article: ${article.title}`);

        const prompt = `
            You are a strict academic peer reviewer. Evaluate this article for accuracy, quality, and scholarly standards.

            Topic: ${topic}
            Article Title: ${article.title}
            Content: ${article.content}

            Criteria:
            1. Accuracy (0-25): Are facts correct? Are claims supported?
            2. Clarity (0-25): Is the writing clear, professional, and free of errors?
            3. Completeness (0-25): Does it fully cover the topic?
            4. Academic Standards (0-25): Are citations used? Is the tone objective?

            Total Score = Sum of criteria.
            Approval Threshold: Score >= 80.

            Provide specific feedback for each criterion and a list of REQUIRED revisions if rejected.

            Output Schema:
            {
                "isApproved": boolean,
                "qualityScore": number,
                "scores": {
                    "accuracy": number,
                    "clarity": number,
                    "completeness": number,
                    "academicStandards": number,
                    "citations": number
                },
                "feedback": ["string"],
                "requiredRevisions": ["string"]
            }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const data = JSON.parse(text);

            return {
                ...data,
                verifiedAt: new Date()
            };

        } catch (error) {
            console.error('[VerifierAgent] Error verifying article:', error);
            // Fail safe: reject if verification fails
            return {
                isApproved: false,
                qualityScore: 0,
                scores: { accuracy: 0, clarity: 0, completeness: 0, academicStandards: 0, citations: 0 },
                feedback: ['Verification process failed due to system error.'],
                requiredRevisions: ['Retry verification.'],
                verifiedAt: new Date()
            };
        }
    }
}
