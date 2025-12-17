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

  // New state to hold TOC from LessonCanvas / StudentTextbookRenderer
  const [toc, setToc] = useState<TocItem[]>([]);

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
      "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0 bg-gradient-to-br from-[#111113] to-[#1a1a1f]";
    const width =
      view === "right" ? "w-full" : view === "both" ? "w-[40%]" : "w-0";
    return `${base} ${width}`;
  }, [view]);

  return (
    <TutorProvider>
      <div className="relative flex flex-col h-[85vh] md:h-[87vh] lg:h-[90vh] w-full bg-[#0E0E10] text-white overflow-hidden rounded-2xl shadow-md shadow-black/20 border border-white/10">
        {/* Top controls */}
        <div className="flex items-center justify-between gap-2 p-2 border-b border-white/10 bg-[#0E0E10]">
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "left"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setView("left")}
            >
              Main Only
            </button>

            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "both"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setView("both")}
            >
              Split View
            </button>

            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "right"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setView("right")}
            >
              Tutor Only
            </button>
          </div>

          {/* We keep this for future "Saved Lessons" feature */}
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${contentMode === "lesson"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
                }`}
              onClick={() => setContentMode("lesson")}
            >
              Current Lesson
            </button>

            <button
              className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors opacity-50 cursor-not-allowed`}
              disabled
              title="Saved Lessons (Coming Soon)"
            >
              Saved Lessons
            </button>
          </div>
        </div>

        {/* Main layout area */}
        <div className="flex flex-1 overflow-hidden">
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
                  <LessonCanvas onTocUpdate={setToc} /> // Pass TOC callback
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
