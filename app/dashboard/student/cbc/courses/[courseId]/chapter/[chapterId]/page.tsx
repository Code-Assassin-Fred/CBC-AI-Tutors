"use client";

import { use } from 'react';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { usePlannedLesson } from '@/hooks/usePlannedLesson';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import Button from "@/components/ui/Button";
import { ArrowLeft, BookOpen, Clock, Target } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChapterLessonPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
}

export default function ChapterLessonPage({ params }: ChapterLessonPageProps) {
  useDashboardProtection(['individual-student', 'institution-student']);
  
  const { courseId, chapterId } = use(params);
  const router = useRouter();

  const { 
    chapter, 
    plannedLesson,
    isLoading,
    error,
  } = usePlannedLesson(courseId, chapterId);

  const handleComplete = async () => {
    // TODO: Mark chapter as complete via API
    router.push(`/dashboard/student/cbc/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !plannedLesson) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-white/70">{error || 'Chapter not found'}</div>
            <Button onClick={() => router.back()} variant="secondary">
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!plannedLesson) {
    return (
      <DashboardLayout active="Courses">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <BookOpen className="h-12 w-12 text-white/30" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white/95 mb-2">
                No Lessons Available Yet
              </h3>
              <p className="text-[#9aa6b2] mb-4">
                Lessons for this chapter haven't been planned yet.
              </p>
              <Button
                onClick={() => router.back()}
                variant="secondary"
                className="bg-white/5 hover:bg-white/10 text-white border-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Courses">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              onClick={() => router.push(`/dashboard/student/cbc/courses/${courseId}`)}
              variant="secondary"
              className="bg-white/5 hover:bg-white/10 text-white border-white/10 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white/95 mb-1">{chapter?.title ?? plannedLesson.title}</h1>
              <p className="text-[#9aa6b2] text-sm">{chapter?.subject ?? plannedLesson.subject}</p>
            </div>
          </div>
          
          {chapter && !chapter.completed && (
            <Button
              onClick={handleComplete}
              className="bg-linear-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
            >
              Mark as Complete
            </Button>
          )}
        </div>

        {/* Lesson Info Card */}
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white/95 mb-2">{plannedLesson.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-[#9aa6b2]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{plannedLesson.targetDurationMin} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="capitalize">{plannedLesson.depth} level</span>
                </div>
                {plannedLesson.plannedWeek && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Week {plannedLesson.plannedWeek}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          {plannedLesson.learningObjectives && plannedLesson.learningObjectives.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white/90 mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#9aa6b2]">
                {plannedLesson.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Topics */}
          {plannedLesson.topics && plannedLesson.topics.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white/90 mb-2">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {plannedLesson.topics.map((topic, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#a78bfa] text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Activities */}
          {plannedLesson.keyActivities && plannedLesson.keyActivities.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-white/90 mb-2">Key Activities</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#9aa6b2]">
                {plannedLesson.keyActivities.map((activity, idx) => (
                  <li key={idx}>{activity}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Real World Context */}
          {plannedLesson.realWorldContext && (
            <div className="p-4 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30">
              <h3 className="text-sm font-semibold text-white/90 mb-2">Real-World Application</h3>
              <p className="text-sm text-[#9aa6b2]">{plannedLesson.realWorldContext}</p>
            </div>
          )}

          {/* Prerequisites */}
          {plannedLesson.prerequisites && plannedLesson.prerequisites.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white/90 mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#9aa6b2]">
                {plannedLesson.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Message */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-400">
            <strong>Coming Soon:</strong> Full lesson content generation. For now, you can review the lesson plan and objectives above.
          </p>
        </div>

        {/* Bottom Action */}
        <div className="flex justify-center pt-6 border-t border-white/10">
          {chapter && !chapter.completed ? (
            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-linear-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white"
            >
              Complete Chapter & Continue
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/dashboard/student/cbc/courses/${courseId}`)}
              size="lg"
              variant="secondary"
              className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            >
              Back to Course
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
