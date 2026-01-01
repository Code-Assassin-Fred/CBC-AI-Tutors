/**
 * Resource Types
 * 
 * Types for the Resources Hub - AI articles, tools, and curated content
 */

// ============================================
// RESOURCE TYPES
// ============================================

export type ResourceType =
    | 'ai-article'
    | 'external-article'
    | 'video'
    | 'tool'
    | 'book'
    | 'podcast'
    | 'community';

export type ResourceCategory =
    | 'career-specific'
    | 'meta-learning'
    | 'ai-future'
    | 'tools';

export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Resource {
    id: string;
    type: ResourceType;
    title: string;
    description: string;

    // Content
    content?: string;
    externalUrl?: string;
    thumbnail?: string;

    // Categorization
    category: ResourceCategory;
    subcategory: string;
    tags: string[];

    // Relevance
    relatedCareers: string[];
    relatedSkills: string[];

    // Metadata
    difficulty?: ResourceDifficulty;
    duration?: string;
    free: boolean;

    // Engagement
    saves: number;
    helpfulVotes: number;

    // Timestamps
    createdAt: Date;
    updatedAt?: Date;

    // Agent Verification & Metadata
    generatedBy?: 'ai-agent' | 'manual';
    qualityScore?: number; // 0-100
    sources?: any[]; // SourceCitation[]
    verifiedAt?: Date;
    researchBrief?: string;
}

// ============================================
// AI ARTICLE
// ============================================

export interface AIArticle extends Resource {
    type: 'ai-article';
    content: string;
    sections: ArticleSection[];
    readingTime: string;
    generatedAt: Date;
}

export interface ArticleSection {
    id: string;
    title: string;
    content: string;
}

// ============================================
// RESOURCE HUB CATEGORIES
// ============================================

export interface ResourceHubCategory {
    id: ResourceCategory;
    label: string;
    description: string;
    icon: string;
    subcategories: ResourceSubcategory[];
}

export interface ResourceSubcategory {
    id: string;
    label: string;
    description: string;
}

// Default categories for the Resources Hub
export const RESOURCE_HUB_CATEGORIES: ResourceHubCategory[] = [
    {
        id: 'career-specific',
        label: 'For Your Career Path',
        description: 'Resources tailored to your career goals',
        icon: 'target',
        subcategories: [
            { id: 'skill-tutorials', label: 'Skill-specific Tutorials', description: 'Deep dives into required skills' },
            { id: 'industry-insights', label: 'Industry Insights', description: 'Latest trends and news' },
            { id: 'job-prep', label: 'Job Preparation', description: 'Interview prep and resume tips' },
        ]
    },
    {
        id: 'meta-learning',
        label: 'Learn How to Learn',
        description: 'Master the art of learning itself',
        icon: 'brain',
        subcategories: [
            { id: 'active-recall', label: 'Active Recall', description: 'Retrieval practice techniques' },
            { id: 'spaced-repetition', label: 'Spaced Repetition', description: 'Never forget what you learn' },
            { id: 'focus', label: 'Focus & Deep Work', description: 'Concentration techniques' },
            { id: 'memory', label: 'Memory Techniques', description: 'Memory palace and more' },
        ]
    },
    {
        id: 'ai-future',
        label: 'AI & Future of Work',
        description: 'Navigate the AI revolution',
        icon: 'cpu',
        subcategories: [
            { id: 'ai-safe-careers', label: 'AI-Safe Careers', description: 'Jobs resilient to automation' },
            { id: 'working-with-ai', label: 'Working with AI', description: 'Leverage AI as a tool' },
            { id: 'human-skills', label: 'Irreplaceable Skills', description: 'Skills that stay human' },
        ]
    },
    {
        id: 'tools',
        label: 'Recommended Tools',
        description: 'Apps and tools to boost your learning',
        icon: 'wrench',
        subcategories: [
            { id: 'study-tools', label: 'Study Tools', description: 'Notion, Anki, Obsidian' },
            { id: 'productivity', label: 'Productivity Apps', description: 'Focus and organization' },
            { id: 'learning-platforms', label: 'Learning Platforms', description: 'Online courses and more' },
        ]
    }
];

// ============================================
// RESOURCE GENERATION
// ============================================

export interface ArticleGenerationRequest {
    topic: string;
    category: ResourceCategory;
    subcategory?: string;
    difficulty?: ResourceDifficulty;
    relatedCareer?: string;
}

export interface ArticleGenerationProgress {
    step: 'researching' | 'writing' | 'formatting' | 'complete' | 'error';
    message: string;
    percentage: number;
}

// ============================================
// RESOURCE FILTERING
// ============================================

export interface ResourceFilter {
    category?: ResourceCategory;
    subcategory?: string;
    type?: ResourceType;
    difficulty?: ResourceDifficulty;
    relatedCareer?: string;
    free?: boolean;
    searchQuery?: string;
}

export interface ResourceSearchResult {
    resources: Resource[];
    total: number;
    hasMore: boolean;
}
