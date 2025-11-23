"use client";

import Button from "@/components/ui/Button";
import { CourseProgressBar } from "@/components/CBCStudent/courses/CourseProgressBar";

interface CourseOverviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    progress: number;
  };
}

export function CourseOverview({ course }: CourseOverviewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white/95">{course.title}</h1>
        <p className="text-[#9aa6b2] mt-2">{course.description}</p>
      </div>

      <div className="space-y-2">
        <CourseProgressBar progress={course.progress} />
      </div>

      <Button size="lg" className="mt-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
        Continue Learning
      </Button>
    </div>
  );
}
