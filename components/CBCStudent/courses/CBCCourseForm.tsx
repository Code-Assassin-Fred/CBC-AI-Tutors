"use client";

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useCourseGenerator } from "@/hooks/useCourseGenerator";
import { useLessonPlanner } from "@/hooks/useLessonPlanner";
import curriculumData from '@/components/CBCStudent/cbc_curriculum_simple.json';
import type { CourseSubject, CourseChapter } from "@/lib/types";
import { CourseTOCReview } from "./CourseTOCReview";

interface CBCCourseFormProps {
  onBack: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

type CurriculumGrade = {
  programme: string;
  grade_number: number;
  subjects: {
    name: string;
    strands: {
      id: string;
      name: string;
      description: string;
      subtopics: string[];
    }[];
  }[];
};

export function CBCCourseForm({ onBack, onSuccess, onCancel }: CBCCourseFormProps) {
  const curriculum = useMemo(() => curriculumData as CurriculumGrade[], []);
  
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number>(6); // Default to Grade 7
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showTOC, setShowTOC] = useState(false);
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  
  const { isGenerating, error, generatedTOC, generateCBCCourse, saveCourse, reset } = useCourseGenerator();
  const { planLessons, isPlanning } = useLessonPlanner();

  const currentGrade = useMemo(() => curriculum[selectedGradeIndex], [curriculum, selectedGradeIndex]);
  const availableSubjects = useMemo(() => currentGrade?.subjects.map(s => s.name) || [], [currentGrade]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const selectAllSubjects = () => {
    setSelectedSubjects(availableSubjects);
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    try {
      // Build curriculum context for selected subjects
      const selectedSubjectsData: CourseSubject[] = currentGrade.subjects
        .filter(s => selectedSubjects.includes(s.name))
        .map(s => ({
          subject: s.name,
          strands: s.strands.map(strand => ({
            id: strand.id,
            name: strand.name,
            description: strand.description,
            subtopics: strand.subtopics,
          })),
        }));

      const curriculumContext = {
        grade: currentGrade.programme.replace('Kenya Competency-Based Curriculum (CBC) - ', ''),
        subjects: selectedSubjectsData,
      };

      await generateCBCCourse({
        grade: currentGrade.programme.replace('Kenya Competency-Based Curriculum (CBC) - ', ''),
        subjects: selectedSubjects,
        curriculumContext,
      });

      setShowTOC(true);
    } catch (err) {
      console.error('Failed to generate course:', err);
    }
  };

  // Show generating state
  // Show lesson planning state
  if (isPlanning) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-white/95">Planning Lessons</DialogTitle>
          <p className="text-[#9aa6b2] text-sm mt-2">
            Agent 2 is breaking chapters into detailed lessons and scheduling them…
          </p>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-[#7c3aed] border-t-transparent animate-spin" />
          </div>

          <div className="text-center space-y-2">
            <p className="text-white/90 font-medium">Planning detailed lessons…</p>
            <p className="text-sm text-white/60">
              Creating lesson breakdowns per chapter and building a weekly schedule
            </p>
          </div>

          <div className="w-full max-w-md mt-6">
            <div className="bg-[#0E0E10] rounded-lg p-4 border border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
                  <span>Generating per-chapter lesson plans…</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span>Estimating durations and depth…</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span>Scheduling lessons across weeks…</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10 mt-4"
          >
            Cancel
          </Button>
        </div>
      </>
    );
  }

