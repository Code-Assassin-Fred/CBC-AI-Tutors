"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LessonListItemProps {
  lesson: {
    id: string;
    title: string;
    completed: boolean;
  };
}

export function LessonListItem({ lesson }: LessonListItemProps) {
  return (
    <Link
      href={`/dashboard/student/cbc/classroom/${lesson.id}`}
      className={cn(
        "flex items-center gap-2 text-sm rounded-md px-2 py-1.5 transition hover:bg-white/10",
        lesson.completed
          ? "text-[#9aa6b2] line-through"
          : "text-white/90"
      )}
    >
      {lesson.completed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-white/30" />
      )}
      {lesson.title}
    </Link>
  );
}
