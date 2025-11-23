"use client";

import { useEffect, useState } from "react";
import { Clock, BookOpen, Target, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useLessonPlanner } from "@/hooks/useLessonPlanner";
import type { PlannedLesson, WeekSummary } from "@/lib/types";

interface LessonPlanViewProps {
  courseId: string;
  courseName: string;
  estimatedDuration?: string;
}

export function LessonPlanView({ courseId, courseName, estimatedDuration }: LessonPlanViewProps) {
  const { plannedLessons, schedule, fetchLessons, isFetching } = useLessonPlanner();
  const [groupedLessons, setGroupedLessons] = useState<Map<string, PlannedLesson[]>>(new Map());

  useEffect(() => {
    fetchLessons({ courseId });
  }, [courseId]);

  useEffect(() => {
    // Group lessons by chapter
    const grouped = new Map<string, PlannedLesson[]>();
    plannedLessons.forEach(lesson => {
      const chapterLessons = grouped.get(lesson.chapterId) || [];
      chapterLessons.push(lesson);
      grouped.set(lesson.chapterId, chapterLessons);
    });
    setGroupedLessons(grouped);
  }, [plannedLessons]);

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-[#7c3aed] animate-spin mb-4" />
        <p className="text-white/70">Loading lesson plan...</p>
      </div>
    );
  }

  if (plannedLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white/90 mb-2">No Lesson Plan Yet</h3>
        <p className="text-sm text-white/60">
          Lesson planning is being generated. This may take a few minutes.
        </p>
      </div>
    );
  }

  const totalMinutes = plannedLessons.reduce((sum, l) => sum + l.targetDurationMin, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-xs text-white/60">Total Lessons</span>
          </div>
          <p className="text-2xl font-bold text-white">{plannedLessons.length}</p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-xs text-white/60">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {totalHours}h {remainingMinutes}m
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-xs text-white/60">Duration</span>
          </div>
          <p className="text-2xl font-bold text-white">{schedule?.totalWeeks || '?'} weeks</p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-[#7c3aed]" />
            <span className="text-xs text-white/60">Per Week</span>
          </div>
          <p className="text-2xl font-bold text-white">{schedule?.lessonsPerWeek || '?'} lessons</p>
        </div>
      </div>

      {/* Schedule Recommendations */}
      {schedule?.recommendations && schedule.recommendations.length > 0 && (
        <div className="p-4 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30">
          <h3 className="font-semibold text-white/95 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Schedule Recommendations
          </h3>
          <ul className="space-y-1 text-sm text-white/70">
            {schedule.recommendations.map((rec, i) => (
              <li key={i}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weekly Schedule */}
      {schedule?.weekSummary && (
        <div>
          <h3 className="font-semibold text-white/95 mb-3">Weekly Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {schedule.weekSummary.map((week: WeekSummary) => (
              <div key={week.week} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#7c3aed]">Week {week.week}</span>
                  <span className="text-xs text-white/50">{week.lessonCount} lessons</span>
                </div>
                <p className="text-xs text-white/70">{Math.floor(week.totalMinutes / 60)}h {week.totalMinutes % 60}m</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lessons by Chapter */}
      <div>
        <h3 className="font-semibold text-white/95 mb-3">Detailed Lesson Plan</h3>
        <div className="space-y-4">
          {Array.from(groupedLessons.entries()).map(([chapterId, lessons]) => {
            const chapterMinutes = lessons.reduce((sum, l) => sum + l.targetDurationMin, 0);
            return (
              <div key={chapterId} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white/95 mb-1">
                      {lessons[0]?.chapterId || 'Chapter'}
                    </h4>
                    <p className="text-xs text-white/60">
                      {lessons.length} lessons • {Math.floor(chapterMinutes / 60)}h {chapterMinutes % 60}m
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                    <div 
                      key={lesson.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-white/50">L{lesson.order}</span>
                            <h5 className="text-sm font-medium text-white/90">{lesson.title}</h5>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {lesson.topics.map((topic, i) => (
                              <span 
                                key={i}
                                className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.targetDurationMin} min
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a78bfa]">
                              {lesson.depth}
                            </span>
                            {lesson.plannedWeek && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Week {lesson.plannedWeek}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
