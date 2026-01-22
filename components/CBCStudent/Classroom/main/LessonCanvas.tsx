"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EmptyLessonState from "./EmptyLessonState";
import StudentTextbookRenderer, { TocItem } from "@/components/CBCStudent/Classroom/main/StudentTextbookRenderer";
import { useTutor } from "@/lib/context/TutorContext";
import { getGroupedGrades } from "@/lib/utils/grade-hierarchy";
const LESSON_STATE_KEY = 'curio_lesson_selection';

interface TextbookData {
  exists: boolean;
  student_html?: string;
  teacher_html?: string;
  grade?: string;
  subject?: string;
  strand?: string;
  images?: any[];
}

interface LessonCanvasProps {
  onTocUpdate?: (toc: TocItem[]) => void; // New prop to lift TOC
  onTutorActivated?: () => void; // Callback when tutor is activated (for mobile expand)
}

// Get initial state from localStorage or URL params
function getInitialState(key: string, urlParam: string | null): string {
  if (urlParam) return urlParam;
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem(LESSON_STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed[key] || '';
    }
  } catch (e) {
    console.error('Failed to load lesson state:', e);
  }
  return '';
}

export default function LessonCanvas({ onTocUpdate, onTutorActivated }: LessonCanvasProps) {
  const searchParams = useSearchParams();
  const { activateLearningMode, activateQuizMode } = useTutor();

  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [strands, setStrands] = useState<string[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<string>("");

  const [textbook, setTextbook] = useState<TextbookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gradeContent, setGradeContent] = useState<any>(null);

  // Fetch grades on mount
  useEffect(() => {
    fetch('/api/curriculum')
      .then(res => res.json())
      .then(data => setGrades(data.grades || []))
      .catch(err => console.error("Failed to fetch grades:", err));
  }, []);

  // Initialize from localStorage or URL params on mount
  useEffect(() => {
    const grade = getInitialState('grade', searchParams.get('grade'));
    const subject = getInitialState('subject', searchParams.get('subject'));
    const strand = getInitialState('strand', searchParams.get('strand'));

    if (grade) setSelectedGrade(grade);
    if (subject) setSelectedSubject(subject);
    if (strand) setSelectedStrand(strand);
    setIsInitialized(true);
  }, [searchParams]);

  // Save to localStorage when selection changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LESSON_STATE_KEY, JSON.stringify({
        grade: selectedGrade,
        subject: selectedSubject,
        strand: selectedStrand,
      }));
    } catch (e) {
      console.error('Failed to save lesson state:', e);
    }
  }, [selectedGrade, selectedSubject, selectedStrand, isInitialized]);

  // Update subjects when grade changes
  useEffect(() => {
    if (!selectedGrade) {
      setGradeContent(null);
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    fetch(`/api/curriculum?grade=${encodeURIComponent(selectedGrade)}`)
      .then(res => res.json())
      .then(data => {
        setGradeContent(data);
        const subjectsList = Object.keys(data || {});
        setSubjects(subjectsList);
        // Don't auto-reset if it's already set (e.g. from local storage)
        if (!selectedSubject) setSelectedSubject("");
      })
      .catch(err => console.error("Failed to fetch grade content:", err));
  }, [selectedGrade]);

  // Update strands when subject changes
  useEffect(() => {
    if (!gradeContent || !selectedSubject) {
      setStrands([]);
      setSelectedStrand("");
      return;
    }

    const subjectData = gradeContent[selectedSubject];
    if (!subjectData?.Strands) {
      setStrands([]);
      setSelectedStrand("");
      return;
    }

    const strandsList = Object.keys(subjectData.Strands);
    setStrands(strandsList);
    // Don't auto-reset if it's already set
    if (!selectedStrand) setSelectedStrand("");
  }, [gradeContent, selectedSubject]);

  // Fetch textbook only when full selection is made
  useEffect(() => {
    if (!selectedGrade || !selectedSubject || !selectedStrand) {
      setTextbook(null);
      setToc([]);
      if (onTocUpdate) onTocUpdate([]);
      return;
    }

    const fetchTextbook = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/textbook?grade=${encodeURIComponent(selectedGrade)}&subject=${encodeURIComponent(selectedSubject)}&strand=${encodeURIComponent(selectedStrand)}`
        );
        const data = await res.json();
        setTextbook(data);
      } catch (err) {
        console.error("Failed to load textbook:", err);
        setTextbook({ exists: false });
      } finally {
        setLoading(false);
      }
    };

    fetchTextbook();
  }, [selectedGrade, selectedSubject, selectedStrand, onTocUpdate]);

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Selector Bar */}
      <div className="p-3 sm:p-5 border-b border-white/10 bg-white/5">
        {/* <h2 className="text-lg font-semibold text-white mb-4 text-center">
          Browse Lessons
        </h2> */}
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

      {/* Content Area */}

      <div className="flex-1 overflow-y-auto px-2 pt-1 pb-2 sm:p-2 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/60 animate-pulse text-lg">Loading your lesson...</div>
          </div>
        ) : textbook?.exists && textbook.student_html ? (
          <StudentTextbookRenderer
            content={textbook.student_html}
            images={textbook.images || []}
            onTocUpdate={(items) => {
              setToc(items);
              if (onTocUpdate) onTocUpdate(items);
            }}
            onLearnWithAI={(substrand) => {
              activateLearningMode({
                grade: selectedGrade,
                subject: selectedSubject,
                strand: selectedStrand,
                substrand: substrand.title,
                textbookContent: substrand.content,
              });
              if (onTutorActivated) onTutorActivated();
            }}
            onTakeQuiz={(substrand) => {
              activateQuizMode({
                grade: selectedGrade,
                subject: selectedSubject,
                strand: selectedStrand,
                substrand: substrand.title,
                textbookContent: substrand.content,
              });
              if (onTutorActivated) onTutorActivated();
            }}
          />
        ) : selectedGrade && selectedSubject && selectedStrand ? (
          <EmptyLessonState
            grade={selectedGrade}
            subject={selectedSubject}
            strand={selectedStrand}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 sm:px-8">
            <div className="text-8xl mb-6 opacity-30 hidden sm:block">📚</div>
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              Welcome to Your Classroom
            </h2>
            <p className="text-white/60 text-sm sm:text-lg max-w-md">
              Select a grade, subject, and strand above to load your lesson.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
