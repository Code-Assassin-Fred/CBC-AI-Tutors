"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { useCourses } from '@/hooks/useCourses';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import Button from "@/components/ui/Button";
import { PlusCircle, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/CBCStudent/courses/CourseCard";
import { EmptyCoursesState } from "@/components/CBCStudent/courses/EmptyCoursesState";
import { CourseCreationModal } from "@/components/CBCStudent/courses/CourseCreationModal";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CoursesPage() {
  useDashboardProtection(['individual-student', 'institution-student']);
  
  const { courses, isLoading, refetch } = useCourses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  const hasCourses = courses.length > 0;

  const handleCourseCreated = () => {
    setIsModalOpen(false);
    refetch(); // Refresh courses list
  };

  return (
    <DashboardLayout active="Courses">
      <div className="max-w-7xl mx-auto space-y-6">
        {!isLoading && (
          <>
            {hasCourses && (
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white/95">My Courses</h1>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => router.push('/dashboard/student/cbc/catalog')}
                    className="bg-white/5 hover:bg-white/10 text-white border-white/10"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Catalog
                  </Button>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Course
                  </Button>
                </div>
              </div>
            )}

            {hasCourses ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyCoursesState onCreateCourse={() => setIsModalOpen(true)} />
            )}
          </>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading courses...</div>
          </div>
        )}

        <CourseCreationModal 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onCourseCreated={handleCourseCreated}
        />
      </div>
    </DashboardLayout>
  );
}

