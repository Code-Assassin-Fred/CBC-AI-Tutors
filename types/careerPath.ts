/**
 * Career Path Types (Simplified)
 * 
 * Clean types for AI-curated career learning paths
 */

// ============================================
// CORE TYPES
// ============================================

export type CareerDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CareerPath {
    id: string;
    title: string;
    description: string;
    estimatedDuration: string;  // e.g., "6-12 months"
    difficulty: CareerDifficulty;
    userId: string;
    createdAt: Date;
    courses: CareerCourse[];
}

export interface CareerCourse {
    id: string;
    order: number;
    title: string;
    description: string;
    duration: string;  // e.g., "2-3 weeks"
    learningOutcomes: LearningOutcome[];
    prerequisites: string[];  // Course titles
    generatedCourseId?: string;  // Link to full course if generated
}

export interface LearningOutcome {
    id: string;
    title: string;
    description: string;
    keyTopics: string[];
}

// ============================================
// GENERATION TYPES
// ============================================

export type CareerPathStep = 'generating' | 'complete' | 'error';

export interface CareerPathGenerationProgress {
    step: CareerPathStep;
    message: string;
    percentage: number;
}

export interface CareerPathGenerationEvent {
    type: 'progress' | 'complete' | 'error';
    step?: CareerPathStep;
    message?: string;
    percentage?: number;
    data?: CareerPath;
    error?: string;
}

// ============================================
// POPULAR CAREERS
// ============================================

export interface PopularCareer {
    id: string;
    title: string;
    icon: string;  // Emoji or icon name
    category: string;
    description: string;
}

export const POPULAR_CAREERS: PopularCareer[] = [
    {
        id: 'frontend-dev',
        title: 'Frontend Developer',
        icon: '🎨',
        category: 'Software Development',
        description: 'Build beautiful, interactive web applications'
    },
    {
        id: 'backend-dev',
        title: 'Backend Developer',
        icon: '⚙️',
        category: 'Software Development',
        description: 'Design and build server-side systems and APIs'
    },
    {
        id: 'fullstack-dev',
        title: 'Full Stack Developer',
        icon: '🔄',
        category: 'Software Development',
        description: 'Master both frontend and backend development'
    },
    {
        id: 'data-scientist',
        title: 'Data Scientist',
        icon: '📊',
        category: 'Data & AI',
        description: 'Extract insights from data using statistics and ML'
    },
    {
        id: 'ml-engineer',
        title: 'Machine Learning Engineer',
        icon: '🤖',
        category: 'Data & AI',
        description: 'Build and deploy machine learning systems'
    },
    {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        icon: '🚀',
        category: 'Infrastructure',
        description: 'Automate and streamline development pipelines'
    },
    {
        id: 'cloud-architect',
        title: 'Cloud Architect',
        icon: '☁️',
        category: 'Infrastructure',
        description: 'Design scalable cloud infrastructure solutions'
    },
    {
        id: 'cybersecurity',
        title: 'Cybersecurity Analyst',
        icon: '🔐',
        category: 'Security',
        description: 'Protect systems and data from cyber threats'
    },
    {
        id: 'mobile-dev',
        title: 'Mobile App Developer',
        icon: '📱',
        category: 'Software Development',
        description: 'Create iOS and Android applications'
    },
    {
        id: 'ux-designer',
        title: 'UX Designer',
        icon: '✨',
        category: 'Design',
        description: 'Design intuitive and delightful user experiences'
    }
];
