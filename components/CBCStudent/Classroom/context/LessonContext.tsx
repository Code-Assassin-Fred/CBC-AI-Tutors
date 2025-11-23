"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks';
import type { AgentType } from '@/lib/ai/types';

export type Lesson = {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  content?: string;
  createdAt?: Date;
  userId?: string;
} | null;

type LessonContextType = {
  lesson: Lesson;
  setLesson: React.Dispatch<React.SetStateAction<Lesson>>;
  savedLessons: Lesson[];
  saveLesson: (lesson: Lesson) => Promise<void>;
  loadLesson: (lesson: Lesson) => void;
  loadSavedLessons: () => Promise<void>;
  isLoading: boolean;
  // Auto-save status
  isAutoSaving?: boolean;
  // Deprecated: use generationStatus instead
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  // Shared generation state for multi-agent pipeline
  generationStatus: 'idle' | 'planning' | 'accepting' | 'splitting' | 'generating' | 'completed' | 'error';
  setGenerationStatus: React.Dispatch<React.SetStateAction<'idle' | 'planning' | 'accepting' | 'splitting' | 'generating' | 'completed' | 'error'>>;
  currentAgent: AgentType | null;
  setCurrentAgent: React.Dispatch<React.SetStateAction<AgentType | null>>;
  generationProgress: { current: number; total: number };
  setGenerationProgress: React.Dispatch<React.SetStateAction<{ current: number; total: number }>>;
};

const LessonContext = createContext<LessonContextType | null>(null);

export function LessonProvider({ children }: { children: React.ReactNode }) {
  const [lesson, setLesson] = useState<Lesson>(null);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'planning' | 'accepting' | 'splitting' | 'generating' | 'completed' | 'error'>('idle');
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const { user } = useAuth();
  const lastAutoSaveSig = useRef<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load saved lessons when user is available
  useEffect(() => {
    if (user?.uid) {
      loadSavedLessons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadSavedLessons = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const { fetchLessons } = await import('@/lib/api');
      const response = await fetchLessons();
      const lessons = response.lessons.map(lesson => ({
        ...lesson,
        createdAt: lesson.createdAt ? new Date(lesson.createdAt) : undefined,
      })) as Lesson[];
      setSavedLessons(lessons);
    } catch (error) {
      console.error('Error loading saved lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLesson = async (lessonToSave: Lesson) => {
    if (!lessonToSave || !user?.uid) return;

    try {
      // Do not save if content is missing or trivially short (avoids saving placeholders)
      const contentText = (lessonToSave.content || '').trim();
      if (contentText.length < 60) {
        return;
      }

      // Avoid duplicates: if a lesson with same identity/content already exists, skip
      const exists = savedLessons.some((l) =>
        l &&
        l.grade === lessonToSave.grade &&
        l.subject === lessonToSave.subject &&
        l.topic === lessonToSave.topic &&
        (l.content?.trim() || '') === contentText
      );
      if (exists) return;

      const { saveLessonToServer } = await import('@/lib/api');
      const response = await saveLessonToServer({
        grade: lessonToSave.grade,
        subject: lessonToSave.subject,
        topic: lessonToSave.topic,
        specification: lessonToSave.specification || '',
        content: contentText,
      });
      
      if (response.success) {
        // Add to local state
        const newLesson = {
          ...response.lesson,
          createdAt: response.lesson.createdAt ? new Date(response.lesson.createdAt) : new Date(),
          userId: user.uid,
        };
        setSavedLessons(prev => [newLesson, ...prev]);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      throw error;
    }
  };

  const loadLesson = (lessonToLoad: Lesson) => {
    setLesson(lessonToLoad);
  };

  // Auto-save once when generation completes (debounced) and content is available
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    if (generationStatus === 'completed' && lesson && (lesson.content?.trim()?.length || 0) > 0) {
      // Build a simple signature to avoid duplicate saves in-session
      const content = (lesson.content || '').trim();
      const sig = [lesson.grade, lesson.subject, lesson.topic, content.length, content.slice(0, 200)].join('|');

      if (lastAutoSaveSig.current === sig) {
        return; // already auto-saved this exact content
      }

      autoSaveTimer.current = setTimeout(async () => {
        try {
          setIsAutoSaving(true);
          await saveLesson(lesson);
          lastAutoSaveSig.current = sig;
        } catch (e) {
          // swallow; errors already logged in saveLesson
        } finally {
          setIsAutoSaving(false);
        }
      }, 1200);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }
    };
  }, [generationStatus, lesson?.content]);

  return (
    <LessonContext.Provider 
      value={{ 
        lesson, 
        setLesson, 
        savedLessons, 
        saveLesson, 
        loadLesson,
        loadSavedLessons,
        isLoading,
        isAutoSaving,
        isGenerating,
        setIsGenerating,
        generationStatus,
        setGenerationStatus,
        currentAgent,
        setCurrentAgent,
        generationProgress,
        setGenerationProgress,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
}

export const useLesson = () => {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('useLesson must be used within a LessonProvider');
  return ctx;
};
