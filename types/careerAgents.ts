/**
 * Career Agent Types
 * 
 * Types for the multi-agent career path generation system
 */

import { CourseDifficulty } from './course';
import { SkillImportance, DemandLevel, DemandTrend, AutomationRisk, EntryDifficulty } from './career';

// ============================================
// AGENT CONFIGURATION
// ============================================

export interface CareerAgentConfig {
    model: string;
    temperature: number;
    maxRetries?: number;
}

// ============================================
// RESEARCH PHASE TYPES
// ============================================

export interface CareerResearchBrief {
    careerTitle: string;
    overview: string;

    // Market Intelligence
    marketData: {
        demand: DemandLevel;
        demandTrend: DemandTrend;
        salaryRange: { min: number; max: number; median: number };
        topIndustries: string[];
        topLocations: string[];
        growthOutlook: string;
    };

    // Entry Requirements
    entryRequirements: {
        difficulty: EntryDifficulty;
        typicalBackgrounds: string[];
        timeToEntry: string;
        certifications: { name: string; provider: string; importance: SkillImportance }[];
    };

    // AI Impact
    aiImpact: {
        automationRisk: AutomationRisk;
        riskExplanation: string;
        futureProofSkills: string[];
        aiAugmentation: string;
    };

    // Skills Breakdown
    skillDomains: SkillDomainBrief[];

    // Related
    relatedCareers: string[];

    generatedAt: Date;
}

export interface SkillDomainBrief {
    name: string;
    category: 'foundation' | 'core' | 'advanced' | 'soft-skill';
    importance: SkillImportance;
    dependencies: string[];
    estimatedTimeToLearn: string;
    keyTopics: string[];
}

// ============================================
// PLANNING PHASE TYPES
// ============================================

export interface DetailedLearningPlan {
    careerTitle: string;
    totalDuration: string;
    phases: LearningPhasePlan[];
    estimatedCompletion: Date;
}

export interface LearningPhasePlan {
    order: number;
    title: string;
    description: string;
    estimatedDuration: string;
    targetSkills: {
        skillId: string;
        skillName: string;
        targetProficiency: number;
    }[];
    courseTopics: string[]; // Topics to generate courses for
    milestones: {
        id: string;
        title: string;
        type: 'course' | 'project' | 'assessment' | 'certification';
        requirement: string;
    }[];
}

// ============================================
// COURSE GENERATION TYPES
// ============================================

export interface CareerCourse {
    id: string;
    careerPathId: string;
    skillId: string;
    skillName: string;
    phaseOrder: number;

    title: string;
    description: string;
    difficulty: CourseDifficulty;
    estimatedTime: string;
    thumbnailUrl?: string;

    lessonCount: number;
    lessonIds: string[];

    order: number; // Order within the phase

    createdAt: Date;
}

export interface CareerCourseGenerationRequest {
    careerTitle: string;
    skillName: string;
    skillTopics: string[];
    difficulty: CourseDifficulty;
    targetAudience: string;
}

// ============================================
// ASSESSMENT TYPES
// ============================================

export interface SkillAssessmentBank {
    skillId: string;
    skillName: string;
    careerPathId: string;
    questions: AssessmentQuestion[];
    questionCount: number;
    createdAt: Date;
}

export interface AssessmentQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation: string;
    topic: string;
}

export interface AssessmentResult {
    skillId: string;
    skillName: string;
    totalQuestions: number;
    correctAnswers: number;
    score: number; // 0-100
    byDifficulty: {
        easy: { total: number; correct: number };
        medium: { total: number; correct: number };
        hard: { total: number; correct: number };
    };
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
    feedback: string;
    completedAt: Date;
}

// ============================================
// ORCHESTRATION TYPES
// ============================================

export type CareerGenerationPhase =
    | 'initializing'
    | 'researching'
    | 'planning'
    | 'generating-courses'
    | 'generating-assessments'
    | 'verifying'
    | 'saving'
    | 'complete'
    | 'error';

export interface CareerGenerationJob {
    id: string;
    userId: string;
    careerTitle: string;
    status: CareerGenerationPhase;
    currentStep: string;
    progress: number; // 0-100

    // Results
    careerPathId?: string;
    coursesGenerated: number;
    assessmentsGenerated: number;

    // Tracking
    startedAt: Date;
    completedAt?: Date;
    errors: string[];
}

export interface CareerGenerationEvent {
    type: 'progress' | 'phase-complete' | 'course-generated' | 'complete' | 'error';
    phase?: CareerGenerationPhase;
    message?: string;
    progress?: number;
    data?: unknown;
    error?: string;
}

// ============================================
// VERIFICATION TYPES
// ============================================

export interface CareerVerificationResult {
    isApproved: boolean;
    qualityScore: number; // 0-100
    scores: {
        accuracy: number;
        completeness: number;
        relevance: number;
        clarity: number;
    };
    feedback: string[];
    requiredRevisions: string[];
    verifiedAt: Date;
}

// ============================================
// PERSISTENCE TYPES
// ============================================

export interface UserCareerData {
    id: string;
    odI: string;

    // Saved career paths
    savedCareerIds: string[];
    activeCareerPathId?: string;

    // Skill states across all careers
    skillStates: Record<string, {
        proficiency: number;
        lastAssessedAt: Date;
        sources: { type: string; value: number; timestamp: Date }[];
    }>;

    // Learning progress
    activeLearningPlanId?: string;
    completedCourseIds: string[];

    createdAt: Date;
    updatedAt: Date;
}
