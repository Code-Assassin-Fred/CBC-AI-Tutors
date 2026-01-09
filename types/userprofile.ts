export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserPreferences {
  studyReminders: boolean;
  soundEffects: boolean;
  weeklyReports: boolean;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string; // ISO timestamp
}

export interface UserProfile {
  displayName: string;
  role: UserRole;
  grade?: number;
  school?: string;
  photoURL?: string;
  onboardingComplete?: boolean;
  preferences?: UserPreferences;
}