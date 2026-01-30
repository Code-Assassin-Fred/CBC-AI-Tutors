"use client";

import { useEffect, useState } from 'react';
import { useCustomTextbooks } from '../../../lib/context/CustomTextbooksContext';
import CustomTextbookCard from './CustomTextbookCard';
import AgentProgressPanel from './AgentProgressPanel';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { GRADE_SECTIONS } from '@/lib/utils/grade-hierarchy';

const GRADE_OPTIONS = GRADE_SECTIONS.flatMap(s => s.grades.map(g => `Grade ${g}`));

const stripRedundantTitle = (content: string, title: string) => {
    if (!content) return '';
    // Escape special characters in title for regex
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Pattern to match common header formats at the very beginning
    // 1. # Title
    // 2. # Chapter 1: Title
    // 3. ## Title
    // 4. Chapter 1: Title
    // 5. **Title**
    const patterns = [
        new RegExp(`^\\s*#+\\s*(Chapter\\s*\\d+:?\\s*)?${escapedTitle}\\s*(\\n|$)`, 'i'),
        new RegExp(`^\\s*\\*\\*(Chapter\\s*\\d+:?\\s*)?${escapedTitle}\\*\\*\\s*(\\n|$)`, 'i'),
        new RegExp(`^\\s*(Chapter\\s*\\d+:?\\s*)${escapedTitle}\\s*(\\n|$)`, 'i'),
        new RegExp(`^\\s*Chapter\\s*\\d+:?\\s*${escapedTitle}\\s*(\\n|$)`, 'i'),
        new RegExp(`^\\s*#+\\s*Chapter\\s*\\d+[:\\s]*(\\n|$)`, 'i'), // Just "# Chapter 1"
    ];

    let cleanContent = content;
    let modified = true;
    while (modified) {
        modified = false;
        for (const pattern of patterns) {
            const newContent = cleanContent.replace(pattern, '');
            if (newContent !== cleanContent) {
                cleanContent = newContent;
                modified = true;
            }
        }
    }
    return cleanContent.trim();
};

