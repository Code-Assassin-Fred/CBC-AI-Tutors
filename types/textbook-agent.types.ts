/**
 * Multi-Agent Textbook Generation Types
 * 
 * Types for the Antigravity-style multi-agent workflow for custom textbook generation.
 * Each agent handles a specific phase: Research → Outline → Content → Illustration → Assembly
 */

// ============================================
// AGENT TYPES
// ============================================

/** The different agents in the textbook generation workflow */
export type TextbookAgentType =
    | 'research'      // Topic analysis and audience profiling
    | 'outline'       // Structure planning and image slot creation
    | 'content'       // Chapter-by-chapter content generation
    | 'illustration'  // AI image generation for chapters
    | 'assembly';     // Final compilation and storage

/** State of an individual agent */
export type AgentState = 'pending' | 'running' | 'complete' | 'error';

/** Agent metadata for display */
export interface AgentInfo {
    type: TextbookAgentType;
    name: string;
    icon: string;
    description: string;
}

/** Predefined agent information for UI display */
export const TEXTBOOK_AGENTS: Record<TextbookAgentType, AgentInfo> = {
    research: {
        type: 'research',
        name: 'Research Agent',
        icon: '🔍',
        description: 'Analyzing topic and audience'
    },
    outline: {
        type: 'outline',
        name: 'Outline Agent',
        icon: '📋',
        description: 'Creating textbook structure'
    },
    content: {
        type: 'content',
        name: 'Content Agent',
        icon: '✍️',
        description: 'Writing chapters'
    },
    illustration: {
        type: 'illustration',
        name: 'Illustration Agent',
        icon: '🎨',
        description: 'Generating images'
    },
    assembly: {
        type: 'assembly',
        name: 'Assembly Agent',
        icon: '📦',
        description: 'Compiling textbook'
    }
};

// ============================================
// SSE EVENT TYPES
// ============================================

/** Base event structure for all SSE events */
interface BaseAgentEvent {
    timestamp: string;
    percentage?: number;
}

/** Agent lifecycle events */
export interface AgentStartEvent extends BaseAgentEvent {
    type: 'agent_start';
    agent: TextbookAgentType;
    message: string;
}

export interface AgentStepEvent extends BaseAgentEvent {
    type: 'agent_step';
    agent: TextbookAgentType;
    step: string;
    message: string;
}

export interface AgentCompleteEvent extends BaseAgentEvent {
    type: 'agent_complete';
    agent: TextbookAgentType;
    message: string;
    data?: any;
}

export interface AgentErrorEvent extends BaseAgentEvent {
    type: 'agent_error';
    agent: TextbookAgentType;
    message: string;
    error: string;
}

/** Chapter-specific events */
export interface ChapterStartEvent extends BaseAgentEvent {
    type: 'chapter_start';
    agent: 'content';
    chapter: number;
    totalChapters: number;
    title: string;
}

export interface ChapterCompleteEvent extends BaseAgentEvent {
    type: 'chapter_complete';
    agent: 'content';
    chapter: number;
    totalChapters: number;
    charCount: number;
}

/** Image-specific events */
export interface ImageStartEvent extends BaseAgentEvent {
    type: 'image_start';
    agent: 'illustration';
    imageIndex: number;
    totalImages: number;
    description: string;
}

export interface ImageCompleteEvent extends BaseAgentEvent {
    type: 'image_complete';
    agent: 'illustration';
    imageIndex: number;
    totalImages: number;
    imageUrl: string;
}

/** Final completion event */
export interface GenerationDoneEvent extends BaseAgentEvent {
    type: 'done';
    message: string;
    data: any; // The complete textbook object
}

/** Error event */
export interface GenerationErrorEvent extends BaseAgentEvent {
    type: 'error';
    message: string;
    error: string;
}

/** Union of all possible SSE events */
export type TextbookAgentEvent =
    | AgentStartEvent
    | AgentStepEvent
    | AgentCompleteEvent
    | AgentErrorEvent
    | ChapterStartEvent
    | ChapterCompleteEvent
    | ImageStartEvent
    | ImageCompleteEvent
    | GenerationDoneEvent
    | GenerationErrorEvent;

// ============================================
// INTERNAL DATA STRUCTURES
// ============================================

/** Research agent output */
export interface TopicResearch {
    analyzedTopic: string;
    targetAudience: string;
    gradeLevel: string;
    keyConcepts: string[];
    suggestedChapterCount: number;
    estimatedReadingTime: string;
}

/** Chapter structure from outline agent */
export interface ChapterOutline {
    index: number;
    title: string;
    description: string;
    keyPoints: string[];
    imagePrompt: string;
    estimatedWordCount: number;
}

/** Textbook outline from outline agent */
export interface TextbookOutline {
    title: string;
    introduction: string;
    learningObjectives: string[];
    chapters: ChapterOutline[];
    glossaryTerms: string[];
}

/** Generated chapter content */
export interface GeneratedChapter {
    index: number;
    title: string;
    content: string;
    keyPoints: string[];
    exercises: Array<{
        question: string;
        type: 'open-ended' | 'multiple-choice' | 'activity';
    }>;
    imageUrl?: string;
    imagePrompt?: string;
}

/** Generated image metadata */
export interface TextbookImage {
    id: string;
    chapterIndex: number;
    type: 'cover' | 'chapter';
    prompt: string;
    description: string;
    imageUrl: string;
    generatedAt: Date;
}

// ============================================
// FRONTEND STATE
// ============================================

/** State of an agent for UI display */
export interface AgentUIState {
    type: TextbookAgentType;
    state: AgentState;
    message: string;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
}

/** Chapter progress for content agent UI */
export interface ChapterProgress {
    index: number;
    title: string;
    state: 'pending' | 'writing' | 'complete';
    charCount?: number;
}

/** Image progress for illustration agent UI */
export interface ImageProgress {
    index: number;
    description: string;
    state: 'pending' | 'generating' | 'complete';
    imageUrl?: string;
}

/** Overall generation state for UI */
export interface TextbookGenerationState {
    isGenerating: boolean;
    currentAgent: TextbookAgentType | null;
    agents: AgentUIState[];
    chapters: ChapterProgress[];
    images: ImageProgress[];
    overallProgress: number;
    currentMessage: string;
    error: string | null;
}
