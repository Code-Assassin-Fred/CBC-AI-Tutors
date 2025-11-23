"use client";

import React, { useState } from 'react';
import { useLesson, type Lesson } from '../context/LessonContext';
import Button from '@/components/ui/Button';

type Props = {
  onLessonLoad?: () => void;
};

export default function SavedLessonsPanel({ onLessonLoad }: Props) {
  const { savedLessons, loadLesson, isLoading } = useLesson();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLessons = savedLessons.filter((lesson) => {
    if (!lesson) return false;
    const search = searchQuery.toLowerCase();
    return (
      lesson.topic.toLowerCase().includes(search) ||
      lesson.subject.toLowerCase().includes(search) ||
      lesson.grade.toLowerCase().includes(search)
    );
  });

  const handleLoadLesson = (lesson: Lesson) => {
    loadLesson(lesson);
    if (onLessonLoad) {
      onLessonLoad();
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Saved Lessons</h2>
        <p className="text-white/60 text-sm">Access your previously saved lessons</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by topic, subject, or grade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#7c3aed] border-t-transparent"></div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white/20 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-white/40 text-sm">
              {searchQuery ? 'No lessons match your search' : 'No saved lessons yet'}
            </p>
            <p className="text-white/30 text-xs mt-1">
              {searchQuery ? 'Try a different search term' : 'Create and save lessons to see them here'}
            </p>
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            if (!lesson) return null;
            return (
              <div
                key={lesson.id}
                className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 hover:border-blue-400/30 transition-all cursor-pointer"
                onClick={() => handleLoadLesson(lesson)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base mb-1 truncate group-hover:text-blue-300 transition-colors">
                      {lesson.topic}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {lesson.grade}
                      </span>
                      <span>•</span>
                      <span className="truncate">{lesson.subject}</span>
                    </div>
                    {lesson.specification && (
                      <p className="text-white/40 text-xs line-clamp-2 mb-2">
                        {lesson.specification}
                      </p>
                    )}
                    {lesson.createdAt && (
                      <div className="flex items-center gap-1 text-white/30 text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formatDate(lesson.createdAt)}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadLesson(lesson);
                    }}
                  >
                    Load
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {!isLoading && filteredLessons.length > 0 && (
        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-white/40 text-xs text-center">
            {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
          </p>
        </div>
      )}
    </div>
  );
}
