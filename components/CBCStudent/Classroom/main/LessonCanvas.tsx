"use client";

import { useState, useEffect } from "react";
import TextbookRenderer from "@/components/admin/TextbookRenderer";
import EmptyLessonState from "./EmptyLessonState";
import contentJson from "@/content.json";

// Define the structure of content.json
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

// Type assertion — now TypeScript knows exactly what contentJson looks like
const contentData = contentJson as ContentJson;

interface TextbookData {
  exists: boolean;
  student_html?: string;
  teacher_html?: string;
  grade?: string;
  subject?: string;
  strand?: string;
}

export default function LessonCanvas() {
  const grades = Object.keys(contentData);
  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0] || "");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [strands, setStrands] = useState<string[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<string>("");

  const [textbook, setTextbook] = useState<TextbookData | null>(null);
  const [loading, setLoading] = useState(false);

  // Update subjects when grade changes
  useEffect(() => {
    if (!selectedGrade || !contentData[selectedGrade]) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }
    const subjectsList = Object.keys(contentData[selectedGrade]);
    setSubjects(subjectsList);
    setSelectedSubject(subjectsList[0] || "");
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
    setSelectedStrand(strandsList[0] || "");
  }, [selectedGrade, selectedSubject]);

  // Fetch textbook when selection is complete
  useEffect(() => {
    if (!selectedGrade || !selectedSubject || !selectedStrand) {
      setTextbook(null);
      return;
    }

    const fetchTextbook = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/textbooks?grade=${encodeURIComponent(selectedGrade)}&subject=${encodeURIComponent(selectedSubject)}&strand=${encodeURIComponent(selectedStrand)}`
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
  }, [selectedGrade, selectedSubject, selectedStrand]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c] rounded-xl overflow-hidden">
      {/* Selector Bar */}
      <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
          >
            <option value="">Select Grade</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!subjects.length}
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedStrand}
            onChange={(e) => setSelectedStrand(e.target.value)}
            disabled={!strands.length}
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50"
          >
            <option value="">Select Strand</option>
            {strands.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {selectedGrade && selectedSubject && selectedStrand && (
          <div className="mt-3 text-center text-white/70 text-sm font-medium">
            Grade {selectedGrade} • {selectedSubject} • {selectedStrand}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/60 animate-pulse">Loading lesson...</div>
          </div>
        ) : textbook?.exists && textbook.student_html ? (
          <TextbookRenderer content={textbook.student_html} />
        ) : selectedGrade && selectedSubject && selectedStrand ? (
          <EmptyLessonState
            grade={selectedGrade}
            subject={selectedSubject}
            strand={selectedStrand}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/40">
            <p>Please select a grade, subject, and strand to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}