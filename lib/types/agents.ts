/**
 * Agent Types for Multi-Step AI Workflows
 * 
 * Types for Planner Agent (6 steps) and Quiz Agent (3 steps)
 */

// ============================================
// SUBSTRAND CONTEXT
// ============================================

export interface SubstrandContext {
    grade: string;
    subject: string;
    strand: string;
    substrand: string;
    textbookContent: string;
    imageMetadata?: ImageContextItem[];
}

export interface ImageContextItem {
    id: string;
    caption: string;
    visualDescription: string;
    conceptExplanation: string;
}

// ============================================
// PLANNER AGENT TYPES (6 API Calls)
// ============================================

export type PlannerStep =
    | 'analyze'
    | 'outline'
    | 'generate-read'
    | 'generate-podcast'
    | 'generate-immersive'
    | 'refine';

export interface PlannerStepStatus {
    step: PlannerStep;
    stepNumber: number;
    status: 'pending' | 'in-progress' | 'complete' | 'error';
    message: string;
    data?: unknown;
}

// Step 1: Analyze Output
export interface ConceptAnalysis {
    keyConcepts: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    prerequisites: string[];
    commonMisconceptions: string[];
    targetAgeRange: string;
    estimatedLearningTime: string;
}

// Step 2: Outline Output
export interface LessonOutlines {
    readOutline: {
        sections: Array<{
            title: string;
            keyPoints: string[];
        }>;
    };
    podcastOutline: {
        segments: Array<{
            topic: string;
            duration: string;
        }>;
    };
    immersiveOutline: {
        chunks: Array<{
            concept: string;
            checkPoints: string[];
        }>;
    };
}

// Step 3a: Read Mode Content
export interface ReadModeContent {
    introduction: string;
    sections: Array<{
        id: string;
        title: string;
        content: string;
        keyPoints: string[];
        examples: Array<{
            title: string;
            description: string;
        }>;
        visualAids?: string[];
    }>;
    summary: string;
    reviewQuestions: string[];
}

// Step 3b: Podcast Script
export interface PodcastScript {
    title: string;
    duration: string;
    introduction: string;
    dialogue: Array<{
        id: string;
        speaker: 'Teacher' | 'Student';
        text: string;
        emotion?: 'curious' | 'excited' | 'thoughtful' | 'encouraging';
    }>;
    conclusion: string;
}

// Step 3c: Immersive Chunks
export interface ImmersiveChunk {
    id: string;
    order: number;
    concept: string;
    aiExplanation: string;
    keyPointsToCheck: string[];
    promptForStudent: string;
    scoringRubric: {
        excellent: string[];
        good: string[];
        needsWork: string[];
    };
    followUpIfStruggling: string;
}

export interface ImmersiveContent {
    introduction: string;
    chunks: ImmersiveChunk[];
    completionMessage: string;
}

// Final Combined Output
export interface PlannerOutput {
    analysis: ConceptAnalysis;
    outlines: LessonOutlines;
    readContent: ReadModeContent;
    podcastScript: PodcastScript;
    immersiveContent: ImmersiveContent;
    generatedAt: string;
}

// ============================================
// QUIZ AGENT TYPES (3 API Calls)
// ============================================

export type QuizStep = 'extract' | 'generate' | 'validate';

export interface QuizStepStatus {
    step: QuizStep;
    stepNumber: number;
    status: 'pending' | 'in-progress' | 'complete' | 'error';
    message: string;
    data?: unknown;
}

// Step 1: Extract Output
export interface ExtractedConcepts {
    concepts: Array<{
        id: string;
        name: string;
        description: string;
        importance: 'high' | 'medium' | 'low';
    }>;
    learningObjectives: string[];
}

// Step 2 & 3: Quiz Questions
export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export interface QuizQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    concept: string;
    hint?: string;
}

export interface QuizOutput {
    substrandId: string;
    title: string;
    description: string;
    totalQuestions: number;
    estimatedTime: string;
    questions: QuizQuestion[];
    passingScore: number;
}

// ============================================
// AUDIO & VOICE TYPES
// ============================================

export interface AudioState {
    isPlaying: boolean;
    isListening: boolean;
    isTranscribing?: boolean;  // True when audio is being sent to Google Cloud STT
    transcript?: string;
    activeTextId?: string; // To highlight specific paragraphs
}

export interface VoiceConfig {
    voiceType: 'standard' | 'wavenet' | 'neural2';
    languageCode: string;
    ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE';
}

// ============================================
// TUTOR PANEL MODES
// ============================================

export type TutorPanelMode = 'idle' | 'loading' | 'learning' | 'quiz';
export type LearningSubMode = 'read' | 'podcast' | 'immersive';

export interface TutorPanelState {
    mode: TutorPanelMode;
    learningSubMode: LearningSubMode | null;
    context: SubstrandContext | null;
    preparedContent: PlannerOutput | null;
    quizContent: QuizOutput | null;
    loadingProgress: LoadingProgress | null;
    audio: AudioState;
}

export interface LoadingProgress {
    type: 'planner' | 'quiz';
    currentStep: number;
    totalSteps: number;
    steps: Array<{
        name: string;
        status: 'pending' | 'in-progress' | 'complete' | 'error';
        message?: string;
    }>;
}

// ============================================
// CHAT TYPES
// ============================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ============================================
// IMMERSIVE MODE ASSESSMENT
// ============================================

export interface StudentExplanation {
    chunkId: string;
    studentText: string;
    audioUrl?: string;
}

export interface AssessmentResult {
    chunkId: string;
    score: number; // 0-100
    level: 'excellent' | 'good' | 'needs-work';
    matchedKeyPoints: string[];
    missedKeyPoints: string[];
    feedback: string;
    shouldRetry: boolean;
}

// ============================================
// STREAMING TYPES
// ============================================

export interface StreamEvent {
    type: 'step-start' | 'step-progress' | 'step-complete' | 'error' | 'done';
    step?: string;
    stepNumber?: number;
    message?: string;
    data?: unknown;
    error?: string;
}
