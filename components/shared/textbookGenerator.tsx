"use client";
import { useState, useEffect } from "react";
import TextbookRenderer from "@/components/TextbookRenderer";
import contentJson from "@/content.json";

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

const LoadingSpinner = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ---- Component ----
export default function GeneratePage() {
  const grades = Object.keys(contentJson);

  const [selectedGrade, setSelectedGrade] = useState<string>(grades[0] || "");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [strands, setStrands] = useState<string[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<string>("");

  const [learnerHtml, setLearnerHtml] = useState<string>("");
  const [teacherHtml, setTeacherHtml] = useState<string>("");
  const [mode, setMode] = useState<"Learner" | "Teacher">("Learner");
  const [loading, setLoading] = useState(false);

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

  // ---- Generate strand ----
  const generateStrand = async () => {
    if (!selectedGrade || !selectedSubject || !selectedStrand) return;
    setLoading(true);
    setLearnerHtml("");
    setTeacherHtml("");

    try {
      const res = await fetch("/api/generate-strand", {
        method: "POST",
        body: JSON.stringify({
          grade: selectedGrade,
          subject: selectedSubject,
          strand: selectedStrand,
        }),
      });
      const data = await res.json();

      setLearnerHtml(data.student_html || "");
      setTeacherHtml(data.teacher_html || "");
      setMode("Learner");
    } catch (err) {
      console.error(err);
      alert("Error generating strand. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const hasContent = learnerHtml || teacherHtml;

  // ---- Render ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-lg">
              <BookIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Content Generator</h1>
              <p className="text-slate-400 text-sm">Kenyan Curriculum Materials</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          {/* Breadcrumb */}
          {selectedGrade && selectedSubject && selectedStrand && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
              <span className="font-medium text-slate-700">{selectedGrade}</span>
              <span>→</span>
              <span className="font-medium text-slate-700">{selectedSubject}</span>
              <span>→</span>
              <span className="font-medium text-teal-600">{selectedStrand}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-end gap-5">
            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              {/* Grade */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                    <GraduationIcon />
                  </span>
                  Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
                >
                  {grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                    <BookIcon />
                  </span>
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Strand */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="p-1.5 bg-slate-100 rounded-md text-slate-600">
                    <LayersIcon />
                  </span>
                  Strand
                </label>
                <select
                  value={selectedStrand}
                  onChange={(e) => setSelectedStrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
                >
                  {strands.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateStrand}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-teal-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 min-w-[180px]"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Generating...</span>
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-full mb-4">
              <svg className="w-8 h-8 text-teal-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Generating Content</h3>
            <p className="text-slate-500">Creating your curriculum materials. This may take a moment...</p>
          </div>
        )}

        {/* Content Area */}
        {hasContent && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Mode Toggle Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-1 p-1 bg-slate-200 rounded-lg">
                <button
                  onClick={() => setMode("Learner")}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    mode === "Learner"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  📘 Learner's Book
                </button>
                <button
                  onClick={() => setMode("Teacher")}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    mode === "Teacher"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  📗 Teacher's Guide
                </button>
              </div>

              {/* Export buttons placeholder */}
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                  Print
                </button>
                <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                  Export PDF
                </button>
              </div>
            </div>

            {/* Rendered Content */}
            <div className="p-8 overflow-auto max-h-[80vh] bg-gradient-to-br from-[#0E0E10] to-[#1a1a1c]">
              <TextbookRenderer
                content={mode === "Learner" ? learnerHtml : teacherHtml}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasContent && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <BookIcon />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Content Generated</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Select a grade, subject, and strand from the options above, then click "Generate Strand" to create curriculum content.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6 mt-auto">
        <div className="text-center text-sm text-slate-400">
          Content aligned with Kenya's Competency-Based Curriculum
        </div>
      </footer>
    </div>
  );
}