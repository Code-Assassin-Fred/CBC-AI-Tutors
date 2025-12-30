'use client';

import React, { useState } from 'react';
import { useCareer } from '@/lib/context/CareerContext';

export default function DirectGoalInput() {
    const [goal, setGoal] = useState('');
    const { generateCareerPath, isLoading } = useCareer();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim()) return;
        await generateCareerPath(goal);
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder='e.g., "Game Developer", "Data Scientist"'
                className="w-full bg-[#13171c] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={!goal.trim() || isLoading}
                className="absolute right-2 top-2 p-1.5 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                )}
            </button>
        </form>
    );
}
