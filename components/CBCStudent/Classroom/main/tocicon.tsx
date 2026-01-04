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

export default function TOCIcon({ toc }: TOCIconProps) {
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
        className="absolute bottom-6 left-6 bg-[#0ea5e9] text-white px-4 py-3 rounded-full shadow-xl hover:bg-[#0284c7] transition-all z-50"
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
            className="absolute bottom-0 left-0 w-1/2 max-h-[80%] bg-[#0c4a6e] rounded-t-2xl shadow-2xl border-t border-r border-sky-400/30 overflow-hidden transform transition-transform duration-300 ease-out"
            style={{
              animation: tocOpen ? 'slideUp 0.3s ease-out' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sky-400/20 bg-[#082f49]">
              <div className="flex items-center gap-3">
                <h2 className="text-3x1 font-bold text-white">Table of Contents</h2>
              </div>
              <button
                onClick={() => setTocOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* TOC List */}
            <nav className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] scrollbar-hide">
              <div className="space-y-2">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setTocOpen(false)}
                    className={`block text-white/80 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all ${getIndent(item.level)}`}
                  >
                    <span className={`${item.level === 2 ? 'font-semibold text-base' : item.level === 3 ? 'text-sm' : 'text-sm text-white/70'}`}>
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