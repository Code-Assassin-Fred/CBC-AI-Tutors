/**
 * Schedule Types
 * 
 * Types for personal study schedule, learning goals, and streak tracking
 */

// ============================================
// STUDY BLOCK TYPES
// ============================================

export interface StudyBlock {
    id: string;
    userId: string;

    // Timing
    date: string;           // ISO date string (YYYY-MM-DD)
    startTime?: string;     // Optional specific time (HH:mm)
    duration: number;       // Duration in minutes

    // Content
    topic: string;          // Display title

    // Source (one of these must be present)
    source: 'course' | 'classroom';

    // Course Metadata
    courseId?: string;
    lessonId?: string;

    // Classroom Metadata
    classroom?: {
        grade: string;
        subject: string;
        strand: string;
        substrand?: string;
    };

    // Display
    color: StudyBlockColor;
    notes?: string;

    // Status
    completed: boolean;
    completedAt?: Date;
    actualDuration?: number; // Actual time spent

    // Metadata
    createdAt: Date;
    updatedAt?: Date;
}

export type StudyBlockColor =
    | 'cyan'      // Default
    | 'emerald'   // Completed/success
    | 'amber'     // Priority
    | 'violet'    // Career path
    | 'rose'      // Overdue
    | 'slate';    // Low priority

// ============================================
// LEARNING GOAL TYPES
// ============================================

export interface LearningGoal {
    id: string;
    userId: string;

    // Goal definition
    title: string;          // e.g., "Python Programming"
    targetHours: number;    // Target hours per week
    skillId?: string;       // Link to career skill
    courseId?: string;      // Link to course

    // Progress (calculated from completed blocks)
    completedHours: number;

    // Display
    color: StudyBlockColor;

    // Timing
    weekStart: string;      // ISO date of week start (Monday)

    // Metadata
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// STREAK TYPES
// ============================================

export interface StudyStreak {
    userId: string;
    currentStreak: number;      // Days in a row
    longestStreak: number;      // All-time best
    lastStudyDate: string;      // ISO date
    totalStudyDays: number;     // Lifetime count
    weeklyStudyDays: number[];  // Last 7 days (0 = no study, 1 = studied)
}

// ============================================
// WEEKLY SCHEDULE
// ============================================

export interface WeeklySchedule {
    weekStart: string;          // ISO date of Monday
    weekEnd: string;            // ISO date of Sunday
    blocks: StudyBlock[];
    goals: LearningGoal[];
    totalPlannedMinutes: number;
    totalCompletedMinutes: number;
}

export interface DaySchedule {
    date: string;               // ISO date
    dayName: string;            // "Mon", "Tue", etc.
    isToday: boolean;
    blocks: StudyBlock[];
    totalMinutes: number;
}

// ============================================
// REMINDER TYPES
// ============================================

export interface UpcomingReminder {
    id: string;
    type: 'study-block' | 'goal-deadline' | 'streak-risk';
    title: string;
    description: string;
    time?: string;              // e.g., "3:00 PM today"
    urgency: 'low' | 'medium' | 'high';
    relatedBlockId?: string;
    relatedGoalId?: string;
}

// ============================================
// SCHEDULE CONTEXT STATE
// ============================================

export interface ScheduleState {
    // Current view
    currentWeekStart: Date;

    // Data
    weeklySchedule: WeeklySchedule | null;
    streak: StudyStreak | null;
    reminders: UpcomingReminder[];

    // Loading states
    isLoading: boolean;
    isSaving: boolean;

    // Modal state
    editingBlock: StudyBlock | null;
    editingGoal: LearningGoal | null;
}

// ============================================
// API TYPES
// ============================================

export interface ScheduleApiRequest {
    userId: string;
    weekStart: string;
}

export interface CreateBlockRequest {
    userId: string;
    date: string;
    duration: number;
    topic: string;
    startTime?: string;
    color?: StudyBlockColor;
    notes?: string;
    skillId?: string;
    courseId?: string;
}

export interface CreateGoalRequest {
    userId: string;
    title: string;
    targetHours: number;
    weekStart: string;
    color?: StudyBlockColor;
    skillId?: string;
    courseId?: string;
}

export interface UpdateBlockRequest {
    blockId: string;
    updates: Partial<Omit<StudyBlock, 'id' | 'userId' | 'createdAt'>>;
}

export interface UpdateGoalRequest {
    goalId: string;
    updates: Partial<Omit<LearningGoal, 'id' | 'userId' | 'createdAt'>>;
}
