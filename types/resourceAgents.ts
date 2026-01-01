import { ResourceCategory, ResourceDifficulty, ResourceType } from './resource';

// ============================================
// AGENT OUTPUT STRUCTURES
// ============================================

export interface ResearchBrief {
    topic: string;
    overview: string;
    keyFacts: string[];
    scholarlySources: SourceCitation[];
    targetAudienceAnalysis: string;
    suggestedStructure: string[];
    relatedTopics: string[];
    generatedAt: Date;
}

export interface SourceCitation {
    title: string;
    author?: string;
    year?: string;
    publication?: string;
    url?: string;
    credibilityScore: number; // 1-10
}

export interface DraftArticle {
    title: string;
    description: string;
    content: string; // Markdown format
    difficulty: ResourceDifficulty;
    estimatedReadingTime: string;
    tags: string[];
    sections: ArticleSection[];
    generatedAt: Date;
}

export interface ArticleSection {
    id: string;
    title: string;
    content: string;
}

export interface VerificationResult {
    isApproved: boolean;
    qualityScore: number; // 0-100
    scores: {
        accuracy: number; // 0-25
        clarity: number; // 0-25
        completeness: number; // 0-25
        academicStandards: number; // 0-25
        citations: number; // 0-25 (extra credit or penalty if missing)
    };
    feedback: string[];
    requiredRevisions: string[];
    verifiedAt: Date;
}

// ============================================
// SYSTEM CONFIGURATION
// ============================================

export interface AgentConfig {
    model: string; // e.g., 'gemini-2.0-flash-exp'
    temperature: number;
    maxTokens?: number;
}

export interface GenerationJob {
    id: string;
    category: ResourceCategory;
    subcategory: string;
    status: 'pending' | 'researching' | 'writing' | 'verifying' | 'completed' | 'failed';
    currentTopic?: string;
    resourcesGenerated: number;
    errors: string[];
    startedAt: Date;
    completedAt?: Date;
    revisionCount: number;
}

export interface GenerationMetrics {
    totalGenerated: number;
    averageQualityScore: number;
    successRate: number;
    byCategory: Record<string, number>;
}
