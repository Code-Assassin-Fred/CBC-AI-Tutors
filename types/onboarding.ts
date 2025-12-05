/** Unified user roles across frontend and backend */
export type UserRole = 'student' | 'teacher' | 'admin';

/** Data required for student onboarding */
export interface StudentOnboardingData {
  userId: string;
  name: string;
  age?: number;
}

/** Data required for teacher onboarding */
export interface TeacherOnboardingData {
  userId: string;
  name: string;
  subject: string;
  school: string;
  yearsExperience?: string;
}
