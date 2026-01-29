'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import TeacherTextbookRenderer, { TocItem } from './TeacherTextbookRenderer';
import TeacherChatPanel from './TeacherChatPanel';
import TeacherTOCIcon from './TeacherTOCIcon';
import { getGroupedGrades } from '@/lib/utils/grade-hierarchy';

// Types for curriculum data
interface SubStrand {
    Outcomes: string[];
}
interface Strand {
    SubStrands: Record<string, SubStrand>;
}
interface Subject {
    Strands: Record<string, Strand>;
}
interface GradeContent {
    [subject: string]: Subject;
}

export default function TeachersGuideLayout() {
    const [grades, setGrades] = useState<string[]>([]);
    const [gradeContent, setGradeContent] = useState<GradeContent | null>(null);

    const [selectedGrade, setSelectedGrade] = useState<string>("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [strands, setStrands] = useState<string[]>([]);
    const [selectedStrand, setSelectedStrand] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guideContent, setGuideContent] = useState<string | null>(null);
    const [guideImages, setGuideImages] = useState<any[]>([]);

    // View toggle state (matching student classroom)
    const [view, setView] = useState<"both" | "left" | "right">("both");

    // Mobile panel state: 'default' = 90:10 (guide large), 'assistantExpanded' = 10:90 (assistant large)
    const [mobilePanelState, setMobilePanelState] = useState<"default" | "assistantExpanded">("default");

    // TOC state
    const [toc, setToc] = useState<TocItem[]>([]);

    // Fetch available grades on mount
    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await fetch('/api/curriculum');
                const data = await res.json();
                if (data.grades) {
                    setGrades(data.grades);
                }
            } catch (err) {
                console.error('Failed to fetch grades:', err);
            }
        };
        fetchGrades();
    }, []);

    // Fetch grade content when grade changes
    useEffect(() => {
        if (!selectedGrade) {
            setGradeContent(null);
            setSubjects([]);
            setSelectedSubject("");
            setStrands([]);
            setSelectedStrand("");
            return;
        }

        const fetchGradeContent = async () => {
            try {
                const res = await fetch(`/api/curriculum?grade=${encodeURIComponent(selectedGrade)}`);
                const data = await res.json();
                if (!res.ok) {
                    console.error('Failed to fetch grade content:', data.error);
                    return;
                }
                setGradeContent(data);
                setSubjects(Object.keys(data));
                setSelectedSubject("");
            } catch (err) {
                console.error('Failed to fetch grade content:', err);
            }
        };
        fetchGradeContent();
    }, [selectedGrade]);

    // Update strands when subject changes
    useEffect(() => {
        if (!gradeContent || !selectedSubject) {
            setStrands([]);
            setSelectedStrand("");
            return;
        }
        const subjectData = gradeContent[selectedSubject];
        if (!subjectData) {
            setStrands([]);
            setSelectedStrand("");
            return;
        }
        const strandsObj = subjectData.Strands;
        const strandsList = Object.keys(strandsObj || {});
        setStrands(strandsList);
        setSelectedStrand("");
    }, [gradeContent, selectedSubject]);

    // Fetch guide function
    const fetchGuide = useCallback(async (grade: string, subject: string, strand: string) => {
        if (!grade || !subject || !strand) return;

        setLoading(true);
        setError(null);
        setGuideContent(null);

        try {
            const res = await fetch(
                `/api/textbook?grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}&strand=${encodeURIComponent(strand)}`
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch guide');
            }

            // Check for teacher content - try multiple fields
            const teacherHtml = data.teacher_html || data.teacher_content?.html;

            if (data.exists && teacherHtml) {
                setGuideContent(teacherHtml);
                setGuideImages(data.images || []);
            } else if (data.exists && data.student_html) {
                // Fallback: If no teacher guide, use student content with a note
                setGuideContent(data.student_html);
                setGuideImages(data.images || []);
            } else {
                setGuideContent(null);
                setError("Guide not found");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while loading the guide.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to trigger fetch when selections are complete
    useEffect(() => {
        if (selectedGrade && selectedSubject && selectedStrand) {
            fetchGuide(selectedGrade, selectedSubject, selectedStrand);
        } else {
            setGuideContent(null);
            setGuideImages([]);
            setError(null);
        }
    }, [selectedGrade, selectedSubject, selectedStrand, fetchGuide]);

    // View classes (matching student classroom)
    const leftClasses = useMemo(() => {
        const base = "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0";
        const width = view === "left" ? "w-full" : view === "both" ? "w-[60%]" : "w-0";
        const border = view === "right" ? "" : "border-r border-white/10";
        return `${base} ${width} ${border}`;
    }, [view]);

    const rightClasses = useMemo(() => {
        const base = "transition-all duration-300 ease-in-out relative overflow-hidden min-w-0 bg-transparent";
        const width = view === "right" ? "w-full" : view === "both" ? "w-[40%]" : "w-0";
        return `${base} ${width}`;
    }, [view]);

    // Mobile panel heights
    const mainPanelHeight = mobilePanelState === "default" ? "h-[90%]" : "h-[10%]";
    const assistantPanelHeight = mobilePanelState === "default" ? "h-[10%]" : "h-[90%]";

    return (
        <div className="relative flex flex-col h-[calc(85vh-4rem)] md:h-[87vh] lg:h-[90vh] w-full bg-[#0a0f14]/80 backdrop-blur-sm text-white overflow-hidden rounded-2xl shadow-xl shadow-black/40 border border-white/10">
            {/* Top controls - View Toggle (hidden on mobile) */}
            <div className="hidden sm:flex items-center justify-center gap-2 p-3 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-2">
                    <button
                        className={`px-3 py-1 text-xs border border-white/10 rounded-md transition-colors ${view === "left"
                            ? "bg-[#228B22] hover:bg-[#1a6b1a]"
                            : "bg-white/10 hover:bg-white/20"
                            }`}
                        onClick={() => setView("left")}
                    >
                        Guide Only
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
                        Assistant Only
                    </button>
                </div>
            </div>

            {/* Mobile layout: Vertical stack with toggle controls */}
            <div className="flex flex-col flex-1 overflow-hidden sm:hidden p-2 gap-2">
                {/* Main Panel Card (Guide Content) */}
                <div className={`${mainPanelHeight} overflow-hidden relative rounded-xl bg-[#0b0f12] border-2 border-white/30 transition-all duration-300`}>
                    <div className={`h-full flex flex-col overflow-hidden ${mobilePanelState === "assistantExpanded" ? "invisible" : ""}`}>
                        {/* Selector Bar - Matching Student Classroom */}
                        <div className="p-3 sm:p-5 border-b border-white/10 bg-white/5">
                            <div className="flex gap-2">
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="flex-1 min-w-0 px-2 py-2 bg-[#1a1f25] border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-white/40 transition-all [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                >
                                    <option value="">Grade</option>
                                    {getGroupedGrades(grades).map((section) => (
                                        <optgroup key={section.label} label={section.label}>
                                            {section.grades.map((g) => (
                                                <option key={g} value={g}>Grade {g}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>

                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    disabled={!subjects.length}
                                    className="flex-1 min-w-0 px-2 py-2 bg-[#1a1f25] border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                >
                                    <option value="">Subject</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedStrand}
                                    onChange={(e) => setSelectedStrand(e.target.value)}
                                    disabled={!strands.length}
                                    className="flex-1 min-w-0 px-2 py-2 bg-[#1a1f25] border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                >
                                    <option value="">Strand</option>
                                    {strands.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-white/60 animate-pulse text-sm">Loading...</div>
                                </div>
                            ) : guideContent ? (
                                <TeacherTextbookRenderer
                                    content={guideContent}
                                    images={guideImages}
                                    onTocUpdate={setToc}
                                />
                            ) : error === "Guide not found" ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                    <h3 className="text-sm font-bold text-white mb-2">Guide Not Found</h3>
                                    <Link href="/dashboard/admin" className="text-sky-400 text-xs hover:underline mt-2">Go to Admin →</Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                    <p className="text-white/40 text-sm">Select options to view guide</p>
                                </div>
                            )}
                        </div>

                        {/* TOC Button */}
                        {mobilePanelState !== "assistantExpanded" && <TeacherTOCIcon toc={toc} />}
                    </div>

                    {/* Overlay "Guide" text when collapsed */}
                    {mobilePanelState === "assistantExpanded" && (
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setMobilePanelState("default")}
                        >
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Teacher Guide</h3>
                        </div>
                    )}

                    {/* Minimize/Maximize button */}
                    <button
                        onClick={() => setMobilePanelState(mobilePanelState === "default" ? "assistantExpanded" : "default")}
                        className="absolute bottom-1 right-2 z-20 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
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

                {/* Assistant Panel Card */}
                <div
                    className={`${assistantPanelHeight} overflow-hidden relative rounded-xl bg-[#0b0f12] border-2 border-white/30 transition-all duration-300 ${mobilePanelState === "default" ? 'cursor-pointer hover:bg-white/5' : ''}`}
                    onClick={() => mobilePanelState === "default" && setMobilePanelState("assistantExpanded")}
                >
                    {/* Header row with title + Min/Max button */}
                    <div className="absolute top-1 left-2 right-2 z-20 flex items-center justify-between">
                        {mobilePanelState === "assistantExpanded" && (
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[60%]">
                                {selectedStrand || 'Teaching Assistant'}
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobilePanelState(mobilePanelState === "default" ? "assistantExpanded" : "default");
                            }}
                            className="ml-auto px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
                        >
                            {mobilePanelState === "assistantExpanded" ? (
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

                    <div className={`h-full p-3 pt-8 overflow-hidden ${mobilePanelState === "default" ? "invisible" : ""}`}>
                        <TeacherChatPanel
                            mobileExpanded={mobilePanelState === "assistantExpanded"}
                            context={{
                                grade: selectedGrade,
                                subject: selectedSubject,
                                strand: selectedStrand,
                            }}
                            guideContent={guideContent || ""}
                        />
                    </div>

                    {/* Overlay text when collapsed */}
                    {mobilePanelState === "default" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Assistant</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Main layout area (Desktop Only) */}
            <div className="hidden sm:flex flex-1 overflow-hidden">
                {/* LEFT PANEL – Guide Content */}
                <div className={leftClasses}>
                    <div className="h-full flex flex-col overflow-hidden">
                        <div
                            className={
                                (view === "right"
                                    ? "opacity-0 pointer-events-none select-none"
                                    : "opacity-100") + " h-full flex flex-col"
                            }
                        >
                            {/* Selector Bar - Match Student Classroom */}
                            <div className="p-3 sm:p-5 border-b border-white/10 bg-white/5">
                                <div className="flex gap-2 sm:gap-4">
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 bg-[#1a1f25] border border-white/20 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-white/40 transition-all [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                    >
                                        <option value="">Grade</option>
                                        {getGroupedGrades(grades).map((section) => (
                                            <optgroup key={section.label} label={section.label}>
                                                {section.grades.map((g) => (
                                                    <option key={g} value={g}>Grade {g}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        disabled={!subjects.length}
                                        className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 bg-[#1a1f25] border border-white/20 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                    >
                                        <option value="">Subject</option>
                                        {subjects.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedStrand}
                                        onChange={(e) => setSelectedStrand(e.target.value)}
                                        disabled={!strands.length}
                                        className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 bg-[#1a1f25] border border-white/20 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                    >
                                        <option value="">Strand</option>
                                        {strands.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>


                            </div>

                            {/* Scrollable Content Area - Matching student classroom styling */}
                            <div className="flex-1 overflow-y-auto px-2 pt-0 pb-2 sm:px-2 sm:pb-2 sm:pt-0 scrollbar-hide">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-white/60 animate-pulse text-lg">Loading your guide...</div>
                                    </div>
                                ) : error === "Guide not found" ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                            <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Guide Not Found</h3>
                                        <p className="text-[#9aa6b2] text-sm max-w-sm mb-6">
                                            This guide hasn't been generated yet. Use the generator to create it.
                                        </p>
                                        <Link
                                            href="/dashboard/admin"
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sky-400 text-sm font-medium rounded-lg transition-colors border border-white/10"
                                        >
                                            Go to Admin Generator →
                                        </Link>
                                    </div>
                                ) : guideContent ? (
                                    <TeacherTextbookRenderer
                                        content={guideContent}
                                        images={guideImages}
                                        onTocUpdate={setToc}
                                    />
                                ) : selectedGrade && selectedSubject && selectedStrand ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-[#9aa6b2]/50">
                                        <p className="text-sm">Loading guide content...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                        <div className="text-8xl mb-6 opacity-30">📖</div>
                                        <p className="text-white/60 text-lg max-w-md">
                                            Select a grade, subject, and strand above to view the teaching guide and get real-time AI assistance.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* TOC Button */}
                            <TeacherTOCIcon toc={toc} />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL – Teaching Assistant Chat */}
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
                            <TeacherChatPanel
                                context={{
                                    grade: selectedGrade,
                                    subject: selectedSubject,
                                    strand: selectedStrand,
                                }}
                                guideContent={guideContent || ""}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
