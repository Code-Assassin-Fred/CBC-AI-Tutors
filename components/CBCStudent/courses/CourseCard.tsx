"use client";

import Link from "next/link";
import { CourseProgressBar } from "@/components/CBCStudent/courses/CourseProgressBar";
import type { Course } from "@/lib/types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  // Get subject names
  const subjectNames = course.subjects.map(s => s.subject).join(', ');
  const subjectCount = course.subjects.length;
  
  // Format last accessed date
  const lastAccessed = course.lastAccessedAt 
    ? new Date(course.lastAccessedAt).toLocaleDateString()
    : 'Never';

  return (
    <Link href={`/dashboard/student/cbc/courses/${course.id}`}>
      <div className="relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all hover:ring-[#7c3aed]/20 hover:shadow-[0_8px_32px_rgba(124,58,237,0.25)]">
        {/* Thumbnail or gradient header */}
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-transparent opacity-60"></div>
          
          {/* CBC Badge */}
          {course.courseType === 'cbc' && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="text-xs font-semibold text-white">CBC</span>
            </div>
          )}
          
          {/* Subject count badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm">
            <span className="text-xs text-white/90">
              {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-white/95 mb-1">{course.name}</h3>
          <p className="text-sm text-[#9aa6b2] mb-1">{course.grade}</p>
          <p className="text-xs text-[#9aa6b2]/70 line-clamp-1 mb-3">{subjectNames}</p>
          
          <p className="text-sm text-[#9aa6b2] line-clamp-2 mb-4">
            {course.description}
          </p>
          
          <CourseProgressBar 
            progress={course.progress} 
            completed={course.completedChapters}
            total={course.totalChapters}
          />
          
          <div className="mt-3 flex items-center justify-between text-xs text-[#9aa6b2]/70">
            <span>Last accessed: {lastAccessed}</span>
            {course.estimatedDuration && (
              <span>{course.estimatedDuration}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
