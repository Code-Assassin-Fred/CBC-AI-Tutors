"use client";

import { use } from 'react';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import Button from "@/components/ui/Button";
import { ArrowLeft, BookOpen, CheckCircle, Circle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  useDashboardProtection(['individual-student', 'institution-student']);
  
  const { courseId } = use(params);
  const router = useRouter();
  const { course, isLoading, error } = useCourseDetail(courseId);

  if (isLoading) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading course...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-white/70">{error || 'Course not found'}</div>
            <Button onClick={() => router.back()} variant="secondary">
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completedChapters = course.chapters.filter(ch => ch.completed).length;
  const totalChapters = course.chapters.length;
  const progressPercent = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  return (
    <DashboardLayout active="Courses">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              className="bg-white/5 hover:bg-white/10 text-white border-white/10 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white/95 mb-2">{course.name}</h1>
              <p className="text-[#9aa6b2] text-sm max-w-2xl">{course.description}</p>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Progress */}
            <div>
              <p className="text-xs text-[#9aa6b2] mb-2">Progress</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white/95">{Math.round(progressPercent)}%</span>
                <span className="text-sm text-[#9aa6b2]">{completedChapters}/{totalChapters}</span>
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Grade */}
            <div>
              <p className="text-xs text-[#9aa6b2] mb-2">Grade Level</p>
              <p className="text-lg font-semibold text-white/95">{course.grade}</p>
            </div>

            {/* Subjects */}
            <div>
              <p className="text-xs text-[#9aa6b2] mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {course.subjects.slice(0, 2).map((sub, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 rounded bg-[#7c3aed]/20 text-[#a78bfa]"
                  >
                    {sub.subject}
                  </span>
                ))}
                {course.subjects.length > 2 && (
                  <span className="text-xs px-2 py-1 rounded bg-white/10 text-[#9aa6b2]">
                    +{course.subjects.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs text-[#9aa6b2] mb-2">Duration</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#9aa6b2]" />
                <p className="text-sm text-white/90">{course.estimatedDuration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div>
          <h2 className="text-xl font-semibold text-white/95 mb-4">Course Chapters</h2>
          <div className="space-y-3">
            {course.chapters.map((chapter, index) => {
              const isCompleted = chapter.completed;
              const isLocked = index > 0 && !course.chapters[index - 1].completed;

              return (
                <Link
                  key={chapter.id}
                  href={isLocked ? '#' : `/dashboard/student/cbc/courses/${courseId}/chapter/${chapter.id}`}
                  className={`
                    block p-5 rounded-xl border transition-all
                    ${isCompleted 
                      ? 'bg-[#7c3aed]/10 border-[#7c3aed]/30 hover:border-[#7c3aed]/50' 
                      : isLocked
                      ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Chapter Number / Status Icon */}
                    <div className={`
                      shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-[#7c3aed]/20' 
                        : isLocked 
                        ? 'bg-white/5'
                        : 'bg-white/10'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-[#a78bfa]" />
                      ) : (
                        <span className={`
                          text-sm font-semibold
                          ${isLocked ? 'text-white/30' : 'text-white/70'}
                        `}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Chapter Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`
                          font-medium
                          ${isLocked ? 'text-white/30' : 'text-white/95'}
                        `}>
                          {chapter.title}
                        </h3>
                        {isLocked && (
                          <span className="text-xs px-2 py-1 rounded bg-white/5 text-white/50">
                            Locked
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-xs px-2 py-1 rounded bg-[#7c3aed]/20 text-[#a78bfa]">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className={`h-3.5 w-3.5 ${isLocked ? 'text-white/20' : 'text-[#9aa6b2]'}`} />
                        <span className={`text-xs ${isLocked ? 'text-white/30' : 'text-[#9aa6b2]'}`}>
                          {chapter.subject}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {chapter.topics.slice(0, 3).map((topic, i) => (
                          <span 
                            key={i}
                            className={`
                              text-xs px-2 py-1 rounded
                              ${isLocked 
                                ? 'bg-white/5 text-white/30'
                                : 'bg-white/10 text-[#9aa6b2]'
                              }
                            `}
                          >
                            {topic}
                          </span>
                        ))}
                        {chapter.topics.length > 3 && (
                          <span className={`
                            text-xs px-2 py-1 rounded
                            ${isLocked 
                              ? 'bg-white/5 text-white/30'
                              : 'bg-white/10 text-[#9aa6b2]'
                            }
                          `}>
                            +{chapter.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
