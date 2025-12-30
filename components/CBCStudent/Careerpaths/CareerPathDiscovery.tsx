'use client';

import React, { useState } from 'react';
import DirectGoalInput from './DirectGoalInput';
import CareerChat from './CareerChat';
import { useCareer } from '@/lib/context/CareerContext';

export default function CareerPathDiscovery() {
    const { activeCareerPath } = useCareer();
    const [mode, setMode] = useState<'selection' | 'chat'>('selection');

    // If a path is already active, we shouldn't show discovery (or show it in a minimized way)
    // For now, let's assume if there's no active path, we show this discovery UI.
    if (activeCareerPath) {
        return (
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <h2 className="text-2xl font-bold text-white mb-4">Current Path: {activeCareerPath.title}</h2>
                {/* Placeholder for detailed view */}
                <p className="text-white/60">Detailed view coming soon...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 pt-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Discover Your Future</h1>
                <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    Explore career paths tailored to your skills and interests. Choose how you want to start.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Mode 1: Direct Input */}
                <div className="bg-[#0b0f12] border border-white/10 rounded-2xl p-8 hover:border-[#0ea5e9]/50 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-xl flex items-center justify-center mb-6 text-[#0ea5e9]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2">I know what I want</h3>
                        <p className="text-white/50 mb-6">
                            Already have a career in mind? Enter it directly and we&apos;ll build your roadmap.
                        </p>

                        <DirectGoalInput />
                    </div>
                </div>

                {/* Mode 2: Chat Discovery */}
                <div className="bg-[#0b0f12] border border-white/10 rounded-2xl p-8 hover:border-[#8b5cf6]/50 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-xl flex items-center justify-center mb-6 text-[#8b5cf6]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2">Help me decide</h3>
                        <p className="text-white/50 mb-6">
                            Not sure yet? Chat with our AI career counselor to discover paths that match your interests.
                        </p>

                        <button
                            onClick={() => setMode('chat')}
                            className="w-full py-3 px-4 bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium rounded-xl hover:bg-[#8b5cf6]/20 transition-colors flex items-center justify-center gap-2"
                        >
                            Start Conversation
                        </button>
                    </div>
                </div>
            </div>

            {mode === 'chat' && (
                <CareerChat onClose={() => setMode('selection')} />
            )}
        </div>
    );
}
