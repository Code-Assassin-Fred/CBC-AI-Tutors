"use client";

import { CustomLesson } from '@/types/customLesson';

interface CustomLessonViewerProps {
    lesson: CustomLesson;
    onClose: () => void;
}

export default function CustomLessonViewer({ lesson, onClose }: CustomLessonViewerProps) {
    const { content } = lesson;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                            <span>{lesson.audienceAge}</span>
                            {lesson.estimatedDuration && (
                                <span>• {lesson.estimatedDuration}</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Introduction */}
                    {content?.introduction && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Introduction</h3>
                            <p className="text-white/80 leading-relaxed">{content.introduction}</p>
                        </section>
                    )}

                    {/* Sections */}
                    {content?.sections && content.sections.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Lesson Content</h3>
                            <div className="space-y-6">
                                {content.sections.map((section, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-4">
                                        <h4 className="text-white font-medium mb-2">{section.title}</h4>
                                        <p className="text-white/70 mb-3">{section.content}</p>
                                        {section.keyPoints && section.keyPoints.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-white/50 text-sm mb-2">Key Points:</p>
                                                <ul className="space-y-1">
                                                    {section.keyPoints.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                                                            <span className="text-cyan-400 mt-1">•</span>
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Examples */}
                    {content?.examples && content.examples.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Examples</h3>
                            <div className="space-y-4">
                                {content.examples.map((example, index) => (
                                    <div key={index} className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
                                        <h4 className="text-white font-medium mb-2">{example.title}</h4>
                                        <p className="text-white/70 text-sm mb-2">{example.description}</p>
                                        {example.explanation && (
                                            <p className="text-white/60 text-sm italic">{example.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Activities */}
                    {content?.activities && content.activities.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Activities</h3>
                            <div className="space-y-4">
                                {content.activities.map((activity, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-white font-medium">{activity.title}</h4>
                                            {activity.duration && (
                                                <span className="text-white/40 text-sm">{activity.duration}</span>
                                            )}
                                        </div>
                                        <p className="text-white/70 text-sm">{activity.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Summary */}
                    {content?.summary && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Summary</h3>
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                                <p className="text-white/80 leading-relaxed">{content.summary}</p>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
