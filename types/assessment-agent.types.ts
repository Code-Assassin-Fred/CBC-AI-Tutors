/**
 * Multi-Agent Assessment Generation Types
 * 
 * Types for the state-of-the-art multi-agent workflow for assessment generation.
 * Each agent handles a specific phase: Analyzer → Librarian → Architect → Creator → Critic → Editor → Scorer
 */

import { Assessment, Question, QuestionType, DifficultyLevel } from './assessment';

// ============================================
// AGENT TYPES
// ============================================

/** The different agents in the assessment generation workflow */
export type AssessmentAgentType =
    | 'analyzer'    // Document processing and text extraction
    | 'librarian'   // Knowledge extraction and fact finding
    | 'architect'   // Assessment blueprinting and mapping
    | 'creator'     // Question generation
    | 'critic'      // Quality auditing and review
    | 'editor'      // Refinement and fixing issues
    | 'scorer';     // Rubric generation

/** State of an individual agent */
export type AgentState = 'pending' | 'running' | 'complete' | 'error';

/** Agent metadata for display */
export interface AgentInfo {
    type: AssessmentAgentType;
    name: string;
    icon: string;
    description: string;
}

/** Predefined agent information for UI display */
export const ASSESSMENT_AGENTS: Record<AssessmentAgentType, AgentInfo> = {
    analyzer: {
        type: 'analyzer',
        name: 'Analyzer Agent',
        icon: '📂',
        description: 'Processing uploaded materials'
    },
    librarian: {
        type: 'librarian',
        name: 'Librarian Agent',
        icon: '📚',
        description: 'Extracting key concepts and facts'
    },
    architect: {
        type: 'architect',
        name: 'Architect Agent',
        icon: '📐',
        description: 'Designing assessment blueprint'
    },
    creator: {
        type: 'creator',
        name: 'Creator Agent',
        icon: '✍️',
        description: 'Crafting questions'
    },
    critic: {
        type: 'critic',
        name: 'Critic Agent',
        icon: '🕵️',
        description: 'Auditing quality and accuracy'
    },
    editor: {
        type: 'editor',
        name: 'Editor Agent',
        icon: '🖋️',
        description: 'Refining and fixing questions'
    },
    scorer: {
        type: 'scorer',
        name: 'Scorer Agent',
        icon: '📊',
        description: 'Generating detailed rubrics'
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
    agent: AssessmentAgentType;
    message: string;
}

export interface AgentStepEvent extends BaseAgentEvent {
    type: 'agent_step';
    agent: AssessmentAgentType;
    step: string;
    message: string;
}

export interface AgentCompleteEvent extends BaseAgentEvent {
    type: 'agent_complete';
    agent: AssessmentAgentType;
    message: string;
    data?: any;
}

export interface AgentErrorEvent extends BaseAgentEvent {
    type: 'agent_error';
    agent: AssessmentAgentType;
    message: string;
    error: string;
}

/** Specific event for audit cycles */
export interface AuditCycleEvent extends BaseAgentEvent {
    type: 'audit_cycle';
    cycle: number;
    issuesFound: number;
    message: string;
}

/** Final completion event */
export interface AssessmentDoneEvent extends BaseAgentEvent {
    type: 'done';
    message: string;
    data: Assessment;
}

/** Error event */
export interface AssessmentErrorEvent extends BaseAgentEvent {
    type: 'error';
    message: string;
    error: string;
}

/** Union of all possible SSE events */
export type AssessmentAgentEvent =
    | AgentStartEvent
    | AgentStepEvent
    | AgentCompleteEvent
    | AgentErrorEvent
    | AuditCycleEvent
    | AssessmentDoneEvent
    | AssessmentErrorEvent;

// ============================================
// INTERNAL DATA STRUCTURES
// ============================================

/** Analyzer output */
export interface ProcessedMaterials {
    fullText: string;
    extractedImages?: Array<{ url: string; caption: string }>;
    materialNames: string[];
}

/** Librarian output */
export interface ExtractedKnowledge {
    concepts: Array<{
        name: string;
        description: string;
        importance: 'high' | 'medium' | 'low';
    }>;
    facts: string[];
    learningObjectives: string[];
}

/** Architect output */
export interface AssessmentBlueprint {
    title: string;
    difficultyDistribution: Record<DifficultyLevel, number>;
    typeDistribution: Record<QuestionType, number>;
    topicFocus: string[];
    targetGrade: string;
}

/** Critic output */
export interface AssessmentCritique {
    isValid: boolean;
    issues: Array<{
        questionIndex: number;
        issueType: 'accuracy' | 'clarity' | 'distractor' | 'formatting';
        description: string;
        suggestion: string;
    }>;
    qualityScore: number;
}

// ============================================
// FRONTEND STATE
// ============================================

export interface AssessmentGenerationState {
    isGenerating: boolean;
    currentAgent: AssessmentAgentType | null;
    agents: Record<AssessmentAgentType, {
        state: AgentState;
        message: string;
        percentage: number;
    }>;
    overallProgress: number;
    error: string | null;
    result: Assessment | null;
}
