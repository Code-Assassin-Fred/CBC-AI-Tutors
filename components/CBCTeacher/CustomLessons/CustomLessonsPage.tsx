"use client";

import { useEffect, useState } from 'react';
import { useCustomLessons } from '@/lib/context/CustomLessonsContext';
import CustomLessonCard from './CustomLessonCard';
import LessonAgentProgressPanel from './LessonAgentProgressPanel';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { GRADE_SECTIONS } from '@/lib/utils/grade-hierarchy';

const GRADE_OPTIONS = GRADE_SECTIONS.flatMap(s => s.grades.map(g => `Grade ${g}`));

export default function CustomLessonsPage() {
    const {
        lessons,
        isLoadingLessons,
        loadLessons,
        isGenerating,
        generationError,
        generateLesson,
        selectedLesson,
        setSelectedLesson,
        deleteLesson,
        // Agent state
        currentAgent,
        agents,
        sections,
        activities,
        overallProgress,
        currentMessage,
    } = useCustomLessons();

    const [topic, setTopic] = useState('');
    const [audienceAge, setAudienceAge] = useState(GRADE_OPTIONS[0]);
    const [specifications, setSpecifications] = useState('');
    const [lessonTime, setLessonTime] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadLessons();
    }, [loadLessons]);

    const handleGenerate = async () => {
        if (!topic.trim() || !lessonTime.trim()) return;
        setShowSuccess(false);

        const lesson = await generateLesson(
            topic.trim(),
            audienceAge,
            specifications.trim() || undefined,
            lessonTime.trim() || undefined
        );

        if (lesson) {
            setTopic('');
            setSpecifications('');
            setLessonTime('');
            setShowSuccess(true);

            // Trigger confetti for a premium feel
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#3b82f6', '#10b981']
            });

            // Delay closing the form and panels to show success state
            setTimeout(() => {
                setShowSuccess(false);
                setShowForm(false);
            }, 5000);
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

    // If a lesson is selected, show the inline viewer
    if (selectedLesson) {
        return (
            <div className="flex flex-col min-h-full">
                {/* Header Bar */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex items-center gap-2 sm:gap-4 sticky top-0 z-10 backdrop-blur-md">
                    <button
                        onClick={() => setSelectedLesson(null)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm sm:text-lg font-bold text-white truncate">{selectedLesson.title}</h1>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto space-y-8 sm:space-y-12 pb-24 overflow-y-auto">
                    {/* Introduction */}
                    {selectedLesson.content?.introduction && (
                        <section>
                            <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-2 sm:mb-3 uppercase tracking-wide">Introduction</h3>
                            <div className="text-white/85 leading-[1.7] text-base sm:text-lg mb-6">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.7]">{children}</p>,
                                        strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
                                    }}
                                >
                                    {selectedLesson.content.introduction}
                                </ReactMarkdown>
                            </div>
                        </section>
                    )}

                    {/* Sections */}
                    {selectedLesson.content?.sections && selectedLesson.content.sections.length > 0 && (
                        <div className="space-y-12">
                            {selectedLesson.content.sections.map((section, index) => (
                                <section key={index} className="border-t border-white/10 pt-6 sm:pt-8 first:border-0 first:pt-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                                        <span>{index + 1}.</span>
                                        {section.title}
                                    </h3>
                                    <div className="text-white/85 leading-[1.7] text-base sm:text-lg mb-6">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.7]">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
                                            }}
                                        >
                                            {section.content}
                                        </ReactMarkdown>
                                    </div>

                                    {section.keyPoints && section.keyPoints.length > 0 && (
                                        <div className="mt-6 pl-0">
                                            <h4 className="text-white font-bold mb-3 uppercase text-sm tracking-wider">Key Points</h4>
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
                            <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-6 uppercase tracking-wide">Examples</h3>
                            <div className="space-y-8">
                                {selectedLesson.content.examples.map((example, index) => (
                                    <div key={index} className="pl-0">
                                        <h4 className="text-lg font-bold text-white mb-2">{example.title}</h4>
                                        <div className="text-white/85 text-lg mb-2 leading-[1.7]">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-[1.7]">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
                                                }}
                                            >
                                                {example.description}
                                            </ReactMarkdown>
                                        </div>
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
                            <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-6 uppercase tracking-wide">Activities</h3>
                            <div className="space-y-8">
                                {selectedLesson.content.activities.map((activity, index) => (
                                    <div key={index} className="pl-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-lg font-bold text-white">{activity.title}</h4>
                                            {activity.duration && (
                                                <span className="text-white/40 text-sm">{activity.duration}</span>
                                            )}
                                        </div>
                                        <div className="text-white/85 text-lg leading-[1.7]">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-[1.7]">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
                                                }}
                                            >
                                                {activity.description}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Summary */}
                    {selectedLesson.content?.summary && (
                        <section className="border-t border-white/10 pt-8">
                            <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-4 uppercase tracking-wide">Summary</h3>
                            <div className="text-white/85 leading-[1.7] text-lg">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.7]">{children}</p>,
                                        strong: ({ children }) => <strong className="font-bold text-white tracking-wide">{children}</strong>,
                                    }}
                                >
                                    {selectedLesson.content.summary}
                                </ReactMarkdown>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Collapsible Form Section */}
            <div className={`border-b border-white/10 transition-all ${showForm ? 'p-4 sm:p-6' : 'p-2 sm:p-3'}`}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${showForm ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium">Create New Lesson</span>
                </button>

                {showForm && (
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                            {/* Topic Input */}
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Topic *</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Photosynthesis"
                                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Audience Grade */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2 font-medium">Target Grade *</label>
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

                            {/* Lesson Time */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2 font-medium">Lesson Duration *</label>
                                <input
                                    type="text"
                                    value={lessonTime}
                                    onChange={(e) => setLessonTime(e.target.value)}
                                    placeholder="e.g., 40 mins, 1 hour"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Specifications */}
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2 font-medium">Specifications & Requirements (optional)</label>
                                <textarea
                                    value={specifications}
                                    onChange={(e) => setSpecifications(e.target.value)}
                                    placeholder="Examples:&#10;• Focus on hands-on practical activities&#10;• Use Kenyan local context and examples&#10;• Include 3 assessment questions"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all resize-none leading-relaxed text-sm"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                        {/* Generate Button Container */}
                        {!isGenerating && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!topic.trim() || !lessonTime.trim()}
                                    className={`px-8 sm:px-10 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${!topic.trim() || !lessonTime.trim()
                                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                        : 'bg-cyan-600 text-white hover:bg-cyan-500'
                                        }`}
                                >
                                    Generate Lesson
                                </button>
                            </div>
                        )}

                        {/* Agent Progress Panel */}
                        {(isGenerating || showSuccess) && (
                            <div className="mt-4">
                                {showSuccess && (
                                    <div className="mb-4 p-4 bg-transparent border border-emerald-500/50 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">🎉</span>
                                            <div>
                                                <p className="text-emerald-400 font-bold">Lesson Generated & Saved!</p>
                                                <p className="text-emerald-400/70 text-sm">Your new resource is now in your library.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <LessonAgentProgressPanel
                                    isGenerating={isGenerating}
                                    currentAgent={currentAgent}
                                    agents={agents}
                                    sections={sections}
                                    activities={activities}
                                    overallProgress={overallProgress}
                                    currentMessage={showSuccess ? "Lesson successfully added to library!" : currentMessage}
                                />
                            </div>
                        )}

                        {/* Error */}
                        {generationError && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {generationError}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="flex-1 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-cyan-400 mb-4 sm:mb-6 flex items-center justify-between">
                    Your Lessons
                    <span className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest">{lessons.length} Items</span>
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
                                    setShowForm(false);
                                }}
                                onDelete={() => handleDelete(lesson.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
