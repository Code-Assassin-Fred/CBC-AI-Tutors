"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EmptyLessonState from "./EmptyLessonState";
import contentJson from "@/content.json";
import StudentTextbookRenderer, { TocItem } from "@/components/CBCStudent/Classroom/main/StudentTextbookRenderer";
import { useTutor } from "@/lib/context/TutorContext";

interface SubStrand {
  Outcomes: string[];
  SubStrands?: Record<string, SubStrand>;
}

interface Strand {
  SubStrands?: Record<string, SubStrand>;
  Outcomes?: string[];
}

interface Subject {
  Strands: Record<string, Strand>;
}

interface GradeData {
  [subject: string]: Subject;
}

interface ContentJson {
  [grade: string]: GradeData;
}

const contentData = contentJson as ContentJson;

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
}

export default function LessonCanvas({ onTocUpdate }: LessonCanvasProps) {
  const searchParams = useSearchParams();
  const grades = Object.keys(contentData);
  const { activateLearningMode, activateQuizMode } = useTutor();

  const [selectedGrade, setSelectedGrade] = useState<string>(searchParams.get('grade') || "");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams.get('subject') || "");
  const [strands, setStrands] = useState<string[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<string>(searchParams.get('strand') || "");

  const [textbook, setTextbook] = useState<TextbookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]); // Local TOC

  // Update subjects when grade changes
  useEffect(() => {
    if (!selectedGrade || !contentData[selectedGrade]) {
      setSubjects([]);
      setSelectedSubject("");
      setStrands([]);
      setSelectedStrand("");
      return;
    }
    const subjectsList = Object.keys(contentData[selectedGrade]);
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

    const subjectData = contentData[selectedGrade]?.[selectedSubject];
    if (!subjectData?.Strands) {
      setStrands([]);
      setSelectedStrand("");
      return;
    }

    const strandsList = Object.keys(subjectData.Strands);
    setStrands(strandsList);
    setSelectedStrand("");
  }, [selectedGrade, selectedSubject]);

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
      <div className="p-5 border-b border-white/10 bg-white/5">
        {/* <h2 className="text-lg font-semibold text-white mb-4 text-center">
          Browse Lessons
        </h2> */}
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
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
            }}
            onTakeQuiz={(substrand) => {
              activateQuizMode({
                grade: selectedGrade,
                subject: selectedSubject,
                strand: selectedStrand,
                substrand: substrand.title,
                textbookContent: substrand.content,
              });
            }}
          />
        ) : selectedGrade && selectedSubject && selectedStrand ? (
          <EmptyLessonState
            grade={selectedGrade}
            subject={selectedSubject}
            strand={selectedStrand}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-8xl mb-6 opacity-30">📚</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to Your Classroom
            </h2>
            <p className="text-white/60 text-lg max-w-md">
              Select a grade, subject, and strand above to load your lesson.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
