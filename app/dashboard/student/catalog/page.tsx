"use client";

import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import { useCourseCatalog } from '@/hooks/useCourseCatalog';
import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CatalogCourseCard } from '@/components/CBCStudent/courses/CatalogCourseCard';
import Button from "@/components/ui/Button";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CourseCatalogPage() {
  useDashboardProtection(['individual-student', 'institution-student']);
  
  const router = useRouter();
  const { courses, isLoading, enrollInCourse, refetch } = useCourseCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourseId(courseId);
    try {
      const result = await enrollInCourse(courseId);
      
      if (result.success) {
        // Show success message and redirect to the new course
        alert('Successfully enrolled in course!');
        router.push(`/dashboard/student/cbc/courses/${result.courseId}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enroll';
      alert(message);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.subjects.some(s => s.subject.toLowerCase().includes(query)) ||
      course.grade.toLowerCase().includes(query)
    );
  });

  const hasCourses = filteredCourses.length > 0;

  return (
    <DashboardLayout active="Courses">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/dashboard/student/cbc/courses')}
              className="bg-white/5 hover:bg-white/10 text-white border-white/10 px-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white/95">Course Catalog</h1>
              <p className="text-sm text-[#9aa6b2]">Browse and enroll in curated courses</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search courses by name, subject, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/70">Loading courses...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasCourses && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-white/95">
              {searchQuery ? 'No courses found' : 'No courses available yet'}
            </h2>
            <p className="text-[#9aa6b2] max-w-md">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all available courses.'
                : 'Course catalog is currently empty. Check back soon for new courses!'}
            </p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && hasCourses && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CatalogCourseCard 
                key={course.id} 
                course={course}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && hasCourses && (
          <div className="text-center text-sm text-white/50 pt-4">
            Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
