'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import contentJson from '@/content.json';
import Link from 'next/link';
import TeacherTextbookRenderer from './TeacherTextbookRenderer';
import TeacherChatPanel from './TeacherChatPanel';

// Types derived from content.json
interface SubStrand {
    Outcomes: string[];
}
interface Strand {
    SubStrands: Record<string, SubStrand>;
}
interface Subject {
    Strands: Record<string, Strand>;
}
interface GradeMap {
    [grade: string]: {
        [subject: string]: Subject;
    };
}

export default function TeachersGuideLayout() {
    const grades = Object.keys(contentJson);

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

    // Update subjects when grade changes
    useEffect(() => {
        if (!selectedGrade) {
            setSubjects([]);
            setSelectedSubject("");
            setStrands([]);
            setSelectedStrand("");
            return;
        }
        const subjectsList = Object.keys((contentJson as GradeMap)[selectedGrade] || {});
        setSubjects(subjectsList);
        setSelectedSubject("");
    }, [selectedGrade]);

    // Update strands when subject changes
    useEffect(() => {
        if (!selectedGrade || !selectedSubject) {
            setStrands([]);
            setSelectedStrand("");
            return;
        }
        const subjectData = (contentJson as GradeMap)[selectedGrade]?.[selectedSubject];
        if (!subjectData) {
            setStrands([]);
            setSelectedStrand("");
            return;
        }
        const strandsObj = subjectData.Strands;
        const strandsList = Object.keys(strandsObj || {});
        setStrands(strandsList);
        setSelectedStrand("");
    }, [selectedGrade, selectedSubject]);

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

    return (
        <div className="relative flex flex-col h-[85vh] md:h-[87vh] lg:h-[90vh] w-full bg-[#0a0f14]/80 backdrop-blur-sm text-white overflow-hidden rounded-2xl shadow-xl shadow-black/40 border border-white/10">
            {/* Top controls - View Toggle (matching student classroom) */}
            <div className="flex items-center justify-center gap-2 p-3 border-b border-white/10 bg-black/20">
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

            {/* Main layout area */}
            <div className="flex flex-1 overflow-hidden">
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
                            {/* Selector Bar */}
                            <div className="p-5 border-b border-white/10 bg-white/5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="px-4 py-3 bg-[#1a1f25] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-white/40 transition-all [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                    >
                                        <option value="">Select Grade</option>
                                        {grades.map((g) => (
                                            <option key={g} value={g}>Grade {g}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        disabled={!subjects.length}
                                        className="px-4 py-3 bg-[#1a1f25] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedStrand}
                                        onChange={(e) => setSelectedStrand(e.target.value)}
                                        disabled={!strands.length}
                                        className="px-4 py-3 bg-[#1a1f25] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 [&>option]:bg-[#1a1f25] [&>option]:text-white"
                                    >
                                        <option value="">Select Strand</option>
                                        {strands.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedGrade && selectedSubject && selectedStrand && (
                                    <div className="mt-4 text-center text-white/70 text-sm font-medium">
                                        Grade {selectedGrade} • {selectedSubject} • {selectedStrand}
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
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
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
                                        <TeacherTextbookRenderer content={guideContent} images={guideImages} />
                                    </div>
                                ) : selectedGrade && selectedSubject && selectedStrand ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-[#9aa6b2]/50">
                                        <p className="text-sm">Loading guide content...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                        <div className="text-8xl mb-6 opacity-30">📖</div>
                                        <h2 className="text-2xl font-bold text-white mb-3">
                                            Welcome to Teacher's Guide
                                        </h2>
                                        <p className="text-white/60 text-lg max-w-md">
                                            Select a grade, subject, and strand above to view the teaching guide.
                                        </p>
                                    </div>
                                )}
                            </div>
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
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
