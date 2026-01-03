"use client";

import { CareerPath, CareerCourse } from '@/types/careerPath';

interface CareerPathViewProps {
    careerPath: CareerPath;
    onStartCourse?: (course: CareerCourse) => void;
    onBack?: () => void;
}

export default function CareerPathView({ careerPath, onStartCourse, onBack }: CareerPathViewProps) {
    return (
        <div className="max-w-4xl mx-auto pt-6 px-4 pb-12">
            {/* Back button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="text-white/50 hover:text-white mb-6 transition-colors"
                >
                    ← Back
                </button>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-3">{careerPath.title}</h1>
                <p className="text-white/60 mb-4">{careerPath.description}</p>

                <span className="inline-flex px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">
                    {careerPath.courses.length} Courses
                </span>
            </div>

            {/* Course List */}
            <div className="space-y-2">
                {careerPath.courses.map((course, index) => (
                    <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 bg-[#0b0f12] border border-white/10 rounded-xl"
                    >
                        {/* Order number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 font-bold text-sm">
                            {index + 1}
                        </div>

                        {/* Course info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">{course.title}</h3>
                            <p className="text-white/40 text-sm truncate">{course.description}</p>
                        </div>

                        {/* Start link */}
                        {onStartCourse && (
                            <button
                                onClick={() => onStartCourse(course)}
                                className="flex-shrink-0 text-[#0ea5e9] text-sm hover:underline"
                            >
                                Start →
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
