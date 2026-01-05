"use client";
import { useState, useEffect } from "react";
import TextbookRenderer from "@/components/admin/TextbookRenderer";
import StudentTextbookRenderer from "@/components/CBCStudent/Classroom/main/StudentTextbookRenderer";
import GenerationProgress from "@/components/admin/GenerationProgress";
import contentJson from "@/content.json";
import { useAuth } from "@/lib/context/AuthContext";

// ---- Types ----
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

// ---- Icons ----
const GraduationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const RobotIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// ---- Component ----
export default function GeneratePage() {
  const { user } = useAuth();
  const grades = Object.keys(contentJson);

  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0] || "");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [strands, setStrands] = useState<string[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<string>("");

  const [learnerHtml, setLearnerHtml] = useState<string>("");
  const [teacherHtml, setTeacherHtml] = useState<string>("");
  const [images, setImages] = useState<any[]>([]);
  const [mode, setMode] = useState<"Learner" | "Teacher">("Learner");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true); // Toggle for streaming mode

  // ---- Update subjects when grade changes ----
  useEffect(() => {
    if (!selectedGrade) return;
    const subjectsList = Object.keys(
      (contentJson as GradeMap)[selectedGrade] || {}
    );
    setSubjects(subjectsList);
    setSelectedSubject(subjectsList[0] || "");
  }, [selectedGrade]);

  // ---- Update strands when subject changes ----
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
    setSelectedStrand(strandsList[0] || "");
  }, [selectedGrade, selectedSubject]);

  // ---- Start generation ----
  const startGeneration = () => {
    if (!selectedGrade || !selectedSubject || !selectedStrand) return;
    setIsGenerating(true);
    setLearnerHtml("");
    setTeacherHtml("");
  };

  // ---- Handle generation complete ----
  const handleGenerationComplete = async (success: boolean) => {
    if (success) {
      // Fetch the generated content
      try {
        const res = await fetch(
          `/api/textbook?grade=${encodeURIComponent(selectedGrade)}&subject=${encodeURIComponent(selectedSubject)}&strand=${encodeURIComponent(selectedStrand)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setLearnerHtml(data.student_html || "");
            setTeacherHtml(data.teacher_html || "");
            setImages(data.images || []);
            setMode("Learner");
          }
        }
      } catch (err) {
        console.error("Failed to fetch generated content:", err);
      }
    }
    setIsGenerating(false);
  };

  const hasContent = learnerHtml || teacherHtml;

  // ---- Render ----
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="bg-[#0b0f12]/60 backdrop-blur-xl rounded-2xl border border-white/8 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm text-[#9aa6b2]">
            {selectedGrade && selectedSubject && selectedStrand ? (
              <>
                <span className="font-medium text-white/70">{selectedGrade}</span>
                <span className="opacity-30">→</span>
                <span className="font-medium text-white/70">{selectedSubject}</span>
                <span className="opacity-30">→</span>
                <span className="font-medium text-sky-400">{selectedStrand}</span>
              </>
            ) : (
              <span>Select curriculum parameters to begin generation</span>
            )}
          </div>

          {/* Streaming toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className="text-xs font-medium text-[#9aa6b2] group-hover:text-white/80 transition-colors">Show AI Progress</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/5 rounded-full peer peer-checked:bg-sky-500/80 transition-all border border-white/10" />
                <div className="absolute left-1 top-1 w-3 h-3 bg-white/90 rounded-full transition-all peer-checked:translate-x-4 shadow-sm" />
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-5">
          {/* Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {/* Grade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9aa6b2]">
                <GraduationIcon />
                Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                disabled={isGenerating}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all duration-200 hover:bg-white/10 disabled:opacity-50 appearance-none cursor-pointer"
              >
                {grades.map((g) => (
                  <option key={g} value={g} className="bg-[#12171c]">{g}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9aa6b2]">
                <BookIcon />
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={isGenerating}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all duration-200 hover:bg-white/10 disabled:opacity-50 appearance-none cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s} value={s} className="bg-[#12171c]">{s}</option>
                ))}
              </select>
            </div>

            {/* Strand */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9aa6b2]">
                <LayersIcon />
                Strand
              </label>
              <select
                value={selectedStrand}
                onChange={(e) => setSelectedStrand(e.target.value)}
                disabled={isGenerating}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all duration-200 hover:bg-white/10 disabled:opacity-50 appearance-none cursor-pointer"
              >
                {strands.map((s) => (
                  <option key={s} value={s} className="bg-[#12171c]">{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={startGeneration}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_8px_24px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:shadow-none transition-all duration-300 min-w-[200px]"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Working...</span>
              </>
            ) : (
              <>
                <SparklesIcon />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generation Progress */}
      {useStreaming && (
        <GenerationProgress
          isGenerating={isGenerating}
          grade={selectedGrade}
          subject={selectedSubject}
          strand={selectedStrand}
          generatedBy={user?.uid}
          onComplete={handleGenerationComplete}
        />
      )}

      {/* Content Area */}
      {hasContent && !isGenerating && (
        <div className="bg-[#0b0f12]/60 backdrop-blur-xl rounded-2xl border border-white/8 overflow-hidden shadow-2xl">
          {/* Mode Toggle Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
            <div className="flex items-center gap-1.5 p-1 bg-[#0b1113] rounded-xl border border-white/5">
              <button
                onClick={() => setMode("Learner")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "Learner"
                  ? "bg-[#0ea5e9] text-white shadow-lg"
                  : "text-[#9aa6b2] hover:text-white"
                  }`}
              >
                Learner's Book
              </button>
              <button
                onClick={() => setMode("Teacher")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${mode === "Teacher"
                  ? "bg-[#0ea5e9] text-white shadow-lg"
                  : "text-[#9aa6b2] hover:text-white"
                  }`}
              >
                Teacher's Guide
              </button>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-xs font-bold text-[#9aa6b2] hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all">
                Export PDF
              </button>
              <button className="px-4 py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all">
                Print Guide
              </button>
            </div>
          </div>

          {/* Rendered Content */}
          <div className={`p-8 lg:p-12 overflow-auto max-h-[80vh] ${mode === "Learner" ? "bg-[#0a0f14]" : "bg-gradient-to-br from-[#12171c] to-[#0a0f14]"}`}>
            {mode === "Learner" ? (
              <StudentTextbookRenderer
                content={learnerHtml}
                images={images}
              />
            ) : (
              <TextbookRenderer
                content={teacherHtml}
                images={images}
                showImageDescriptions={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasContent && !isGenerating && (
        <div className="bg-[#0b0f12]/40 backdrop-blur-md rounded-2xl border border-dashed border-white/10 p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500/10 rounded-3xl mb-6 ring-1 ring-sky-500/20">
            <BookIcon />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ready to curate curriculum?</h3>
          <p className="text-[#9aa6b2] max-w-md mx-auto text-sm leading-relaxed">
            Select a grade and subject from the control panel to generate high-quality, CBC-aligned curriculum materials for both students and teachers.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8">
        <div className="text-center text-xs font-medium text-[#9aa6b2]/40 tracking-widest uppercase">
          Kenyan Competency-Based Curriculum Framework • AI Integration v2.0
        </div>
      </footer>
    </div>
  );
}
