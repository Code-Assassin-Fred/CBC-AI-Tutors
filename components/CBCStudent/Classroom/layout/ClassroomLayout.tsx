"use client";

import React, { useMemo, useState } from "react";
import LessonCanvas from "@/components/CBCStudent/Classroom/main/LessonCanvas";
import TutorPanel from "@/components/CBCStudent/Classroom/tutor/TutorPanel";
import TOCIcon from "@/components/CBCStudent/Classroom/main/tocicon";
import { TocItem } from "@/components/CBCStudent/Classroom/main/StudentTextbookRenderer";
import { TutorProvider } from "@/lib/context/TutorContext";

export default function ClassroomLayout() {
  const [view, setView] = useState<"both" | "left" | "right">("both");
  const [contentMode, setContentMode] = useState<"lesson" | "saved">("lesson");

  // Mobile panel state: 'default' = 80:20 (main large), 'tutorExpanded' = 20:80 (tutor large)
  const [mobilePanelState, setMobilePanelState] = useState<"default" | "tutorExpanded">("default");

  // New state to hold TOC from LessonCanvas / StudentTextbookRenderer
  const [toc, setToc] = useState<TocItem[]>([]);

  // Desktop: horizontal layout classes
  const leftClasses = useMemo(() => {
    const base =
      "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0";
    const width =
      view === "left" ? "w-full" : view === "both" ? "w-[60%]" : "w-0";
    const border = view === "right" ? "" : "border-r border-white/10";
    return `${base} ${width} ${border}`;
  }, [view]);

  const rightClasses = useMemo(() => {
    const base =
      "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0 bg-transparent";
    const width =
      view === "right" ? "w-full" : view === "both" ? "w-[40%]" : "w-0";
    return `${base} ${width}`;
  }, [view]);

  // Mobile panel heights
  const mainPanelHeight = mobilePanelState === "default" ? "h-[80%]" : "h-[20%]";
  const tutorPanelHeight = mobilePanelState === "default" ? "h-[20%]" : "h-[80%]";

  return (
    <TutorProvider>
      <div className="relative flex flex-col h-[85vh] md:h-[87vh] lg:h-[90vh] w-full bg-[#0a0f14]/80 backdrop-blur-sm text-white overflow-hidden rounded-2xl shadow-xl shadow-black/40 border border-white/10">
        {/* Top controls - hidden on mobile since layout is fixed */}
        <div className="hidden sm:flex items-center justify-center gap-2 p-3 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "left"
                ? "bg-[#228B22] hover:bg-[#1a6b1a]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setView("left")}
            >
              Main Only
            </button>

            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "both"
                ? "bg-[#228B22] hover:bg-[#1a6b1a]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setView("both")}
            >
              Split View
            </button>

            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "right"
                ? "bg-[#228B22] hover:bg-[#1a6b1a]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setView("right")}
            >
              Tutor Only
            </button>
          </div>
        </div>

        {/* Mobile layout: Vertical stack with toggle controls */}
        <div className="flex flex-col flex-1 overflow-hidden sm:hidden p-2 gap-2">
          {/* Main Panel Card */}
          <div className={`${mainPanelHeight} overflow-hidden relative rounded-xl bg-[#0b0f12] border border-white/10 transition-all duration-300`}>
            <div className="h-full overflow-y-auto scrollbar-hide">
              {contentMode === "lesson" ? (
                <LessonCanvas onTocUpdate={setToc} />
              ) : (
                <div className="h-full flex items-center justify-center text-white/40">
                  <p>Saved Lessons coming soon...</p>
                </div>
              )}
            </div>
            {/* TOC Button */}
            <TOCIcon toc={toc} />

            {/* Minimize/Maximize button for Main - bottom right */}
            <button
              onClick={() => setMobilePanelState(mobilePanelState === "default" ? "tutorExpanded" : "default")}
              className="absolute bottom-1 right-2 z-20 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
              title={mobilePanelState === "default" ? "Minimize" : "Maximize"}
            >
              {mobilePanelState === "default" ? (
                <>
                  <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-[10px] text-white/60">Min</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-[10px] text-white/60">Max</span>
                </>
              )}
            </button>
          </div>

          {/* Tutor Panel Card */}
          <div className={`${tutorPanelHeight} overflow-hidden relative rounded-xl bg-[#0b0f12] border border-white/10 transition-all duration-300`}>
            {/* Maximize/Minimize button for Tutor - top right */}
            <button
              onClick={() => setMobilePanelState(mobilePanelState === "default" ? "tutorExpanded" : "default")}
              className="absolute top-1 right-2 z-20 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
              title={mobilePanelState === "tutorExpanded" ? "Minimize" : "Maximize"}
            >
              {mobilePanelState === "tutorExpanded" ? (
                <>
                  <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="text-[10px] text-white/60">Min</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-[10px] text-white/60">Max</span>
                </>
              )}
            </button>

            <div className="h-full p-3 pt-8 overflow-y-auto">
              <TutorPanel />
            </div>
          </div>
        </div>

        {/* Desktop layout: Horizontal split (existing behavior) */}
        <div className="hidden sm:flex flex-1 overflow-hidden">
          {/* LEFT PANEL – Lesson Canvas */}
          <div className={leftClasses}>
            <div className="h-full overflow-y-auto scrollbar-hide">
              <div
                className={
                  (view === "right"
                    ? "opacity-0 pointer-events-none select-none"
                    : "opacity-100") + " h-full"
                }
              >
                {contentMode === "lesson" ? (
                  <LessonCanvas onTocUpdate={setToc} />
                ) : (
                  <div className="h-full flex items-center justify-center text-white/40">
                    <p>Saved Lessons coming soon...</p>
                  </div>
                )}
              </div>
            </div>

            {/* TOC Button - Now inside left panel */}
            <TOCIcon toc={toc} />
          </div>

          {/* RIGHT PANEL – AI Tutor */}
          <div className={rightClasses}>
            {view !== "right" && view !== "left" && (
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10"></div>
            )}

            <div className="h-full p-6 overflow-hidden">
              <div
                className={
                  (view === "left"
                    ? "opacity-0 pointer-events-none select-none"
                    : "opacity-100") +
                  " h-full flex flex-col min-h-0"
                }
              >
                <TutorPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TutorProvider>
  );
}
