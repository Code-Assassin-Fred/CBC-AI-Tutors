"use client";
import { useState, useEffect } from "react";
import TextbookRenderer from "@/components/admin/TextbookRenderer";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg shadow-lg">
                <BookIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">AI Content Generator</h1>
                <p className="text-white/50 text-sm">Kenyan Curriculum Materials</p>
              </div>
            </div>

            {/* Streaming toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-white/60">Show AI Progress</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={useStreaming}
                    onChange={(e) => setUseStreaming(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-teal-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Toolbar */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5">
          {/* Breadcrumb */}
          {selectedGrade && selectedSubject && selectedStrand && (
            <div className="flex items-center gap-2 text-sm text-white/50 mb-4 pb-4 border-b border-white/10">
              <span className="font-medium text-white/70">{selectedGrade}</span>
              <span>→</span>
              <span className="font-medium text-white/70">{selectedSubject}</span>
              <span>→</span>
              <span className="font-medium text-teal-400">{selectedStrand}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              {/* Grade */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
                  <span className="p-1.5 bg-white/10 rounded-md text-white/60">
                    <GraduationIcon />
                  </span>
                  Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-white/20 disabled:opacity-50"
                >
                  {grades.map((g) => (
                    <option key={g} value={g} className="bg-slate-800">{g}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
                  <span className="p-1.5 bg-white/10 rounded-md text-white/60">
                    <BookIcon />
                  </span>
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-white/20 disabled:opacity-50"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s} className="bg-slate-800">{s}</option>
                  ))}
                </select>
              </div>

              {/* Strand */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
                  <span className="p-1.5 bg-white/10 rounded-md text-white/60">
                    <LayersIcon />
                  </span>
                  Strand
                </label>
                <select
                  value={selectedStrand}
                  onChange={(e) => setSelectedStrand(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-white/20 disabled:opacity-50"
                >
                  {strands.map((s) => (
                    <option key={s} value={s} className="bg-slate-800">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={startGeneration}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-teal-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 min-w-[180px]"
            >
              {isGenerating ? (
                <>
                  <RobotIcon />
                  <span>AI Working...</span>
                </>
              ) : (
                <>
                  <SparklesIcon />
                  <span>Generate Strand</span>
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
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            {/* Mode Toggle Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/20 border-b border-white/10">
              <div className="flex items-center gap-1 p-1 bg-white/10 rounded-lg">
                <button
                  onClick={() => setMode("Learner")}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${mode === "Learner"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Learner's Book
                </button>
                <button
                  onClick={() => setMode("Teacher")}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${mode === "Teacher"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                    }`}
                >
                  Teacher's Guide
                </button>
              </div>

              {/* Export buttons */}
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  Print
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  Export PDF
                </button>
              </div>
            </div>

            {/* Rendered Content */}
            <div className="p-8 overflow-auto max-h-[80vh] bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
              <TextbookRenderer
                content={mode === "Learner" ? learnerHtml : teacherHtml}
                images={images}
                showImageDescriptions={true}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasContent && !isGenerating && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <BookIcon />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Content Generated</h3>
            <p className="text-white/50 max-w-md mx-auto">
              Select a grade, subject, and strand from the options above, then click "Generate Strand" to create curriculum content with real-time AI progress.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6 mt-auto">
        <div className="text-center text-sm text-white/30">
          Content aligned with Kenya's Competency-Based Curriculum
        </div>
      </footer>
    </div>
  );
}