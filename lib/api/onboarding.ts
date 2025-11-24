// lib/api/onboarding.ts
import type { UserRole } from '@/types/onboarding';

/**
 * Save the user role to the backend.
 */
export async function saveRoleToDb(userId: string, role: UserRole) {
  try {
    const res = await fetch('/api/onboarding/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to save role');
    }

    return await res.json();
  } catch (err: any) {
    console.error('saveRoleToDb error:', err);
    throw new Error(err.message || 'Unknown error');
  }
}

/**
 * Onboard student
 */
export async function onboardStudent(data: {
  userId: string;
  name: string;
  age?: number;
}) {
  try {
    const res = await fetch('/api/onboarding/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to save student profile');
    }

    return await res.json();
  } catch (err: any) {
    console.error('onboardStudent error:', err);
    throw new Error(err.message || 'Unknown error');
  }
}

/**
 * Onboard teacher
 */
export async function setTeacherProfile(data: {
  userId: string;
  name: string;
  subject: string;
  school: string;
  yearsExperience?: string;
}) {
  try {
    const res = await fetch('/api/onboarding/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to save teacher profile');
    }

    return await res.json();
  } catch (err: any) {
    console.error('setTeacherProfile error:', err);
    throw new Error(err.message || 'Unknown error');
  }
}
