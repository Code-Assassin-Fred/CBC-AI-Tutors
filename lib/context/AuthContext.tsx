'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  role: 'student' | 'teacher' | null;
  onboardingComplete: boolean;
  loading: boolean;
  setRole: (role: 'student' | 'teacher') => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<'student' | 'teacher' | null>(null);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Map backend roles to frontend roles
  const mapBackendRole = (backendRole: string | null): 'student' | 'teacher' | null => {
    if (!backendRole) return null;
    if (backendRole === 'cbc-student' || backendRole === 'student') return 'student';
    if (backendRole === 'cbc-teacher' || backendRole === 'teacher') return 'teacher';
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
      const res = await axios.get(`/api/onboarding/user/${uid}`);
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
  const setRole = async (newRole: 'student' | 'teacher') => {
    if (!user) return;
    try {
      await axios.post('/api/onboarding/role', { userId: user.uid, role: newRole });
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

  // Refresh role + onboarding info from backend
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
