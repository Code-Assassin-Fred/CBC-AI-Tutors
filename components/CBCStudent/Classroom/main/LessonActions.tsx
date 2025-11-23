"use client";

import React from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';

export default function LessonActions() {
  const { isAutoSaving } = useLesson();

  return (
    <div className="border-t border-white/10 pt-4 mt-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-white/50 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need help? Ask your AI tutor
          </p>
          {isAutoSaving && (
            <span className="text-xs text-white/70 flex items-center gap-1">
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Auto-saving...
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200">
            Mark Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
