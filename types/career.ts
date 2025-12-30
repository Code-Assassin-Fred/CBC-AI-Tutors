import { UserRole } from './userprofile';

// ============================================
// CAREER PATH DEFINITIONS
// ============================================

export interface CareerPath {
    id: string;
    title: string;                    // "Machine Learning Engineer"
    description: string;
    generatedAt: Date;
    source: 'ai-generated' | 'curated' | 'user-created';

    // === SKILL GRAPH ===
    skillCategories: SkillCategory[];
    totalSkillCount: number;

    // === MARKET INTELLIGENCE (AI-researched) ===
    market: {
        demand: 'low' | 'medium' | 'high' | 'very-high';
        demandTrend: 'declining' | 'stable' | 'growing' | 'booming';
        salaryRange: { min: number; max: number; median: number; currency: string };
        topHiringIndustries: string[];
        topLocations: string[];
        growthOutlook: string;
    };

    // === ENTRY REQUIREMENTS ===
    entry: {
        difficulty: 'beginner-friendly' | 'moderate' | 'challenging' | 'expert';
        typicalBackground: string[];     // "CS degree", "Self-taught", etc.
        timeToEntry: string;             // "6-12 months focused study"
        certifications: string[];        // Recommended certifications
    };

    // === AI IMPACT ===
    aiImpact: {
        automationRisk: 'very-low' | 'low' | 'medium' | 'high';
        riskExplanation: string;
        futureProofSkills: string[];     // Skills that remain valuable
        aiAugmentation: string;          // How AI helps, not replaces
    };

    // === LEARNING RESOURCES ===
    resources: {
        platformCourses: string[];       // IDs of existing platform courses
        externalResources: ExternalResource[];
        communities: CommunityLink[];
        books: BookReference[];
    };

    // === RELATED ===
    relatedCareers: string[];          // Similar paths (IDs or names)
    transitionPaths: TransitionPath[]; // "If you master X, you could also do Y"
}

export interface SkillCategory {
    name: string;                      // "Foundation", "Core", "Advanced"
    weight: number;                    // % of total (all categories = 100%)
    skills: Skill[];
}

export interface Skill {
    id: string;
    name: string;                      // "Python Programming"
    description: string;
    importance: 'essential' | 'important' | 'nice-to-have';
    dependencies: string[];            // Skill IDs that must be learned first

    // Assessment
    assessmentQuestions?: QuizQuestion[]; // Optional, loaded on demand or generated
    proficiencyLevels: {
        beginner: string;                // "Can write basic scripts"
        intermediate: string;            // "Can build full applications"
        advanced: string;                // "Can architect complex systems"
    };

    // Learning
    learningResources: {
        platformCourses: string[];
        estimatedTimeToLearn: string;
    };
}

export interface ExternalResource {
    title: string;
    url: string;
    type: 'article' | 'video' | 'course' | 'tool';
    isFree: boolean;
}

export interface CommunityLink {
    name: string;
    url: string;
    platform: 'Discord' | 'Reddit' | 'LinkedIn' | 'Slack' | 'Other';
}

export interface BookReference {
    title: string;
    author: string;
    url?: string;
}

export interface TransitionPath {
    toCareer: string;
    description: string;
    skillOverlap: number; // Percentage 0-100
}

// Re-using QuizQuestion from agents.ts or course.ts if possible, but defining a local version for independence if needed.
// For now, let's use a simplified version compatible with the existing one.
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string; // The correct option string
    explanation: string;
}

// ============================================
// USER PROFILE & PROGRESS
// ============================================

export interface UserCareerProfile {
    userId: string;

    // === DISCOVERED STRENGTHS ===
    discoveredStrengths: {
        skills: string[];                // Skills they're good at
        traits: string[];                // "Analytical", "Creative", etc.
        assessmentDate: Date;
    };

    // === CAREER GOALS ===
    goals: {
        primary?: UserCareerGoal;
        alternatives: UserCareerGoal[];  // Other interests
    };

    // === SKILL STATE ===
    // Map key is skillId
    skills: Record<string, UserSkillState>;

    // === LEARNING PLAN ===
    learningPlan?: PersonalizedLearningPlan;
}

export interface UserCareerGoal {
    careerPathId: string;
    careerPathTitle: string; // Denormalized for easy access
    selectedAt: Date;
    targetDate?: Date;                 // When they want to achieve it
    progress: number;                  // 0-100%
}

export interface UserSkillState {
    skillId: string;
    proficiency: number;               // 0-100
    sources: SkillProficiencySource[];
    lastUpdated: Date;
}

export interface SkillProficiencySource {
    type: 'assessment' | 'course-completion' | 'quiz-performance' | 'manual-entry';
    value: number;
    timestamp: Date;
    reference?: string;                // Course ID, quiz ID, etc.
}

// ============================================
// LEARNING PLAN
// ============================================

export interface PersonalizedLearningPlan {
    id: string;
    userId: string;
    careerPathId: string;

    createdAt: Date;
    lastAdaptedAt: Date;

    // Current position
    currentPhaseIndex: number;
    overallProgress: number;           // 0-100%

    // Timeline
    estimatedCompletion: Date;

    // Phases
    phases: LearningPhase[];

    // Adaptations (how plan has evolved)
    adaptationHistory: PlanAdaptation[];
}

export interface LearningPhase {
    id: string;
    order: number;
    title: string;                     // "Phase 1: Programming Foundations"
    description: string;
    estimatedDuration: string;         // "4-6 weeks"

    // What to learn
    targetSkills: {
        skillId: string;
        targetProficiency: number;       // Goal: reach 70% in Python
    }[];

    // How to learn
    recommendedCourses: string[];      // Platform course IDs
    externalResources: ExternalResource[];

    // Milestones
    milestones: Milestone[];

    // Status
    status: 'locked' | 'active' | 'completed';
    progress: number;
}

export interface Milestone {
    id: string;
    title: string;                     // "Complete Python Basics course"
    type: 'course' | 'quiz' | 'project' | 'skill-level';
    requirement: string;               // "Complete course X" or "Reach 70% in skill Y"
    completed: boolean;
}

export interface PlanAdaptation {
    timestamp: Date;
    reason: string;                    // "User excelled in Python, advancing faster"
    changes: string[];                 // What was modified
}

// ============================================
// COMPARISON
// ============================================

export interface CareerComparison {
    careers: string[];                  // Career path IDs being compared
    userId: string;                     // For personalized metrics

    comparison: Record<string, {         // Dimension -> Career Data
        [careerId: string]: ComparisonValue;
    }>;
}

export interface ComparisonValue {
    value: string | number;
    formatted: string;
    score?: number; // 0-100 for visual bars
}
