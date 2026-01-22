"use client";

import React, { use } from "react";

interface EmptyLessonStateProps {
  grade: string;
  subject: string;
  strand: string;
}

export default function EmptyLessonState({
  grade,
  subject,
  strand,
}: EmptyLessonStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-24 h-24 mb-8 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-white/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">
        No Lesson Available Yet
      </h3>

      <p className="text-white/60 max-w-md leading-relaxed">
        The lesson for <strong>Grade {grade} {subject}</strong> –{" "}
        <strong>{strand}</strong> has not been generated yet.
      </p>
    </div>
  );
}