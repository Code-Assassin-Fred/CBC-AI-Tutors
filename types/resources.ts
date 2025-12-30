export type ResourceType =
    | 'ai-article'        // AI-generated in-depth article
    | 'external-article'  // Curated link to external site
    | 'video'             // YouTube, course video, etc.
    | 'tool'              // App or software recommendation
    | 'book'              // Book recommendation
    | 'podcast'           // Podcast episode/series
    | 'community';        // Discord, Reddit, etc.

export type ResourceCategory =
    | 'career-specific'
    | 'meta-learning'
    | 'ai-future'
    | 'tools';

export interface Resource {
    id: string;
    type: ResourceType;
    title: string;
    description: string;

    // Content
    content?: string;              // For AI articles (markdown)
    externalUrl?: string;          // For external resources
    thumbnail?: string;
    author?: string;               // Or source name

    // Categorization  
    category: ResourceCategory;
    subcategory: string;
    tags: string[];

    // Relevance
    relatedCareers: string[];      // Which career paths this helps
    relatedSkills: string[];       // Which skills this teaches

    // Metadata
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration?: string;             // "5 min read", "2 hour course"
    isFree: boolean;
    createdAt: Date;
    updatedAt?: Date;

    // Engagement
    saves: number;
    helpfulVotes: number;
}

export interface ResourceFilter {
    category?: ResourceCategory;
    type?: ResourceType[];
    search?: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
