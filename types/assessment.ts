/**
 * Assessment Types for Teacher-Generated Assessments
 * 
 * Teachers can upload materials (PDFs, PPTs, DOCs, etc.) and
 * generate AI-powered assessments with configurable specifications.
 */

// ============================================
// UPLOADED MATERIALS
// ============================================

export interface UploadedMaterial {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'doc' | 'ppt' | 'txt' | 'other';
    mimeType: string;
    size: number;
    uploadedAt: Date;
}

// ============================================
// ASSESSMENT CONFIGURATION
// ============================================

export type QuestionType =
    | 'multiple-choice'
    | 'open-ended'
    | 'true-false'
    | 'short-answer'
    | 'fill-blank';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export interface QuestionTypeConfig {
    type: QuestionType;
    count: number;
    enabled: boolean;
}

export interface AssessmentConfig {
    title: string;
    questionTypes: QuestionTypeConfig[];
    difficulty: DifficultyLevel;
    totalQuestions: number;
    specifications?: string;
    timeLimitMinutes?: number;
    topicFocus?: string;
}

// ============================================
// QUESTIONS & ANSWERS
// ============================================

export interface MultipleChoiceOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    options?: MultipleChoiceOption[];      // For multiple-choice
    correctAnswer?: string;                 // For fill-blank, short-answer
    sampleAnswer?: string;                  // For open-ended
    explanation?: string;                   // Explanation of the answer
    rubric?: string;                        // Grading rubric for this question
    points: number;
    difficulty: DifficultyLevel;
}

// ============================================
// ASSESSMENT
// ============================================

export interface Assessment {
    id: string;
    teacherId: string;
    title: string;
    description?: string;
    questions: Question[];
    materials: UploadedMaterial[];
    config: AssessmentConfig;
    rubric?: string;                        // General assessment rubric
    totalPoints: number;
    estimatedTimeMinutes: number;
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// GENERATION TYPES
// ============================================

export interface AssessmentGenerationRequest {
    teacherId: string;
    materialUrls: string[];
    materialNames: string[];
    config: AssessmentConfig;
}

export type AssessmentGenerationStep =
    | 'uploading'
    | 'analyzing'
    | 'extracting'
    | 'generating-questions'
    | 'validating'
    | 'finalizing'
    | 'complete'
    | 'error';

export interface AssessmentGenerationProgress {
    step: AssessmentGenerationStep;
    message: string;
    percentage: number;
}

export interface AssessmentGenerationEvent {
    type: 'progress' | 'done' | 'error';
    step?: AssessmentGenerationStep;
    message?: string;
    percentage?: number;
    data?: Partial<Assessment>;
    error?: string;
}

// ============================================
// DEFAULT CONFIGURATION
// ============================================

export const DEFAULT_QUESTION_TYPES: QuestionTypeConfig[] = [
    { type: 'multiple-choice', count: 5, enabled: true },
    { type: 'true-false', count: 3, enabled: true },
    { type: 'short-answer', count: 2, enabled: true },
    { type: 'open-ended', count: 2, enabled: false },
    { type: 'fill-blank', count: 3, enabled: false },
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
    'open-ended': 'Open Ended',
    'fill-blank': 'Fill in the Blank',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    mixed: 'Mixed Difficulty',
};
