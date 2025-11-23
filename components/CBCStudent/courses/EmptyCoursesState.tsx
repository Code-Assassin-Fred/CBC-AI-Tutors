"use client";

import Button from "@/components/ui/Button";
import { PlusCircle, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyCoursesStateProps {
  onCreateCourse: () => void;
}

export function EmptyCoursesState({ onCreateCourse }: EmptyCoursesStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="text-6xl mb-4">📚</div>
      <h2 className="text-2xl font-semibold text-white/95">You don't have any courses yet</h2>
      <p className="text-[#9aa6b2] max-w-md">
        Start your learning journey by creating a structured course or explore individual topics in the classroom
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button 
          onClick={onCreateCourse}
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Course
        </Button>
        <Button 
          onClick={() => router.push('/dashboard/student/cbc/catalog')}
          className="bg-white/5 hover:bg-white/10 text-white border-white/10"
        >
          <Compass className="mr-2 h-4 w-4" />
          Explore Courses
        </Button>
      </div>
    </div>
  );
}
