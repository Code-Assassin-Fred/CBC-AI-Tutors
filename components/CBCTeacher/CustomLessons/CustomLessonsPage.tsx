"use client";

import { useEffect, useState } from 'react';
import { useCustomLessons } from '@/lib/context/CustomLessonsContext';
import CustomLessonCard from './CustomLessonCard';
import CustomLessonViewer from './CustomLessonViewer';
import { GRADE_SECTIONS } from '@/lib/utils/grade-hierarchy';

const GRADE_OPTIONS = GRADE_SECTIONS.flatMap(s => s.grades.map(g => `Grade ${g}`));

export default function CustomLessonsPage() {
    const {
        lessons,
        isLoadingLessons,
        loadLessons,
        isGenerating,
        generationProgress,
        generationError,
        generateLesson,
        selectedLesson,
        setSelectedLesson,
        deleteLesson,
    } = useCustomLessons();

    const [topic, setTopic] = useState('');
    const [audienceAge, setAudienceAge] = useState(GRADE_OPTIONS[0]); // Default to first grade
    const [specifications, setSpecifications] = useState('');
    const [isFormCollapsed, setIsFormCollapsed] = useState(false);

    useEffect(() => {
        loadLessons();
    }, [loadLessons]);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        const lesson = await generateLesson(topic.trim(), audienceAge, specifications.trim() || undefined);
        if (lesson) {
            setTopic('');
            setSpecifications('');
            setIsFormCollapsed(true); // Auto-collapse after generation
        }
    };

    const handleDelete = async (lessonId: string) => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            await deleteLesson(lessonId);
            if (selectedLesson?.id === lessonId) {
                setSelectedLesson(null);
            }
        }
    };

    return (
        <div className="flex flex-col p-6 min-h-screen">
            {/* Collapsible Generation Form */}
            <div className="mb-8">
                <button
                    onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm font-medium"
                >
                    <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isFormCollapsed ? '-rotate-90' : 'rotate-0'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {isFormCollapsed ? 'Show Generator' : 'Hide Generator'}
                </button>

                {!isFormCollapsed && (
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 transition-all duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Topic Input */}
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2">Topic *</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Introduction to Photosynthesis"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Audience Grade - previously Age */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Target Grade *</label>
                                <select
                                    value={audienceAge}
                                    onChange={(e) => setAudienceAge(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    disabled={isGenerating}
                                >
                                    {GRADE_SECTIONS.map((section) => (
                                        <optgroup key={section.label} label={section.label}>
                                            {section.grades.map((g) => (
                                                <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Specifications */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Specifications (optional)</label>
                                <input
                                    type="text"
                                    value={specifications}
                                    onChange={(e) => setSpecifications(e.target.value)}
                                    placeholder="e.g., Focus on hands-on activities"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={!topic.trim() || isGenerating}
                                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${!topic.trim() || isGenerating
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Generate Lesson
                                    </>
                                )}
                            </button>

                            {/* Progress */}
                            {isGenerating && generationProgress && (
                                <div className="flex-1">
                                    <div className="text-white/60 text-sm mb-1">{generationProgress.message}</div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                            style={{ width: `${generationProgress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {generationError && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {generationError}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {!selectedLesson ? (
                    // Lessons List View
                    <>
                        <h2 className="text-lg font-semibold text-cyan-400 mb-6">
                            Your Lessons {lessons.length > 0 && `(${lessons.length})`}
                        </h2>

                        {isLoadingLessons ? (
                            <div className="flex items-center justify-center py-12">
                                <svg className="w-8 h-8 animate-spin text-white/40" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </div>
                        ) : lessons.length === 0 ? (
                            <div className="text-center py-12 text-white/40">
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p>No lessons yet. Create your first custom lesson above!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lessons.map((lesson) => (
                                    <CustomLessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        onClick={() => {
                                            setSelectedLesson(lesson);
                                            setIsFormCollapsed(true); // Auto collapse when viewing
                                        }}
                                        onDelete={() => handleDelete(lesson.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // Inline Lesson Viewer
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Inline Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setSelectedLesson(null)}
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                            >
                                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedLesson.title}</h2>
                                <p className="text-white/40 text-sm mt-1">{selectedLesson.topic}</p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto px-4 max-w-5xl mx-auto w-full space-y-12 pb-20">
                            {/* Introduction */}
                            {selectedLesson.content?.introduction && (
                                <section>
                                    <h3 className="text-2xl font-bold text-white mb-4">Introduction</h3>
                                    <p className="text-white/85 leading-relaxed text-lg">{selectedLesson.content.introduction}</p>
                                </section>
                            )}

                            {/* Sections */}
                            {selectedLesson.content?.sections && selectedLesson.content.sections.length > 0 && (
                                <div className="space-y-12">
                                    {selectedLesson.content.sections.map((section, index) => (
                                        <section key={index} className="border-t border-white/10 pt-8 first:border-0 first:pt-0">
                                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                                <span className="text-cyan-400">{index + 1}.</span>
                                                {section.title}
                                            </h3>
                                            <p className="text-white/85 leading-relaxed text-lg whitespace-pre-wrap mb-6">
                                                {section.content}
                                            </p>

                                            {section.keyPoints && section.keyPoints.length > 0 && (
                                                <div className="mt-6 pl-0">
                                                    <h4 className="text-cyan-400 font-semibold mb-3">Key Points</h4>
                                                    <ul className="space-y-2">
                                                        {section.keyPoints.map((point, i) => (
                                                            <li key={i} className="text-white/80 flex items-start gap-2">
                                                                <span className="text-cyan-400 mt-1">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </section>
                                    ))}
                                </div>
                            )}

                            {/* Examples */}
                            {selectedLesson.content?.examples && selectedLesson.content.examples.length > 0 && (
                                <section className="border-t border-white/10 pt-8">
                                    <h3 className="text-xl font-bold text-cyan-400 mb-6">Examples</h3>
                                    <div className="space-y-8">
                                        {selectedLesson.content.examples.map((example, index) => (
                                            <div key={index} className="pl-0">
                                                <h4 className="text-lg font-bold text-white mb-2">{example.title}</h4>
                                                <p className="text-white/85 text-lg mb-2">{example.description}</p>
                                                {example.explanation && (
                                                    <p className="text-white/60 italic">{example.explanation}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Activities */}
                            {selectedLesson.content?.activities && selectedLesson.content.activities.length > 0 && (
                                <section className="border-t border-white/10 pt-8">
                                    <h3 className="text-xl font-bold text-cyan-400 mb-6">Activities</h3>
                                    <div className="space-y-8">
                                        {selectedLesson.content.activities.map((activity, index) => (
                                            <div key={index} className="pl-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-lg font-bold text-white">{activity.title}</h4>
                                                    {activity.duration && (
                                                        <span className="text-white/40 text-sm">{activity.duration}</span>
                                                    )}
                                                </div>
                                                <p className="text-white/85 text-lg">{activity.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Summary */}
                            {selectedLesson.content?.summary && (
                                <section className="border-t border-white/10 pt-8">
                                    <h3 className="text-xl font-bold text-cyan-400 mb-4">Summary</h3>
                                    <div className="text-white/85 leading-relaxed text-lg">
                                        {selectedLesson.content.summary}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
