import { ResearcherAgent } from './researcherAgent';
import { WriterAgent } from './writerAgent';
import { VerifierAgent } from './verifierAgent';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { ResourceCategory, Resource } from '@/types/resource';
import { DraftArticle } from '@/types/resourceAgents';

export class AgentOrchestrator {
    private researcher: ResearcherAgent;
    private writer: WriterAgent;
    private verifier: VerifierAgent;

    constructor() {
        this.researcher = new ResearcherAgent();
        this.writer = new WriterAgent();
        this.verifier = new VerifierAgent();
    }

    async generateResourcesForCategory(category: ResourceCategory, subcategory: string, count: number = 2): Promise<string[]> {
        console.log(`[Orchestrator] Starting generation for ${category}/${subcategory}`);
        const generatedIds: string[] = [];

        try {
            // 1. Identify Topics
            const topics = await this.researcher.identifyTopics(category, subcategory, count);
            console.log(`[Orchestrator] Identified topics:`, topics);

            // 2. Process each topic sequentially
            for (const topic of topics) {
                try {
                    const resourceId = await this.processTopic(topic, category, subcategory);
                    if (resourceId) {
                        generatedIds.push(resourceId);
                    }
                } catch (err) {
                    console.error(`[Orchestrator] Failed to process topic ${topic}:`, err);
                }
            }

        } catch (error) {
            console.error('[Orchestrator] Generation failed:', error);
        }

        return generatedIds;
    }

    private async processTopic(topic: string, category: ResourceCategory, subcategory: string): Promise<string | null> {
        console.log(`[Orchestrator] Processing topic: ${topic}`);
        let attempts = 0;
        const maxRevies = 2;

        try {
            // Step 1: Research
            const brief = await this.researcher.generateResearchBrief(topic, category, subcategory);

            // Step 2: Write Initial Draft
            let draft = await this.writer.writeArticle(brief);

            // Step 3: Verify & Revise Loop
            while (attempts <= maxRevies) {
                const verification = await this.verifier.verifyArticle(draft, topic);

                if (verification.isApproved) {
                    console.log(`[Orchestrator] Article approved! Score: ${verification.qualityScore}`);
                    // Save to Firestore
                    return await this.saveResource(draft, brief, verification, category, subcategory);
                }

                console.log(`[Orchestrator] Article rejected (Score: ${verification.qualityScore}). Revising...`);
                if (attempts < maxRevies) {
                    draft = await this.writer.reviseArticle(draft, verification.requiredRevisions);
                }
                attempts++;
            }

            console.warn(`[Orchestrator] Failed to reach quality threshold for ${topic} after ${attempts} attempts.`);
            return null;

        } catch (error) {
            console.error(`[Orchestrator] Error in pipeline for ${topic}:`, error);
            return null;
        }
    }

    private async saveResource(
        draft: DraftArticle,
        brief: any,
        verification: any,
        category: ResourceCategory,
        subcategory: string
    ): Promise<string> {
        const resourceRef = adminDb.collection('resources').doc();

        const resource: Resource = {
            id: resourceRef.id,
            type: 'ai-article',
            title: draft.title,
            description: draft.description,
            content: draft.content,
            category,
            subcategory,
            tags: draft.tags,
            difficulty: draft.difficulty,
            duration: draft.estimatedReadingTime,
            free: true,
            saves: 0,
            helpfulVotes: 0,
            relatedCareers: [], // Could be inferred by AI later
            relatedSkills: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            generatedBy: 'ai-agent',
            qualityScore: verification.qualityScore,
            sources: brief.scholarlySources,
            verifiedAt: verification.verifiedAt,
            researchBrief: JSON.stringify(brief) // Store for audit/transparency
        };

        await resourceRef.set(resource);
        return resourceRef.id;
    }
}
