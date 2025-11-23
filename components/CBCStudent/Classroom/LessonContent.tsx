"use client";

import React, { useMemo } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

type Lesson = {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  specification?: string;
  content?: string;
  createdAt?: Date;
  userId?: string;
} | null;

interface LessonContentProps {
  lesson: Lesson;
}

// Lightweight renderer for chapter lessons without requiring LessonContext
export default function LessonContent({ lesson }: LessonContentProps) {
  const formattedHtml = useMemo(() => {
    const raw = lesson?.content?.trim();
    if (!raw) return '';

    // Basic cleanup for stray markdown markers then sanitize
    const cleaned = raw
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1');

    return sanitizeHtml(cleaned);
  }, [lesson?.content]);

  if (!lesson) {
    return (
      <div className="text-white/70">No lesson available yet.</div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none">
      {formattedHtml ? (
        <article className="prose prose-invert max-w-none text-white/90 prose-headings:text-white prose-a:text-blue-300 hover:prose-a:text-blue-200 prose-strong:text-white prose-code:text-blue-200">
          <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        </article>
      ) : (
        <div className="text-white/80 leading-relaxed">
          This lesson will appear here once generated.
        </div>
      )}
    </div>
  );
}
