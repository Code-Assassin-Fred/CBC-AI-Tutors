"use client";

import React from 'react';

export default function IdleState() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-3xl">📚</span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">
                Your AI Tutor
            </h3>

            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
                Select a substrand and click <span className="text-blue-400 font-medium">"Learn with AI"</span> to start your personalized lesson.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white/40">📖 Read</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white/40">🎧 Podcast</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white/40">🧠 Immersive</span>
                </div>
            </div>
        </div>
    );
}
