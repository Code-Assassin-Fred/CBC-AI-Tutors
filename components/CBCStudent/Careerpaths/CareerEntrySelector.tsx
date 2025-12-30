"use client";

import { useState } from 'react';
import { useCareer } from '@/lib/context/CareerContext';

export default function CareerEntrySelector() {
    const { generateCareer, setCurrentView } = useCareer();
    const [careerInput, setCareerInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const popularCareers = [
        'Software Engineer',
        'Data Scientist',
        'Product Manager',
        'UX Designer',
        'Machine Learning Engineer',
        'Cybersecurity Analyst',
        'Cloud Architect',
        'Full Stack Developer',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!careerInput.trim()) return;

        setIsSubmitting(true);
        await generateCareer(careerInput.trim());
        setIsSubmitting(false);
    };

    const handleQuickSelect = (career: string) => {
        setCareerInput(career);
    };

    return (
        <div className="max-w-3xl mx-auto pt-16 px-4">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
                    <svg className="w-8 h-8 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                    What career do you want to pursue?
                </h1>
                <p className="text-white/50 text-base">
                    Enter your dream career and we&apos;ll create a personalized path for you
                </p>
            </div>

            {/* Direct Input Mode */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="relative">
                    <input
                        type="text"
                        value={careerInput}
                        onChange={(e) => setCareerInput(e.target.value)}
                        placeholder="I want to become a..."
                        className="w-full px-5 py-4 bg-[#0b0f12] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50 text-lg"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={!careerInput.trim() || isSubmitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[#0ea5e9] text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0ea5e9]/90 transition-colors"
                    >
                        {isSubmitting ? 'Generating...' : 'Generate Path'}
                    </button>
                </div>
            </form>

            {/* Popular Careers */}
            <div className="mb-12">
                <p className="text-white/40 text-sm mb-3">Popular careers</p>
                <div className="flex flex-wrap gap-2">
                    {popularCareers.map((career) => (
                        <button
                            key={career}
                            onClick={() => handleQuickSelect(career)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm hover:bg-white/10 hover:text-white transition-colors"
                        >
                            {career}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-4 bg-[#060809] text-white/40 text-sm">or</span>
                </div>
            </div>

            {/* Discovery Chat Mode */}
            <button
                onClick={() => setCurrentView('discovery-chat')}
                className="w-full py-5 bg-[#0b0f12] border border-white/10 rounded-xl text-left px-6 hover:border-[#0ea5e9]/30 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium mb-1 group-hover:text-[#0ea5e9] transition-colors">
                            Not sure what career fits you?
                        </h3>
                        <p className="text-white/50 text-sm">
                            Chat with AI to discover careers based on your interests and strengths
                        </p>
                    </div>
                    <svg className="w-5 h-5 text-white/30 group-hover:text-[#0ea5e9] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </button>
        </div>
    );
}
