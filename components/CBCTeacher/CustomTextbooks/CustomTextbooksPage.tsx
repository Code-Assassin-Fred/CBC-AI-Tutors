"use client";

import { useEffect, useState } from 'react';
import { useCustomTextbooks } from '@/lib/context/CustomTextbooksContext';
import CustomTextbookCard from './CustomTextbookCard';
import CustomTextbookViewer from './CustomTextbookViewer';

const AGE_OPTIONS = [
    '5-7 years (Early Primary)',
    '8-10 years (Middle Primary)',
    '11-13 years (Upper Primary)',
    '14-16 years (Junior Secondary)',
    '17-18 years (Senior Secondary)',
    'Adults (18+)',
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
    const [audienceAge, setAudienceAge] = useState(AGE_OPTIONS[1]);
    const [specifications, setSpecifications] = useState('');

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

    return (
        <div className="flex flex-col p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Custom Textbooks</h1>
                <p className="text-white/60">
                    Create custom textbooks for any topic. These are not affiliated with the curriculum.
                </p>
            </div>

            {/* Input Form */}
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 mb-6">
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
                            {AGE_OPTIONS.map((age) => (
                                <option key={age} value={age}>{age}</option>
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

            {/* Textbooks Grid */}
            <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-4">
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

            {/* Textbook Viewer Modal */}
            {selectedTextbook && (
                <CustomTextbookViewer
                    textbook={selectedTextbook}
                    onClose={() => setSelectedTextbook(null)}
                />
            )}
        </div>
    );
}
