"use client";

import { CareerPath, CareerCourse } from '@/types/careerPath';

interface CourseProgressInfo {
    title: string;
    enrolled: boolean;
    isCompleted: boolean;
    overallProgress: number;
}

interface CareerPathViewProps {
    careerPath: CareerPath;
    courseProgress?: CourseProgressInfo[];
    onStartCourse?: (course: CareerCourse) => void;
    onBack?: () => void;
}

export default function CareerPathView({
    careerPath,
    courseProgress = [],
    onStartCourse,
    onBack
}: CareerPathViewProps) {
    // Get progress for a specific course
    const getProgress = (courseTitle: string): CourseProgressInfo | undefined => {
        return courseProgress.find(p => p.title.toLowerCase() === courseTitle.toLowerCase());
    };

    // Check if a course is unlocked (first course or previous is completed)
    const isCourseUnlocked = (index: number) => {
        if (index === 0) return true;
        const previousCourse = careerPath.courses[index - 1];
        const prevProgress = getProgress(previousCourse.title);
        return prevProgress?.isCompleted === true;
    };

    // Count stats
    const completedCount = courseProgress.filter(p => p.isCompleted).length;
    const inProgressCount = courseProgress.filter(p => p.enrolled && !p.isCompleted).length;

    return (
        <div className="max-w-4xl mx-auto pt-4 sm:pt-6 px-3 sm:px-4 pb-8 sm:pb-12">
            {/* Back button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="text-xs sm:text-sm text-white/50 hover:text-white mb-4 sm:mb-6 transition-colors"
                >
                    ← Back
                </button>
            )}

            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">{careerPath.title}</h1>
                <p className="text-sm sm:text-base text-white/60 mb-3 sm:mb-4">{careerPath.description}</p>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="inline-flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs sm:text-sm">
                        {careerPath.courses.length} Courses
                    </span>
                    {inProgressCount > 0 && (
                        <span className="inline-flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] text-xs sm:text-sm">
                            {inProgressCount} In Progress
                        </span>
                    )}
                    {completedCount > 0 && (
                        <span className="inline-flex px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm">
                            {completedCount} Completed
                        </span>
                    )}
                </div>
            </div>

            {/* Course List */}
            <div className="space-y-2">
                {careerPath.courses.map((course, index) => {
                    const progress = getProgress(course.title);
                    const enrolled = progress?.enrolled || false;
                    const completed = progress?.isCompleted || false;
                    const inProgress = enrolled && !completed;
                    const unlocked = isCourseUnlocked(index);

                    return (
                        <div
                            key={course.id}
                            className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-xl transition-all ${completed
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : inProgress
                                    ? 'bg-[#0ea5e9]/5 border-[#0ea5e9]/20'
                                    : unlocked
                                        ? 'bg-[#0b0f12] border-white/10'
                                        : 'bg-[#0b0f12]/50 border-white/5 opacity-60'
                                }`}
                        >
                            {/* Order number / Status */}
                            <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${completed
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : inProgress
                                    ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]'
                                    : unlocked
                                        ? 'bg-white/10 text-white/70'
                                        : 'bg-white/5 text-white/30'
                                }`}>
                                {completed ? (
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : inProgress ? (
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Course info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm sm:text-base font-medium truncate ${completed ? 'text-emerald-400' : inProgress ? 'text-[#0ea5e9]' : unlocked ? 'text-white' : 'text-white/50'
                                    }`}>
                                    {course.title}
                                </h3>
                                <p className={`text-xs sm:text-sm truncate hidden sm:block ${completed ? 'text-emerald-400/60' : inProgress ? 'text-[#0ea5e9]/60' : 'text-white/40'
                                    }`}>
                                    {course.description}
                                </p>
                            </div>

                            {/* Progress bar for in-progress courses */}
                            {inProgress && progress && progress.overallProgress > 0 && (
                                <div className="flex-shrink-0 w-16">
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#0ea5e9] rounded-full transition-all"
                                            style={{ width: `${progress.overallProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-[#0ea5e9]/70 text-center mt-1">{progress.overallProgress}%</p>
                                </div>
                            )}

                            {/* Action */}
                            {onStartCourse && (
                                unlocked ? (
                                    <button
                                        onClick={() => onStartCourse(course)}
                                        className={`flex-shrink-0 text-sm hover:underline ${completed ? 'text-emerald-400' : inProgress ? 'text-[#0ea5e9]' : 'text-[#0ea5e9]'
                                            }`}
                                    >
                                        {completed ? 'Review →' : inProgress ? 'Continue →' : 'Start →'}
                                    </button>
                                ) : (
                                    <span className="flex-shrink-0 text-white/30 text-sm flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Locked
                                    </span>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
