export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  displayName: string;
  role: UserRole;
  grade?: string;
  school?: string;
  photoURL?: string;
  onboardingComplete?: boolean;
}