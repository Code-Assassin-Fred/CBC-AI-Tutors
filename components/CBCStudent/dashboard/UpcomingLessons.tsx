'use client';

import React from 'react';
import Card from '../shared/Card';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { useCourses } from '@/lib/context/CoursesContext';

interface StudyBlockDisplay {
  id: string;
  title: string;
  tags: Array<{ label: string }>;
  time: string;
  completed: boolean;
}

export default function UpcomingLessons() {
  const { daySchedules, isLoading } = useSchedule();
  const { myCourses } = useCourses();

  // Get today's blocks from schedule
  const today = daySchedules.find(d => d.isToday);
  const todaysBlocks: StudyBlockDisplay[] = today?.blocks.map(block => ({
    id: block.id,
    title: block.topic,
    tags: [{ label: block.color === 'violet' ? 'Career' : 'Study' }],
    time: block.startTime || 'Flexible',
    completed: block.completed,
  })) || [];

  // If no scheduled blocks, show course-based suggestions
  const hasTodaysBlocks = todaysBlocks.length > 0;

  const fallbackLessons: StudyBlockDisplay[] = myCourses.slice(0, 3).map((course, idx) => ({
    id: `suggested-${idx}`,
    title: course.title,
    tags: [{ label: course.difficulty || 'Course' }],
    time: 'Flexible',
    completed: false,
  }));

  const displayBlocks = hasTodaysBlocks ? todaysBlocks : fallbackLessons;
  const hasContent = displayBlocks.length > 0;

  // Tag color mapping
  const getTagColor = (label: string) => {
    const colors: Record<string, string> = {
      'Career': 'bg-violet-500',
      'Study': 'bg-cyan-500',
      'beginner': 'bg-emerald-500',
      'intermediate': 'bg-amber-500',
      'advanced': 'bg-rose-500',
      'Course': 'bg-sky-500',
    };
    return colors[label] || 'bg-orange-500';
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/5 rounded w-24"></div>
          <div className="space-y-3">
            <div className="h-24 bg-white/5 rounded-xl"></div>
            <div className="h-24 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white/95">Schedule</h2>
          <p className="text-sm text-[#9aa6b2] mt-1">
            {hasTodaysBlocks ? "Today's sessions" : 'Suggested courses'}
          </p>
        </div>
        <span className="text-xs text-orange-400 hover:text-orange-300 font-medium cursor-pointer">
          View All
        </span>
      </div>

      {/* Lesson/Block Cards */}
      {hasContent ? (
        <div className="space-y-4">
          {displayBlocks.map((block) => (
            <div
              key={block.id}
              className={`group rounded-xl bg-[#0b0f12] p-4 border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-colors duration-300 cursor-pointer ${block.completed ? 'opacity-60' : ''
                }`}
            >
              {/* Subject Tag */}
              <div className="flex flex-wrap gap-2 mb-3">
                {block.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag.label)} text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]`}
                  >
                    {tag.label}
                  </span>
                ))}
                {block.completed && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Done
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={`text-sm font-semibold mb-2 line-clamp-1 transition-colors duration-300 group-hover:text-[#0ea5e9] ${block.completed ? 'text-white/60 line-through' : 'text-white/95'
                }`}>
                {block.title}
              </h3>

              {/* Time */}
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-white/80"
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
                <span className="text-xs text-white/90">{block.time}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-[#9aa6b2] mb-1">No sessions scheduled</p>
          <p className="text-xs text-[#9aa6b2]/70">Add study blocks in Schedule</p>
        </div>
      )}

      {/* Plain text CTA */}
      <p className="mt-4 text-sm text-white/90 cursor-pointer hover:text-orange-400 transition-colors duration-300">
        + Add to Calendar
      </p>
    </Card>
  );
}
