/**
 * Custom Lesson Types for Teacher-Generated Lessons
 * 
 * These lessons are NOT affiliated with the CBC curriculum.
 * Teachers can create custom lessons for any topic and audience.
 */

// ============================================
// CORE TYPES
// ============================================

export interface CustomLessonSection {
    title: string;
    content: string;
    keyPoints?: string[];
}

export interface CustomLessonContent {
    introduction: string;
    sections: CustomLessonSection[];
    examples: Array<{
        title: string;
        description: string;
        explanation?: string;
    }>;
    summary: string;
    activities?: Array<{
        title: string;
        description: string;
        duration?: string;
    }>;
}

export interface CustomLesson {
    id: string;
    teacherId: string;
    title: string;
    topic: string;
    audienceAge: string;
    specifications?: string;
    lessonTime?: string;
    content: CustomLessonContent;
    estimatedDuration?: string;
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// GENERATION TYPES
// ============================================

export interface CustomLessonRequest {
    topic: string;
    audienceAge: string;
    specifications?: string;
    lessonTime?: string;
    teacherId: string;
}

export type CustomLessonGenerationStep =
    | 'analyzing'
    | 'structuring'
    | 'generating-content'
    | 'adding-examples'
    | 'finalizing'
    | 'complete'
    | 'error';

export interface CustomLessonGenerationProgress {
    step: CustomLessonGenerationStep;
    message: string;
    percentage: number;
}

export interface CustomLessonGenerationEvent {
    type: 'progress' | 'done' | 'error';
    step?: CustomLessonGenerationStep;
    message?: string;
    percentage?: number;
    data?: Partial<CustomLesson>;
    error?: string;
}
