"use client";

import React, { useState } from "react";

interface TocItem {
    id: string;
    title: string;
    level: number;
}

interface TOCIconProps {
    toc: TocItem[];
}

export default function TeacherTOCIcon({ toc }: TOCIconProps) {
    const [tocOpen, setTocOpen] = useState(false);

    const getIndent = (level: number) => {
        if (level === 2) return "ml-0";
        if (level === 3) return "ml-6";
        if (level === 4) return "ml-12";
        return "ml-0";
    };

    if (!toc || toc.length === 0) return null;

    return (
        <>
            {/* Floating TOC Button - Bottom Left of Panel */}
            <button
                onClick={() => setTocOpen(true)}
                className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 bg-[#228B22] text-white px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-full shadow-xl hover:bg-[#1a6b1a] transition-all z-50"
            >
                TOC
            </button>

            {/* Slide-In TOC Overlay - Contained within panel */}
            {tocOpen && (
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
                    onClick={() => setTocOpen(false)}
                >
                    <div
                        className="absolute bottom-0 left-0 w-full sm:w-1/2 max-h-[80%] bg-[#0c4a4e] rounded-t-2xl shadow-2xl border-t border-x sm:border-r sm:border-l-0 border-emerald-400/30 overflow-hidden transform transition-transform duration-300 ease-out"
                        style={{
                            animation: tocOpen ? 'slideUp 0.3s ease-out' : 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-emerald-400/20 bg-[#083a3e]">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm sm:text-base font-bold text-white">Table of Contents</h2>
                            </div>
                            <button
                                onClick={() => setTocOpen(false)}
                                className="text-white/60 hover:text-white hover:bg-white/10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {/* TOC List */}
                        <nav className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-100px)] scrollbar-hide">
                            <div className="space-y-1 sm:space-y-2">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={() => setTocOpen(false)}
                                        className={`block text-white/80 hover:text-white hover:bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all ${getIndent(item.level)}`}
                                    >
                                        <span className={`${item.level === 2 ? 'font-semibold text-sm sm:text-base' : item.level === 3 ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm text-white/70'}`}>
                                            {item.title}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
        </>
    );
}
