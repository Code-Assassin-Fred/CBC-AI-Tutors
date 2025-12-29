/**
 * Course Types for Learn Anything Feature
 * 
 * Types for on-demand course generation, lessons, and progress tracking
 */

import { ReadModeContent, PodcastScript, ImmersiveContent, QuizQuestion } from '@/lib/types/agents';

// ============================================
// COURSE CORE TYPES
// ============================================

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LearningMode = 'explanation' | 'podcast' | 'immersive' | 'quiz';

export interface Course {
    id: string;
    title: string;
    description: string;
    topic: string;
    thumbnailUrl?: string;
    creatorId: string;
    creatorName?: string;
    isPublic: boolean;
    tags: string[];
    difficulty: CourseDifficulty;
    estimatedTime: string;
    lessonCount: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface CourseLesson {
    id: string;
    courseId: string;
    order: number;
    title: string;
    description: string;
    estimatedTime: string;
    readContent: ReadModeContent;
    podcastScript: PodcastScript;
    immersiveContent: ImmersiveContent;
}

export interface CourseQuiz {
    id: string;
    courseId: string;
    lessonId?: string; // null for final exam
    type: 'lesson' | 'final';
    title: string;
    description: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number; // in minutes
}

// ============================================
// PROGRESS TRACKING
// ============================================

export interface CourseProgress {
    userId: string;
    courseId: string;
    startedAt: Date;
    lastAccessedAt: Date;
    completedLessons: string[]; // lesson IDs
    lessonProgress: Record<string, LessonProgress>;
    quizScores: Record<string, QuizScore>; // quizId -> score
    isCompleted: boolean;
    completedAt?: Date;
    overallProgress: number; // 0-100
}

export interface LessonProgress {
    lessonId: string;
    startedAt?: Date;
    completedAt?: Date;
    modesCompleted: LearningMode[];
    lastMode?: LearningMode;
    timeSpent: number; // in seconds
}

export interface QuizScore {
    quizId: string;
    score: number; // 0-100
    attempts: number;
    bestScore: number;
    lastAttemptAt: Date;
    passed: boolean;
}

// ============================================
// COURSE GENERATION TYPES
// ============================================

export interface CourseGenerationRequest {
    topic: string;
    userId: string;
    preferences?: CoursePreferences;
}

export interface CoursePreferences {
    difficulty?: CourseDifficulty;
    lessonCount?: number; // 3-10
    includeQuizzes?: boolean;
    includeFinalExam?: boolean;
    focusAreas?: string[];
}

export interface CourseOutline {
    title: string;
    description: string;
    difficulty: CourseDifficulty;
    estimatedTime: string;
    tags: string[];
    lessons: LessonOutline[];
}

export interface LessonOutline {
    order: number;
    title: string;
    description: string;
    topics: string[];
    learningObjectives: string[];
    estimatedTime: string;
}

// ============================================
// GENERATION PROGRESS (STREAMING)
// ============================================

export type GenerationStep =
    | 'planning'
    | 'outlining'
    | 'generating-lesson'
    | 'generating-quiz'
    | 'finalizing'
    | 'complete'
    | 'error';

export interface GenerationProgress {
    step: GenerationStep;
    currentLesson?: number;
    totalLessons?: number;
    message: string;
    percentage: number;
    data?: Partial<Course>;
}

export interface GenerationEvent {
    type: 'progress' | 'lesson-complete' | 'quiz-complete' | 'done' | 'error';
    step?: GenerationStep;
    lessonNumber?: number;
    message?: string;
    percentage?: number;
    data?: unknown;
    error?: string;
}

// ============================================
// DISCOVERY & SUGGESTIONS
// ============================================

export interface TopicSuggestion {
    id: string;
    topic: string;
    displayName: string;
    category: string;
    icon?: string;
    trending?: boolean;
    sampleCourseId?: string;
}

export interface CourseSearchQuery {
    query?: string;
    tags?: string[];
    difficulty?: CourseDifficulty;
    creatorId?: string;
    limit?: number;
    offset?: number;
}

export interface CourseSearchResult {
    courses: Course[];
    total: number;
    hasMore: boolean;
}

// ============================================
// FULL COURSE WITH LESSONS (for viewing)
// ============================================

export interface FullCourse extends Course {
    lessons: CourseLesson[];
    quizzes: CourseQuiz[];
    progress?: CourseProgress; // if user is enrolled
}
