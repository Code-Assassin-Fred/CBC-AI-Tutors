"use client";

import React from 'react';

export default function IdleState() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest max-w-xs leading-relaxed">
                Select a substrand on the left canvas to begin a guided session.
            </p>

            <div className="mt-8 flex flex-col gap-3">
                <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">Available Interactivities</div>
                <div className="flex flex-wrap justify-center gap-2">
                    <div className="px-3 py-1.5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Interactive Reading</span>
                    </div>
                    <div className="px-3 py-1.5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Dialogue Podcast</span>
                    </div>
                    <div className="px-3 py-1.5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Immersive Teaching</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
