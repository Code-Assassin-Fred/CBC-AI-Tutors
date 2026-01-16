"use client";

import { useEffect, useState } from 'react';
import { useCustomTextbooks } from '@/lib/context/CustomTextbooksContext';
import CustomTextbookCard from './CustomTextbookCard';

const GRADE_OPTIONS = [
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12',
];

export default function CustomTextbooksPage() {
    const {
        textbooks,
        isLoadingTextbooks,
        loadTextbooks,
        isGenerating,
        generationProgress,
        generationError,
        generateTextbook,
        selectedTextbook,
        setSelectedTextbook,
        deleteTextbook,
    } = useCustomTextbooks();

    const [topic, setTopic] = useState('');
    const [audienceAge, setAudienceAge] = useState(GRADE_OPTIONS[0]);
    const [specifications, setSpecifications] = useState('');
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        loadTextbooks();
    }, [loadTextbooks]);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        const textbook = await generateTextbook(topic.trim(), audienceAge, specifications.trim() || undefined);
        if (textbook) {
            setTopic('');
            setSpecifications('');
        }
    };

    const handleDelete = async (textbookId: string) => {
        if (confirm('Are you sure you want to delete this textbook?')) {
            await deleteTextbook(textbookId);
        }
    };

    // If a textbook is selected, show the inline viewer
    if (selectedTextbook) {
        const { content } = selectedTextbook;
        return (
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Bar */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-4">
                    <button
                        onClick={() => setSelectedTextbook(null)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white truncate">{selectedTextbook.title}</h1>
                        <div className="flex items-center gap-3 text-sm text-white/50">
                            {selectedTextbook.estimatedReadingTime && (
                                <span>{selectedTextbook.estimatedReadingTime}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area - Inline Viewer */}
                {/* Content Area - Inline Viewer */}
                <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto space-y-10">
                    {/* Introduction */}
                    {content?.introduction && (
                        <section>
                            <h3 className="text-2xl font-bold text-white mb-4">Introduction</h3>
                            <p className="text-white/85 leading-relaxed text-lg">{content.introduction}</p>
                        </section>
                    )}

                    {/* Learning Objectives */}
                    {content?.learningObjectives && content.learningObjectives.length > 0 && (
                        <section className="my-8">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">Learning Objectives</h3>
                            <ul className="space-y-3">
                                {content.learningObjectives.map((objective, index) => (
                                    <li key={index} className="flex items-start gap-3 text-white/85 text-lg">
                                        <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        {objective}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Chapters */}
                    {content?.chapters && content.chapters.length > 0 && (
                        <div className="space-y-12">
                            {content.chapters.map((chapter, index) => (
                                <section key={index} className="border-t border-white/10 pt-8 first:border-0 first:pt-0">
                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <span className="text-cyan-400">{index + 1}.</span>
                                        {chapter.title}
                                    </h2>
                                    <div className="text-white/85 leading-relaxed text-lg space-y-4 whitespace-pre-wrap">
                                        {chapter.content}
                                    </div>

                                    {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                                        <div className="mt-6 mb-8 pl-0">
                                            <h4 className="text-cyan-400 font-semibold mb-3">Key Points</h4>
                                            <ul className="space-y-2">
                                                {chapter.keyPoints.map((point, i) => (
                                                    <li key={i} className="text-white/80">
                                                        • {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {chapter.exercises && chapter.exercises.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="text-lg font-semibold text-white/90 mb-4">Exercises</h4>
                                            <div className="space-y-4 pl-0">
                                                {chapter.exercises.map((exercise, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-white/80">
                                                        <span className="font-bold text-white/40">{i + 1}.</span>
                                                        <p>{exercise.question}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    )}

                    {/* Practice Questions */}
                    {content?.practiceQuestions && content.practiceQuestions.length > 0 && (
                        <section className="border-t border-white/10 pt-8">
                            <h3 className="text-xl font-bold text-cyan-400 mb-6">Practice Questions</h3>
                            <div className="space-y-6">
                                {content.practiceQuestions.map((pq, index) => (
                                    <div key={index} className="pl-0">
                                        <p className="text-white/90 font-medium mb-2 text-lg">
                                            <span className="text-cyan-400 mr-2">Q{index + 1}.</span>
                                            {pq.question}
                                        </p>
                                        {pq.answer && (
                                            <p className="text-white/60 text-base pl-8 mt-2">
                                                <span className="text-emerald-400 font-medium text-xs uppercase tracking-wider mr-2">Answer</span>
                                                {pq.answer}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Summary */}
                    {content?.summary && (
                        <section className="border-t border-white/10 pt-8">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">Summary</h3>
                            <div className="text-white/85 leading-relaxed text-lg">
                                {content.summary}
                            </div>
                        </section>
                    )}

                    {/* Glossary */}
                    {content?.glossary && content.glossary.length > 0 && (
                        <section className="border-t border-white/10 pt-8 pb-12">
                            <h3 className="text-xl font-bold text-cyan-400 mb-6">Glossary</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {content.glossary.map((item, index) => (
                                    <div key={index}>
                                        <dt className="text-white font-semibold mb-1">{item.term}</dt>
                                        <dd className="text-white/60 text-sm leading-relaxed">{item.definition}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    )}
                </div>
            </div>
        );
    }

    // Default view: Form + Textbook List
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Collapsible Form Section */}
            <div className={`border-b border-white/10 transition-all ${showForm ? 'p-6' : 'p-3'}`}>
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
                    <span className="text-sm font-medium">Create New Textbook</span>
                </button>

                {showForm && (
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Topic Input */}
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2">Topic *</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., The Solar System, Introduction to Fractions"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Audience Age */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Target Audience *</label>
                                <select
                                    value={audienceAge}
                                    onChange={(e) => setAudienceAge(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                    disabled={isGenerating}
                                >
                                    {GRADE_OPTIONS.map((grade) => (
                                        <option key={grade} value={grade}>{grade}</option>
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
                                    placeholder="e.g., Include diagrams, focus on practical examples"
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Generate Textbook
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

            {/* Textbooks List */}
            <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-lg font-semibold text-cyan-400 mb-4">
                    Your Textbooks {textbooks.length > 0 && `(${textbooks.length})`}
                </h2>

                {isLoadingTextbooks ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="w-8 h-8 animate-spin text-white/40" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : textbooks.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p>No textbooks yet. Create your first custom textbook above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {textbooks.map((textbook) => (
                            <CustomTextbookCard
                                key={textbook.id}
                                textbook={textbook}
                                onClick={() => setSelectedTextbook(textbook)}
                                onDelete={() => handleDelete(textbook.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
