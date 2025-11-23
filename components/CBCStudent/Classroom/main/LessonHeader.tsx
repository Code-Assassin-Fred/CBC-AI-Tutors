"use client";

import React from 'react';
import { useLesson } from '../context/LessonContext';

type Props = {
  onCreateNewLesson?: () => void;
};

export default function LessonHeader({ onCreateNewLesson }: Props) {
  const { lesson } = useLesson();
  if (!lesson) return null;

  return (
    <div className="border-b border-white/10 pb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse"></div>
            <span className="text-xs font-medium text-[#c4b5fd] uppercase tracking-wider">
              {lesson.grade} • {lesson.subject}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">{lesson.topic}</h1>
          {lesson.specification && (
            <p className="text-white/60 text-sm">{lesson.specification}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Plus icon only, no surrounding styles */}
          <button
            type="button"
            onClick={onCreateNewLesson}
            aria-label="new lesson"
            title="new lesson"
            className="p-0 text-white hover:text-[#c4b5fd] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>

          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <span className="text-emerald-400 text-xs font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