export default function CustomTextbooksPage() {
    const {
        textbooks,
        isLoadingTextbooks,
        loadTextbooks,
        isGenerating,
        generationError,
        generateTextbook,
        selectedTextbook,
        setSelectedTextbook,
        deleteTextbook,
        // Agent state
        currentAgent,
        agents,
        chapters,
        images,
        overallProgress,
        currentMessage,
    } = useCustomTextbooks();

    const [topic, setTopic] = useState('');
    const [audienceAge, setAudienceAge] = useState(GRADE_OPTIONS[0]);
    const [specifications, setSpecifications] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadTextbooks();
    }, [loadTextbooks]);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setShowSuccess(false);

        const textbook = await generateTextbook(topic.trim(), audienceAge, specifications.trim() || undefined);
        if (textbook) {
            setTopic('');
            setSpecifications('');
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

    const handleDelete = async (textbookId: string) => {
        if (confirm('Are you sure you want to delete this textbook?')) {
            await deleteTextbook(textbookId);
        }
    };

    // If a textbook is selected, show the inline viewer
    if (selectedTextbook) {
        const { content } = selectedTextbook;
        return (
            <div className="flex flex-col min-h-full">
                {/* Header Bar */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex items-center gap-2 sm:gap-4 sticky top-0 z-10 backdrop-blur-md">
                    <button
                        onClick={() => setSelectedTextbook(null)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm sm:text-lg font-bold text-white truncate">{selectedTextbook.title}</h1>
                    </div>
                </div>

                {/* Content Area - Inline Viewer */}
                <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto space-y-8 sm:space-y-10">
                    {/* Introduction */}
                    {content?.introduction && (
                        <section>
                            <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-2 sm:mb-3 uppercase tracking-wide">Introduction</h3>
                            <p className="text-white/85 leading-relaxed text-base sm:text-lg">{content.introduction}</p>
                        </section>
                    )}

                    {/* Learning Objectives */}
                    {content?.learningObjectives && content.learningObjectives.length > 0 && (
                        <section className="my-6 sm:my-8">
                            <h3 className="text-lg sm:text-xl font-bold text-sky-400 mb-3 sm:mb-4 uppercase tracking-wide">Learning Objectives</h3>
                            <ul className="space-y-2 sm:space-y-3">
                                {content.learningObjectives.map((objective: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 sm:gap-3 text-white/85 text-base sm:text-lg">
                                        <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                        {objective}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Chapters */}
                    {content?.chapters && content.chapters.length > 0 && (
                        <div className="space-y-8 sm:space-y-12">
                            {content.chapters.map((chapter: any, index: number) => (
                                <section key={index} className="border-t border-white/10 pt-6 sm:pt-8 first:border-0 first:pt-0">
                                    <h2 className="text-lg sm:text-xl font-bold text-sky-400 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                                        <span>{index + 1}.</span>
                                        {chapter.title}
                                    </h2>

                                    {/* Chapter Image */}
                                    {(chapter as any).imageUrl && (
                                        <div className="mb-6 rounded-xl overflow-hidden border border-white/10 w-fit max-w-full bg-white/5">
                                            <img
                                                src={(chapter as any).imageUrl}
                                                alt={`Illustration for ${chapter.title}`}
                                                className="max-h-80 w-auto object-contain block"
                                            />
                                        </div>
                                    )}

                                    <div className="text-white/85 leading-relaxed text-base sm:text-lg space-y-4">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold text-sky-400 mt-8 mb-4">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-base sm:text-lg font-bold text-sky-400 mt-6 mb-3">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-lg font-bold text-white mt-4 mb-2">{children}</h3>,
                                                p: ({ children }) => <p className="mb-4 last:mb-0 leading-[1.7]">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                            }}
                                        >
                                            {stripRedundantTitle(chapter.content, chapter.title)}
                                        </ReactMarkdown>
                                    </div>

                                    {chapter.keyPoints && chapter.keyPoints.length > 0 && (
                                        <div className="mt-6 mb-8 pl-0">
                                            <h4 className="text-white font-bold mb-3 uppercase text-sm tracking-wider">Key Points</h4>
                                            <ul className="space-y-2">
                                                {chapter.keyPoints.map((point: string, i: number) => (
                                                    <li key={i} className="text-white/80">
                                                        • {point}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {chapter.exercises && chapter.exercises.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="text-lg font-bold text-white mb-4">Exercises</h4>
                                            <div className="space-y-4 pl-0">
                                                {chapter.exercises.map((exercise: any, i: number) => (
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
                            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Practice Questions</h3>
                            <div className="space-y-6">
                                {content.practiceQuestions.map((pq: any, index: number) => (
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
                            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Glossary</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {content.glossary.map((item: any, index: number) => (
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
                    <span className="text-sm font-medium">Create New Textbook</span>
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
                                    placeholder="e.g., The Solar System"
                                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
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
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2 font-medium">Specifications & Requirements (optional)</label>
                                <textarea
                                    value={specifications}
                                    onChange={(e) => setSpecifications(e.target.value)}
                                    placeholder="Examples:&#10;• Include 5 practical experiments&#10;• Focus on Kenyan geography and local culture&#10;• Use simple, conversational English"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all resize-none leading-relaxed text-sm"
                                    disabled={isGenerating}
                                />
                                <p className="mt-2 text-[10px] text-white/30 italic">
                                    Tip: You can paste multiple paragraphs or requirements here.
                                </p>
                            </div>
                        </div>

                        {/* Generate Button - Hidden during generation */}
                        {!isGenerating && (
                            <div className="flex justify-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!topic.trim() || isGenerating}
                                    className={`px-8 sm:px-10 py-3 rounded-xl font-bold transition-all text-sm sm:text-base ${!topic.trim() || isGenerating
                                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                        : 'bg-cyan-600 text-white hover:bg-cyan-500'
                                        }`}
                                >
                                    Generate Textbook
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
                                                <p className="text-emerald-400 font-bold">Textbook Generated & Saved!</p>
                                                <p className="text-emerald-400/70 text-sm">Your new resource is now in your library.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <AgentProgressPanel
                                    isGenerating={isGenerating}
                                    currentAgent={currentAgent}
                                    agents={agents}
                                    chapters={chapters}
                                    images={images}
                                    overallProgress={overallProgress}
                                    currentMessage={showSuccess ? "Textbook successfully added to library!" : currentMessage}
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

            {/* Textbooks List */}
            <div className="flex-1 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-cyan-400 mb-4 sm:mb-6 flex items-center justify-between">
                    Your Library
                    <span className="text-[10px] sm:text-xs font-medium text-white/30 uppercase tracking-widest">{textbooks.length} Items</span>
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
                        {textbooks.map((textbook: any) => (
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
