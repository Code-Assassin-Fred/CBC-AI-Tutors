"use client";

import React from 'react';

export default function TutorHeader() {
  return (
    <div className="border-b border-white/10 pb-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#7c3aed] flex items-center justify-center text-white font-bold text-lg shadow-lg/10">
            AI
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#111113]"></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Your AI Tutor</h2>
          <p className="text-xs text-white/50">Online • Ready to help</p>
        </div>
      </div>
    </div>
  );
}
