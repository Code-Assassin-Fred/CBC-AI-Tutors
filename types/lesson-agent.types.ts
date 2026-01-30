/**
 * Multi-Agent Lesson Generation Types
 * 
 * Types for the multi-agent workflow for custom lesson generation.
 * Each agent handles a specific phase: Analyst → Planner → Instructional → Creative → Assembly
 */

// ============================================
// AGENT TYPES
// ============================================

/** The different agents in the lesson generation workflow */
export type LessonAgentType =
    | 'analyst'       // Topic analysis and audience profiling
    | 'planner'       // Lesson structure and timing allocation
    | 'instructional' // Core content generation
    | 'creative'      // Activities and examples creation
    | 'assembly';     // Final compilation and storage

/** State of an individual agent */
export type AgentState = 'pending' | 'running' | 'complete' | 'error';

/** Agent metadata for display */
export interface LessonAgentInfo {
    type: LessonAgentType;
    name: string;
    icon: string;
    description: string;
}

/** Predefined agent information for UI display */
export const LESSON_AGENTS: Record<LessonAgentType, LessonAgentInfo> = {
    analyst: {
        type: 'analyst',
        name: 'Analyst Agent',
        icon: '🔍',
        description: 'Analyzing topic and audience needs'
    },
    planner: {
        type: 'planner',
        name: 'Planner Agent',
        icon: '📋',
        description: 'Structuring the lesson timeline'
    },
    instructional: {
        type: 'instructional',
        name: 'Instructional Agent',
        icon: '✍️',
        description: 'Writing educational content'
    },
    creative: {
        type: 'creative',
        name: 'Creative Agent',
        icon: '🎨',
        description: 'Designing activities and examples'
    },
    assembly: {
        type: 'assembly',
        name: 'Assembly Agent',
        icon: '📦',
        description: 'Finalizing the lesson'
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
    agent: LessonAgentType;
    message: string;
}

export interface AgentStepEvent extends BaseAgentEvent {
    type: 'agent_step';
    agent: LessonAgentType;
    step: string;
    message: string;
}

export interface AgentCompleteEvent extends BaseAgentEvent {
    type: 'agent_complete';
    agent: LessonAgentType;
    message: string;
    data?: any;
}

export interface AgentErrorEvent extends BaseAgentEvent {
    type: 'agent_error';
    agent: LessonAgentType;
    message: string;
    error: string;
}

/** Content-specific events */
export interface SectionStartEvent extends BaseAgentEvent {
    type: 'section_start';
    agent: 'instructional';
    sectionIndex: number;
    totalSections: number;
    title: string;
}

export interface SectionCompleteEvent extends BaseAgentEvent {
    type: 'section_complete';
    agent: 'instructional';
    sectionIndex: number;
    totalSections: number;
    charCount: number;
}

/** Activity-specific events */
export interface ActivityStartEvent extends BaseAgentEvent {
    type: 'activity_start';
    agent: 'creative';
    activityIndex: number;
    totalActivities: number;
    title: string;
}

export interface ActivityCompleteEvent extends BaseAgentEvent {
    type: 'activity_complete';
    agent: 'creative';
    activityIndex: number;
    totalActivities: number;
}

/** Final completion event */
export interface GenerationDoneEvent extends BaseAgentEvent {
    type: 'done';
    message: string;
    data: any; // The complete lesson object
}

/** Error event */
export interface GenerationErrorEvent extends BaseAgentEvent {
    type: 'error';
    message: string;
    error: string;
}

/** Union of all possible SSE events */
export type LessonAgentEvent =
    | AgentStartEvent
    | AgentStepEvent
    | AgentCompleteEvent
    | AgentErrorEvent
    | SectionStartEvent
    | SectionCompleteEvent
    | ActivityStartEvent
    | ActivityCompleteEvent
    | GenerationDoneEvent
    | GenerationErrorEvent;

// ============================================
// INTERNAL DATA STRUCTURES
// ============================================

/** Analyst agent output */
export interface LessonResearch {
    analyzedTopic: string;
    targetAudience: string;
    learningOutcomes: string[];
    difficultyLevel: string;
    estimatedTotalTime: string;
}

/** Section structure from planner agent */
export interface SectionOutline {
    index: number;
    title: string;
    description: string;
    keyPoints: string[];
    timeAllocation: string;
}

/** Lesson outline from planner agent */
export interface LessonOutline {
    title: string;
    introduction: string;
    sections: SectionOutline[];
    activityCount: number;
    exampleCount: number;
}

// ============================================
// FRONTEND STATE
// ============================================

/** State of an agent for UI display */
export interface AgentUIState {
    type: LessonAgentType;
    state: AgentState;
    message: string;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
}

/** Section progress for instructional agent UI */
export interface SectionProgress {
    index: number;
    title: string;
    state: 'pending' | 'writing' | 'complete';
    charCount?: number;
}

/** Activity progress for creative agent UI */
export interface ActivityProgress {
    index: number;
    title: string;
    state: 'pending' | 'designing' | 'complete';
}

/** Overall generation state for UI */
export interface LessonGenerationState {
    isGenerating: boolean;
    currentAgent: LessonAgentType | null;
    agents: AgentUIState[];
    sections: SectionProgress[];
    activities: ActivityProgress[];
    overallProgress: number;
    currentMessage: string;
    error: string | null;
}
