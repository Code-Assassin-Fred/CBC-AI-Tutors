"use client";

import { CatalogCourse } from "@/hooks/useCourseCatalog";
import Button from "@/components/ui/Button";
import { BookOpen, Clock, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

interface CatalogCourseCardProps {
  course: CatalogCourse;
  onEnroll: (courseId: string) => Promise<void>;
}

export function CatalogCourseCard({ course, onEnroll }: CatalogCourseCardProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await onEnroll(course.id);
    } finally {
      setIsEnrolling(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const subjects = course.subjects.map(s => s.subject).join(', ');

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#7c3aed]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#7c3aed]/10 flex flex-col">
      {/* Thumbnail */}
      {course.thumbnail && (
        <div className="w-full h-40 rounded-lg overflow-hidden mb-4 bg-white/5">
          <img 
            src={course.thumbnail} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Course Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-white/95 line-clamp-2 flex-1">
            {course.name}
          </h3>
        </div>

        <p className="text-sm text-[#9aa6b2] mb-3 line-clamp-2">
          {course.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <BookOpen className="h-4 w-4 text-[#7c3aed]" />
            <span>{course.totalChapters} chapters</span>
            <span className="text-white/30">•</span>
            <span>Grade {course.grade}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="text-white/50">Subjects:</span>
            <span className="line-clamp-1">{subjects}</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {course.estimatedDuration && (
              <div className="flex items-center gap-1 text-white/70">
                <Clock className="h-4 w-4 text-[#7c3aed]" />
                <span>{course.estimatedDuration}</span>
              </div>
            )}
            
            {course.difficulty && (
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-4 w-4 ${getDifficultyColor(course.difficulty)}`} />
                <span className={`capitalize ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-white/70">
            <Users className="h-4 w-4 text-[#7c3aed]" />
            <span>{course.enrollmentCount || 0} students enrolled</span>
          </div>
        </div>
      </div>

      {/* Enroll Button */}
      <Button
        onClick={handleEnroll}
        disabled={isEnrolling}
        className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white mt-auto"
      >
        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
      </Button>
    </div>
  );
}