  // Show generating state
  if (isGenerating) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-white/95">Generating Course</DialogTitle>
          <p className="text-[#9aa6b2] text-sm mt-2">
            AI agent is curating your course...
          </p>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-[#7c3aed] border-t-transparent animate-spin" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-white/90 font-medium">Agent is curating course for you...</p>
            <p className="text-sm text-white/60">
              Analyzing curriculum and creating comprehensive course structure
            </p>
          </div>

          <div className="w-full max-w-md mt-6">
            <div className="bg-[#0E0E10] rounded-lg p-4 border border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
                  <span>Analyzing selected subjects...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span>Structuring course chapters...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span>Aligning with CBC curriculum...</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10 mt-4"
          >
            Cancel
          </Button>
        </div>
      </>
    );
  }

  const handleSaveCourse = async (editedChapters: CourseChapter[]) => {
    if (!generatedTOC) return;

    try {
      // Build subjects data for saving
      const subjectsData: CourseSubject[] = currentGrade.subjects
        .filter(s => selectedSubjects.includes(s.name))
        .map(s => ({
          subject: s.name,
          strands: s.strands.map(strand => ({
            id: strand.id,
            name: strand.name,
            description: strand.description,
            subtopics: strand.subtopics,
          })),
        }));

      const result = await saveCourse({
        name: generatedTOC.courseName,
        grade: currentGrade.programme.replace('Kenya Competency-Based Curriculum (CBC) - ', ''),
        subjects: subjectsData,
        description: generatedTOC.description,
        courseType: 'cbc',
        chapters: editedChapters,
        estimatedDuration: generatedTOC.estimatedDuration,
      });

      setSavedCourseId(result.courseId);

      // Close TOC modal before starting planning so the UI updates immediately
      setShowTOC(false);

      // Automatically trigger lesson planning
      console.log('[CBCCourseForm] Starting lesson planning for course:', result.courseId);
      await planLessons({
        courseId: result.courseId,
        lessonsPerWeek: 4,
      });

      console.log('[CBCCourseForm] Lesson planning completed');
      onSuccess();
    } catch (err) {
      console.error('Failed to save course or plan lessons:', err);
      // Still call onSuccess even if lesson planning fails - course was saved
      if (savedCourseId) {
        onSuccess();
      }
    }
  };

  if (showTOC && generatedTOC) {
    return (
      <CourseTOCReview
        toc={generatedTOC}
        onBack={() => {
          setShowTOC(false);
          reset();
        }}
        onSave={handleSaveCourse}
        onCancel={onCancel}
      />
    );
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </button>
          <DialogTitle className="text-white/95">Create CBC Course</DialogTitle>
        </div>
        <p className="text-[#9aa6b2] text-sm mt-2">
          Select your grade and the subjects you want to include in your course
        </p>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Grade Selection */}
        <div>
          <Label className="text-white/90 mb-2 block">Grade</Label>
          <select
            className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50"
            value={selectedGradeIndex}
            onChange={(e) => {
              setSelectedGradeIndex(Number(e.target.value));
              setSelectedSubjects([]); // Reset subjects when grade changes
            }}
          >
            {curriculum.map((g, idx) => (
              <option key={idx} value={idx} className="bg-[#0E0E10]">
                {g.programme.replace('Kenya Competency-Based Curriculum (CBC) - ', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-white/90">Subjects ({selectedSubjects.length} selected)</Label>
            <button
              onClick={selectAllSubjects}
              className="text-sm text-[#7c3aed] hover:text-[#a78bfa] transition-colors"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
            {availableSubjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`
                    relative px-4 py-3 rounded-lg border transition-all text-left
                    ${isSelected 
                      ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white' 
                      : 'bg-white/5 border-white/10 text-[#9aa6b2] hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <div className={`
                      mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center
                      ${isSelected ? 'bg-[#7c3aed] border-[#7c3aed]' : 'border-white/30'}
                    `}>
                      {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium">{subject}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info box */}
        {selectedSubjects.length > 0 && (
          <div className="p-4 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30">
            <p className="text-sm text-white/90">
              <strong>Selected:</strong> {selectedSubjects.join(', ')}
            </p>
            <p className="text-xs text-[#9aa6b2] mt-1">
              AI will create a comprehensive course covering all curriculum topics for these subjects
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/50">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedSubjects.length === 0}
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Course'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
