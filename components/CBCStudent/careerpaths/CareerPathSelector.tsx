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
        <div className="max-w-5xl mx-auto pt-8 px-4">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-[#0ea5e9]/20 to-[#8b5cf6]/20 border border-white/10">
                    <svg className="w-8 h-8 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                    Choose Your Career Path
                </h1>
                <p className="text-white/50 text-base max-w-xl mx-auto">
                    Select a career or enter your own. We&apos;ll create a personalized learning journey with all the courses you need.
                </p>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleSubmit} className="mb-10">
                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        value={customCareer}
                        onChange={(e) => setCustomCareer(e.target.value)}
                        placeholder="Enter any career... (e.g., Blockchain Developer)"
                        className="w-full px-5 py-4 bg-[#0b0f12] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50 text-lg pr-36"
                        disabled={isGenerating}
                    />
                    <button
                        type="submit"
                        disabled={!customCareer.trim() || isGenerating}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Generating...
                            </span>
                        ) : (
                            'Generate Path'
                        )}
                    </button>
                </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 bg-[#060809] text-white/40 text-sm">or choose a popular career</span>
                </div>
            </div>

            {/* Career Cards by Category */}
            <div className="space-y-8 pb-10">
                {Object.entries(categories).map(([category, careers]) => (
                    <div key={category}>
                        <h3 className="text-white/40 text-sm font-medium mb-3 uppercase tracking-wider">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {careers.map((career) => (
                                <button
                                    key={career.id}
                                    onClick={() => handleQuickSelect(career.title)}
                                    disabled={isGenerating}
                                    className="group p-4 bg-[#0b0f12] border border-white/10 rounded-xl text-left hover:border-[#0ea5e9]/40 hover:bg-[#0ea5e9]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{career.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium group-hover:text-[#0ea5e9] transition-colors truncate">
                                                {career.title}
                                            </h4>
                                            <p className="text-white/40 text-sm mt-1 line-clamp-2">
                                                {career.description}
                                            </p>
                                        </div>
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
