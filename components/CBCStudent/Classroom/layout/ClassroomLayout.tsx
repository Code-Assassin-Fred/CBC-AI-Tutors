"use client";

import React, { useMemo, useState } from 'react';
import LessonCanvas from '../main/LessonCanvas';
import TutorPanel from '../tutor/TutorPanel';
import SavedLessonsPanel from '../main/SavedLessonsPanel';
import { LessonProvider } from '../context/LessonContext';
import Button from '@/components/ui/Button';

export default function ClassroomLayout() {
  // view: both panels | left only (lesson) | right only (tutor)
  const [view, setView] = useState<'both' | 'left' | 'right'>('both');
  // contentMode: lesson (current lesson) | saved (saved lessons list)
  const [contentMode, setContentMode] = useState<'lesson' | 'saved'>('lesson');

  const leftClasses = useMemo(() => {
    const base =
      'transition-all duration-300 ease-in-out relative overflow-hidden min-w-0';
    const width =
      view === 'left'
        ? 'w-full'
        : view === 'both'
        ? 'w-[60%]'
        : 'w-0';
    const border = view === 'right' ? '' : 'border-r border-black';
    return `${base} ${width} ${border}`;
  }, [view]);

  const rightClasses = useMemo(() => {
    const base =
      'transition-all duration-300 ease-in-out relative overflow-hidden min-w-0 bg-gradient-to-br from-[#111113] to-[#1a1a1f]';
    const width =
      view === 'right'
        ? 'w-full'
        : view === 'both'
        ? 'w-[40%]'
        : 'w-0';
    return `${base} ${width}`;
  }, [view]);

  return (
    <LessonProvider>
      <div className="relative flex flex-col h-[85vh] md:h-[87vh] lg:h-[90vh] w-full bg-[#0E0E10] text-white overflow-hidden rounded-2xl shadow-md shadow-black/20 border border-white/10">
        {/* Top controls bar (prevents overlapping content) */}
        <div className="flex items-center justify-between gap-2 p-2 border-b border-white/10 bg-[#0E0E10]">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-2">
            <Button
              className={`px-3 py-1 text-xs border border-white/10 ${view === 'left' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
              onClick={() => setView('left')}
              aria-label="Show main content only"
            >
              Main Only
            </Button>
            <Button
              className={`px-3 py-1 text-xs border border-white/10 ${view === 'both' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
              onClick={() => setView('both')}
              aria-label="Show split view"
            >
              Split View
            </Button>
            <Button
              className={`px-3 py-1 text-xs border border-white/10 ${view === 'right' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
              onClick={() => setView('right')}
              aria-label="Show tutor only"
            >
              Tutor Only
            </Button>
          </div>

          {/* Content Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              className={`px-3 py-1 text-xs border border-white/10 flex items-center gap-1.5 ${contentMode === 'lesson' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
              onClick={() => setContentMode('lesson')}
              aria-label="Show current lesson"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Current Lesson
            </Button>
            <Button
              className={`px-3 py-1 text-xs border border-white/10 flex items-center gap-1.5 ${contentMode === 'saved' ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : 'bg-white/10 hover:bg-white/20'} `}
              onClick={() => setContentMode('saved')}
              aria-label="Show saved lessons"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Saved Lessons
            </Button>

          </div>
        </div>

        {/* Content row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Lesson Content Area */}
          <div className={leftClasses}>
            <div className="h-full p-6 overflow-y-auto scrollbar-hide bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
              {/* Hide content visually when fully collapsed to avoid focus traps */}
              <div className={view === 'right' ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'}>
                {contentMode === 'lesson' ? (
                  <LessonCanvas />
                ) : (
                  <SavedLessonsPanel onLessonLoad={() => setContentMode('lesson')} />
                )}
              </div>
            </div>
          </div>

          {/* Right: AI Tutor Panel */}
          <div className={rightClasses}>
            {/* Visual Separator Bar (only when tutor visible and not full-width left only) */}
            {view !== 'right' && view !== 'left' && (
              <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
            )}
            <div className="h-full p-6 overflow-hidden">
              <div className={(view === 'left' ? 'opacity-0 pointer-events-none select-none' : 'opacity-100') + ' h-full flex flex-col min-h-0'}>
                <TutorPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LessonProvider>
  );
}
