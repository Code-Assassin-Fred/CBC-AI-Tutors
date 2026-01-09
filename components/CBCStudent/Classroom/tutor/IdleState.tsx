"use client";

import React from 'react';

export default function IdleState() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {/* Mobile: say "above" */}
            <p className="sm:hidden text-xs text-white/70 uppercase tracking-widest max-w-xs leading-relaxed">
                Select a substrand above to begin a guided session.
            </p>
            {/* Desktop: say "left canvas" */}
            <p className="hidden sm:block text-xs text-white/70 uppercase tracking-widest max-w-xs leading-relaxed">
                Select a substrand on the left canvas to begin a guided session.
            </p>

            <div className="mt-8 flex flex-col gap-3">
                <div className="text-xs text-white/50 uppercase tracking-[0.2em] font-bold">Available Interactivities</div>
                <div className="flex flex-wrap justify-center gap-2">
                    <div className="px-3 py-1.5 border border-white/20 rounded">
                        <span className="text-xs text-white/70 uppercase tracking-widest font-bold">Interactive Reading</span>
                    </div>
                    <div className="px-3 py-1.5 border border-white/20 rounded">
                        <span className="text-xs text-white/70 uppercase tracking-widest font-bold">Dialogue Podcast</span>
                    </div>
                    <div className="px-3 py-1.5 border border-white/20 rounded">
                        <span className="text-xs text-white/70 uppercase tracking-widest font-bold">Immersive Teaching</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
