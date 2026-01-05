'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

    const [selectedGrade, setSelectedGrade] = useState<string>(grades[0] || "");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [strands, setStrands] = useState<string[]>([]);
    const [selectedStrand, setSelectedStrand] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guideContent, setGuideContent] = useState<string | null>(null);
    const [guideImages, setGuideImages] = useState<any[]>([]);

    // Update subjects when grade changes
    useEffect(() => {
        if (!selectedGrade) return;
        const subjectsList = Object.keys((contentJson as GradeMap)[selectedGrade] || {});
        setSubjects(subjectsList);
        // Reset to first subject if available, or empty
        setSelectedSubject(subjectsList[0] || "");
    }, [selectedGrade]);

    // Update strands when subject changes
    useEffect(() => {
        if (!selectedGrade || !selectedSubject) return;
        const subjectData = (contentJson as GradeMap)[selectedGrade]?.[selectedSubject];
        if (!subjectData) {
            setStrands([]);
            setSelectedStrand("");
            return;
        }
        const strandsObj = subjectData.Strands;
        const strandsList = Object.keys(strandsObj || {});
        setStrands(strandsList);
        // Reset to first strand if available, or empty
        setSelectedStrand(strandsList[0] || "");
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

            if (data.exists && data.teacher_html) {
                setGuideContent(data.teacher_html);
                setGuideImages(data.images || []);
            } else {
                setGuideContent(null);
                // Special indicator that guide doesn't exist
                setError("Guide not found");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while loading the guide.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to trigger fetch when selections are stable and valid
    useEffect(() => {
        if (selectedGrade && selectedSubject && selectedStrand) {
            fetchGuide(selectedGrade, selectedSubject, selectedStrand);
        } else {
            // Clear content if selection is incomplete
            setGuideContent(null);
            setGuideImages([]);
            setError(null);
        }
    }, [selectedGrade, selectedSubject, selectedStrand, fetchGuide]);


    return (
        <>
            <div className="h-[85vh] md:h-[87vh] lg:h-[90vh] flex flex-col lg:flex-row bg-[#0a0f14]/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40">
                {/* LEFT PANEL – Main Content */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 relative">
                    {/* Filters Bar (Fixed Header) */}
                    <div className="p-4 border-b border-white/10 bg-white/5 z-10">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Grade */}
                            <div className="flex-1">
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                >
                                    {grades.map(g => <option key={g} value={g} className="bg-[#12171c]">{g}</option>)}
                                </select>
                            </div>

                            {/* Subject */}
                            <div className="flex-1">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                >
                                    {subjects.map(s => <option key={s} value={s} className="bg-[#12171c]">{s}</option>)}
                                </select>
                            </div>

                            {/* Strand */}
                            <div className="flex-1">
                                <select
                                    value={selectedStrand}
                                    onChange={(e) => setSelectedStrand(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                >
                                    {strands.map(s => <option key={s} value={s} className="bg-[#12171c]">{s}</option>)}
                                </select>
                            </div>
                        </div>
                        {selectedGrade && selectedSubject && selectedStrand && (
                            <div className="mt-2 text-center text-white/50 text-xs uppercase tracking-wider font-medium">
                                {selectedGrade} • {selectedSubject} • {selectedStrand}
                            </div>
                        )}
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-transparent">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/50">
                                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                                <p className="text-sm">Loading guide...</p>
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
                                    href="/dashboard/teacher/textbooks"
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sky-400 text-sm font-medium rounded-lg transition-colors border border-white/10"
                                >
                                    Go to Generator →
                                </Link>
                            </div>
                        ) : guideContent ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
                                <TeacherTextbookRenderer content={guideContent} images={guideImages} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-[#9aa6b2]/50">
                                <p className="text-sm">Select a strand to view the guide.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL – Teaching Assistant Chat */}
                <div className="w-full lg:w-[400px] bg-transparent flex flex-col h-[40vh] lg:h-auto min-h-0 border-t lg:border-t-0 lg:border-l border-white/10">
                    <div className="h-full p-4 overflow-hidden">
                        <TeacherChatPanel
                            context={{
                                grade: selectedGrade,
                                subject: selectedSubject,
                                strand: selectedStrand,
                            }}
                        />
                    </div>
                </div>
            </div >
        </>
    );
}
