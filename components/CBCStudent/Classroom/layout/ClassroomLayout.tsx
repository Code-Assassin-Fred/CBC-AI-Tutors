"use client";

import React, { useMemo, useState } from "react";

export default function ClassroomLayout() {
  const [view, setView] = useState<"both" | "left" | "right">("both");
  const [contentMode, setContentMode] = useState<"lesson" | "saved">("lesson");

  const leftClasses = useMemo(() => {
    const base =
      "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0";
    const width =
      view === "left"
        ? "w-full"
        : view === "both"
        ? "w-[60%]"
        : "w-0";
    const border = view === "right" ? "" : "border-r border-black";
    return `${base} ${width} ${border}`;
  }, [view]);

  const rightClasses = useMemo(() => {
    const base =
      "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0 bg-gradient-to-br from-[#111113] to-[#1a1a1f]";
    const width =
      view === "right"
        ? "w-full"
        : view === "both"
        ? "w-[40%]"
        : "w-0";
    return `${base} ${width}`;
  }, [view]);

  return (
    <div className="relative flex flex-col h-[85vh] md:h-[87vh] lg:h-[90vh] w-full bg-[#0E0E10] text-white overflow-hidden rounded-2xl shadow-md shadow-black/20 border border-white/10">
      {/* Top controls */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-white/10 bg-[#0E0E10]">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 text-xs border border-white/10 ${
              view === "left"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setView("left")}
          >
            Main Only
          </button>

          <button
            className={`px-3 py-1 text-xs border border-white/10 ${
              view === "both"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setView("both")}
          >
            Split View
          </button>

          <button
            className={`px-3 py-1 text-xs border border-white/10 ${
              view === "right"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setView("right")}
          >
            Tutor Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 text-xs border border-white/10 ${
              contentMode === "lesson"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setContentMode("lesson")}
          >
            Current Lesson
          </button>

          <button
            className={`px-3 py-1 text-xs border border-white/10 ${
              contentMode === "saved"
                ? "bg-[#7c3aed] hover:bg-[#6d28d9]"
                : "bg-white/10 hover:bg-white/20"
            }`}
            onClick={() => setContentMode("saved")}
          >
            Saved Lessons
          </button>
        </div>
      </div>

      {/* Main layout area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className={leftClasses}>
          <div className="h-full p-6 overflow-y-auto scrollbar-hide bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
            <div
              className={
                view === "right"
                  ? "opacity-0 pointer-events-none select-none"
                  : "opacity-100"
              }
            >
              {contentMode === "lesson" ? (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-white/80">LessonCanvas placeholder</p>
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-white/80">SavedLessonsPanel placeholder</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={rightClasses}>
          {view !== "right" && view !== "left" && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
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
              <div className="p-4 bg-white/10 rounded-lg border border-white/10 h-full">
                <p className="text-sm text-white/80">TutorPanel placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
