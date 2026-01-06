"use client";

import { CustomTextbook } from '@/types/customTextbook';

interface CustomTextbookViewerProps {
    textbook: CustomTextbook;
    onClose: () => void;
}

export default function CustomTextbookViewer({ textbook, onClose }: CustomTextbookViewerProps) {
    const { content } = textbook;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">{textbook.title}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                            <span>{textbook.audienceAge}</span>
                            {textbook.estimatedReadingTime && (
                                <span>• {textbook.estimatedReadingTime}</span>
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

                    {/* Learning Objectives */}
                    {content?.learningObjectives && content.learningObjectives.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Learning Objectives</h3>
                            <ul className="space-y-2">
                                {content.learningObjectives.map((objective, index) => (
                                    <li key={index} className="flex items-start gap-3 text-white/70">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        {objective}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Chapters */}
                    {content?.chapters && content.chapters.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Chapters</h3>
                            <div className="space-y-6">
                                {content.chapters.map((chapter, index) => (
                                    <div key={index} className="bg-white/5 rounded-xl p-5">
                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            {chapter.title}
                                        </h4>
                                        <p className="text-white/70 mb-4 leading-relaxed">{chapter.content}</p>

                                        {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <p className="text-white/50 text-sm mb-2 font-medium">Key Points:</p>
                                                <ul className="space-y-1">
                                                    {chapter.keyPoints.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                                                            <span className="text-cyan-400 mt-0.5">•</span>
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {chapter.exercises && chapter.exercises.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10">
                                                <p className="text-white/50 text-sm mb-2 font-medium">Exercises:</p>
                                                <ul className="space-y-2">
                                                    {chapter.exercises.map((exercise, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-white/60 text-sm bg-white/5 p-3 rounded-lg">
                                                            <span className="text-green-400 font-bold">{i + 1}.</span>
                                                            {exercise.question}
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

                    {/* Practice Questions */}
                    {content?.practiceQuestions && content.practiceQuestions.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Practice Questions</h3>
                            <div className="space-y-4">
                                {content.practiceQuestions.map((pq, index) => (
                                    <div key={index} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                                        <p className="text-white/80 mb-2">
                                            <span className="font-bold text-purple-400">Q{index + 1}:</span> {pq.question}
                                        </p>
                                        {pq.answer && (
                                            <p className="text-white/60 text-sm">
                                                <span className="font-medium text-green-400">Answer:</span> {pq.answer}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Summary */}
                    {content?.summary && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Summary</h3>
                            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
                                <p className="text-white/80 leading-relaxed">{content.summary}</p>
                            </div>
                        </section>
                    )}

                    {/* Glossary */}
                    {content?.glossary && content.glossary.length > 0 && (
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Glossary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {content.glossary.map((item, index) => (
                                    <div key={index} className="bg-white/5 rounded-lg p-3">
                                        <p className="text-white font-medium text-sm">{item.term}</p>
                                        <p className="text-white/60 text-sm">{item.definition}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
