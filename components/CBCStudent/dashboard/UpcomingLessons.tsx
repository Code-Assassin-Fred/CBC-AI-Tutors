import React from 'react';
import Card from '../shared/Card';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  tags: Array<{ label: string }>;
  time: string;
}

export default function UpcomingLessons() {
  const lessons: Lesson[] = [
    {
      id: 1,
      title: 'Algebra: Quadratic Equations',
      subject: 'Mathematics',
      tags: [{ label: 'Math' }],
      time: '11:30 AM - 12:30 PM',
    },
    {
      id: 2,
      title: 'Essay Writing Techniques',
      subject: 'English',
      tags: [{ label: 'English' }],
      time: '02:00 PM - 03:00 PM',
    },
    {
      id: 3,
      title: 'Photosynthesis & Energy',
      subject: 'Science',
      tags: [{ label: 'Biology' }],
      time: '04:00 PM - 05:00 PM',
    },
  ];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white/95">Schedule</h2>
          <p className="text-sm text-[#9aa6b2] mt-1">Today&apos;s lessons</p>
        </div>
        <span className="text-xs text-orange-400 hover:text-orange-300 font-medium cursor-pointer">
          View All
        </span>
      </div>

      {/* Lesson Cards */}
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="group rounded-xl bg-[#0b0f12] p-4 border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-colors duration-300 cursor-pointer"
          >
            {/* Subject Tag */}
            <div className="flex flex-wrap gap-2 mb-3">
              {lesson.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
                >
                  {tag.label}
                </span>
              ))}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white/95 mb-2 line-clamp-1 transition-colors duration-300 group-hover:text-[#7c3aed]">
              {lesson.title}
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
              <span className="text-xs text-white/90">{lesson.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plain text CTA */}
      <p className="mt-4 text-sm text-white/90 cursor-pointer hover:text-orange-400 transition-colors duration-300">
        + Add to Calendar
      </p>
    </Card>
  );
}
