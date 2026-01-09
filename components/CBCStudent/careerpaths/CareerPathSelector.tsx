"use client";

import { useState } from 'react';
import { POPULAR_CAREERS } from '@/types/careerPath';

interface CareerPathSelectorProps {
    onSelect: (careerTitle: string) => void;
    isGenerating: boolean;
}

export default function CareerPathSelector({ onSelect, isGenerating }: CareerPathSelectorProps) {
    const [customCareer, setCustomCareer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customCareer.trim() || isGenerating) return;
        onSelect(customCareer.trim());
    };

    const handleQuickSelect = (career: string) => {
        if (isGenerating) return;
        onSelect(career);
    };

    // Group careers by category
    const categories = POPULAR_CAREERS.reduce((acc, career) => {
        if (!acc[career.category]) {
            acc[career.category] = [];
        }
        acc[career.category].push(career);
        return acc;
    }, {} as Record<string, typeof POPULAR_CAREERS>);

    return (
        <div className="max-w-5xl mx-auto pt-6 sm:pt-10 px-4">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                    Choose Your Career Path
                </h1>
                <p className="text-white/50 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Select a career or enter your own. We&apos;ll create a personalized learning journey with all the courses you need.
                </p>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleSubmit} className="mb-10 sm:mb-14">
                <div className="relative max-w-2xl mx-auto group">
                    <input
                        type="text"
                        value={customCareer}
                        onChange={(e) => setCustomCareer(e.target.value)}
                        placeholder="Enter any career..."
                        className="w-full px-5 py-4 bg-[#0b0f12] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#0ea5e9]/50 text-base sm:text-lg pr-4 sm:pr-40 transition-all focus:bg-[#0d1317]"
                        disabled={isGenerating}
                    />
                    <button
                        type="submit"
                        disabled={!customCareer.trim() || isGenerating}
                        className="mt-3 sm:mt-0 sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-auto px-6 py-3 bg-[#0ea5e9] text-white rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0ea5e9]/90 active:scale-95 transition-all shadow-lg shadow-[#0ea5e9]/20"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Path'}
                    </button>
                </div>
            </form>

            {/* Divider */}
            <div className="relative my-10 sm:my-14">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-6 bg-[#060809] text-white/30 text-xs sm:text-sm font-medium uppercase tracking-widest">or choose a popular career</span>
                </div>
            </div>

            {/* Career Cards by Category */}
            <div className="space-y-12 pb-12 sm:pb-20">
                {Object.entries(categories).map(([category, careers]) => (
                    <div key={category}>
                        <h3 className="text-white/30 text-xs font-bold mb-5 uppercase tracking-[0.2em] px-1">{category}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {careers.map((career) => (
                                <button
                                    key={career.id}
                                    onClick={() => handleQuickSelect(career.title)}
                                    disabled={isGenerating}
                                    className="group p-5 bg-[#0b0f12]/50 border border-white/5 rounded-2xl text-left hover:border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                                >
                                    <div className="flex flex-col h-full">
                                        <h4 className="text-white font-semibold group-hover:text-[#0ea5e9] transition-colors mb-2 text-base sm:text-lg">
                                            {career.title}
                                        </h4>
                                        <p className="text-white/40 text-sm line-clamp-2 leading-relaxed">
                                            {career.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
