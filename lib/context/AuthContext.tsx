'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  role: 'student' | 'teacher' | 'admin' | null;
  onboardingComplete: boolean;
  loading: boolean;
  setRole: (role: 'student' | 'teacher' | 'admin') => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [loading, setLoading] = useState(true);

  // Map backend roles to frontend roles
  const mapBackendRole = (
    backendRole: string | null
  ): 'student' | 'teacher' | 'admin' | null => {
    if (!backendRole) return null;

    const normalized = backendRole.toLowerCase();

    if (normalized === 'cbc-student' || normalized === 'student') return 'student';
    if (normalized === 'cbc-teacher' || normalized === 'teacher') return 'teacher';
    if (normalized === 'cbc-admin'   || normalized === 'admin')   return 'admin';

    return null;
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchUserRole(firebaseUser.uid);
      } else {
        setRoleState(null);
        setOnboardingCompleteState(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch role + onboarding status from backend
  const fetchUserRole = async (uid: string) => {
    try {
      const res = await axios.get(`/api/user/${uid}`);
      const data = res.data;

      setRoleState(mapBackendRole(data.role ?? null));
      setOnboardingCompleteState(data.onboardingComplete ?? false);
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setRoleState(null);
      setOnboardingCompleteState(false);
    }
  };

  // Set role and save to DB
  const setRole = async (newRole: 'student' | 'teacher' | 'admin') => {
    if (!user) return;

    try {
      await axios.post('/api/onboarding/role', {
        userId: user.uid,
        role: newRole,
      });

      setRoleState(newRole);
      setOnboardingCompleteState(false);
    } catch (error) {
      console.error('Failed to set role:', error);
    }
  };

  // Set onboarding completion status
  const setOnboardingComplete = (complete: boolean) => {
    setOnboardingCompleteState(complete);
  };

  // Force refresh user role + onboarding info
  const refreshUserData = async () => {
    if (!user) return;
    await fetchUserRole(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        onboardingComplete,
        loading,
        setRole,
        setOnboardingComplete,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
