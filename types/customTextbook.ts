/**
 * Custom Textbook Types for Teacher-Generated Textbooks
 * 
 * These textbooks are NOT affiliated with the CBC curriculum.
 * Teachers can create custom textbooks for any topic and audience.
 */

// ============================================
// CORE TYPES
// ============================================

export interface CustomTextbookChapter {
    title: string;
    content: string;
    keyPoints?: string[];
    exercises?: Array<{
        question: string;
        type: 'open-ended' | 'multiple-choice' | 'activity';
    }>;
}

export interface CustomTextbookContent {
    introduction: string;
    learningObjectives: string[];
    chapters: CustomTextbookChapter[];
    practiceQuestions: Array<{
        question: string;
        answer?: string;
    }>;
    summary: string;
    glossary?: Array<{
        term: string;
        definition: string;
    }>;
}

export interface CustomTextbook {
    id: string;
    teacherId: string;
    title: string;
    topic: string;
    audienceAge: string;
    specifications?: string;
    content: CustomTextbookContent;
    estimatedReadingTime?: string;
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// GENERATION TYPES
// ============================================

export interface CustomTextbookRequest {
    topic: string;
    audienceAge: string;
    specifications?: string;
    teacherId: string;
}

export type CustomTextbookGenerationStep =
    | 'analyzing'
    | 'outlining'
    | 'generating-chapters'
    | 'adding-exercises'
    | 'finalizing'
    | 'complete'
    | 'error';

export interface CustomTextbookGenerationProgress {
    step: CustomTextbookGenerationStep;
    message: string;
    percentage: number;
}

export interface CustomTextbookGenerationEvent {
    type: 'progress' | 'done' | 'error';
    step?: CustomTextbookGenerationStep;
    message?: string;
    percentage?: number;
    data?: Partial<CustomTextbook>;
    error?: string;
}
