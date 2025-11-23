"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { useLesson } from '../context/LessonContext';
import Card from '@/components/CBCStudent/shared/Card';
import AgentWorking from './AgentWorking';
import { useLessonGenerator } from '@/hooks/useLessonGenerator';
import type { PlanResponsePayload } from '@/lib/ai/types';
import curriculumData from '@/components/CBCStudent/cbc_curriculum_simple.json';

type Props = {
  open: boolean;
  onClose: () => void;
};

// Type definitions for curriculum structure
type CurriculumStrand = {
  id: string;
  name: string;
  subtopics: string[];
};

type CurriculumSubject = {
  name: string;
  strands: CurriculumStrand[];
};

type CurriculumGrade = {
  programme: string;
  grade_number: number;
  subjects: CurriculumSubject[];
};

export default function LessonFormModal({ open, onClose }: Props) {
  const { setLesson, setGenerationStatus, setCurrentAgent: setCtxAgent, setGenerationProgress, saveLesson } = useLesson();
  const {
    status,
    error,
    progress,
    currentAgent,
    toc,
    final,
    lessonId,
    reset,
    generateTOC,
    acceptTOC,
    splitWorkload,
    startGeneration,
    cancelGeneration,
    replanTOC,
    adoptLesson,
  } = useLessonGenerator({
    onProgress: (evt) => {
      if (evt.agent) setCtxAgent(evt.agent);
      if (evt.type === 'subtask_complete') {
        setGenerationProgress({ current: evt.data?.order || 0, total: evt.data?.totalSubtasks || 0 });
      }
    },
    onComplete: () => {
      setCtxAgent(null);
      setGenerationStatus('completed');
    },
    onError: () => {
      setGenerationStatus('error');
      setCtxAgent(null);
    }
  });

  // Load curriculum data from JSON
  const curriculum = useMemo(() => curriculumData as CurriculumGrade[], []);

  // State for selections
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number>(6); // Default to Grade 7
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0);
  const [selectedStrandId, setSelectedStrandId] = useState<string>('');
  const [specification, setSpecification] = useState<string>('');
  const [replanNotes, setReplanNotes] = useState<string>('');
  const [totalTokens, setTotalTokens] = useState<number>(12000);
  const [editableTOC, setEditableTOC] = useState<PlanResponsePayload['toc'] | null>(null);

  // Derive current selections
  const currentGrade = useMemo(() => curriculum[selectedGradeIndex], [curriculum, selectedGradeIndex]);
  const currentSubject = useMemo(() => currentGrade?.subjects[selectedSubjectIndex], [currentGrade, selectedSubjectIndex]);
  const currentStrand = useMemo(() => 
    currentSubject?.strands.find(s => s.id === selectedStrandId),
    [currentSubject, selectedStrandId]
  );

  // Get display values for API calls
  const grade = currentGrade?.programme || 'Grade 7';
  const subject = currentSubject?.name || '';
  const topic = currentStrand?.name || '';
  const strandId = currentStrand?.id || '';

  // Build curriculum context for planner
  const curriculumContext = useMemo(() => {
    if (!currentStrand) return '';
    
    const subtopicsText = currentStrand.subtopics
      .map((st, i) => `${i + 1}. ${st}`)
      .join('\n');
    
    return `Strand: ${currentStrand.name}
Subtopics from CBC curriculum:
${subtopicsText}

Note: These are the official subtopics from the Kenya CBC curriculum. Structure your lesson around these while maintaining pedagogical flow.`;
  }, [currentStrand]);

  // Ensure defaults are valid when grade changes
  useEffect(() => {
    if (currentGrade && currentGrade.subjects.length > 0) {
      // Reset subject to first if current index is invalid
      if (selectedSubjectIndex >= currentGrade.subjects.length) {
        setSelectedSubjectIndex(0);
        setSelectedStrandId('');
      }
    }
  }, [selectedGradeIndex, currentGrade, selectedSubjectIndex]);

  // Reset strand when subject changes
  useEffect(() => {
    if (currentSubject && currentSubject.strands.length > 0) {
      // If current strand is not in this subject, reset to first
      const strandExists = currentSubject.strands.some(s => s.id === selectedStrandId);
      if (!strandExists) {
        setSelectedStrandId(currentSubject.strands[0]?.id || '');
      }
    }
  }, [selectedSubjectIndex, currentSubject, selectedStrandId]);

  // No subtopic cascading required
  

  // When generation completes, persist lesson into context and close (run once per lessonId)
  const savedOnceRef = useRef<string | null>(null);
  useEffect(() => {
    if (status !== 'completed' || !final || !lessonId) return;
    // guard: only save when we have real content (prevents placeholder saves)
    const contentText = (final?.content || '').trim();
    if (contentText.length < 60) return;
    if (savedOnceRef.current === lessonId) return; // already handled
    savedOnceRef.current = lessonId;

    const toSave = {
      id: lessonId,
      grade,
      subject,
      topic,
      specification,
      content: contentText,
    } as const;

    // Update context immediately for UI
    setLesson(toSave as any);

    // Persist immediately (auto-save in context will dedupe too)
    (async () => {
      try {
        await saveLesson(toSave as any);
      } catch {
        // ignore; errors are logged in saveLesson
      } finally {
        onClose();
      }
    })();
    // Only run once per lessonId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, final, lessonId, grade, subject, topic, specification]);

  // Reset state when opening modal to avoid stale errors/status carrying over
  useEffect(() => {
    if (open) {
      reset();
      setGenerationStatus('idle');
      setCtxAgent(null);
      setGenerationProgress({ current: 0, total: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Mirror status/agent to context so other components can react
  useEffect(() => {
    setGenerationStatus(status);
  }, [status, setGenerationStatus]);
  useEffect(() => {
    setCtxAgent(currentAgent ?? null);
  }, [currentAgent, setCtxAgent]);

  const handleGenerateTOC = async () => {
    try {
      const data = await generateTOC({ 
        grade, 
        subject, 
        topic, 
        specification,
        curriculumContext 
      });
      setEditableTOC(data.toc);
    } catch (e) {
      // noop, error shown below
    }
  };

  const handleAcceptAndGenerate = async () => {
    try {
      let newLessonId: string | undefined;
      
      // If user edited the TOC, send that to the new accept endpoint
      if (editableTOC && editableTOC.length > 0) {
        const token = await (await import('@/lib/firebase')).auth.currentUser?.getIdToken();
        const response = await fetch('/api/tutor/plan/toc/accept', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grade, subject, topic, specification, toc: editableTOC }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Accept failed');
        }
        
        const res = await response.json();
        newLessonId = res.lessonId;
        if (newLessonId) {
          adoptLesson(newLessonId);
        }
      } else {
        newLessonId = await acceptTOC();
      }
      
      if (!newLessonId) {
        throw new Error('Failed to create lesson');
      }
      
      // Now proceed with split and generation using the new lessonId directly
      await splitWorkload(totalTokens, newLessonId);
      await startGeneration(newLessonId);
    } catch (e) {
      console.error('Accept and generate error:', e);
      // noop, error shown below
    }
  };

  const handleReplan = async () => {
    try {
      await replanTOC(replanNotes || undefined, undefined);
      setReplanNotes('');
    } catch (e) {
      // noop
    }
  };

  const safeClose = async () => {
    // If generation is active, cancel it before closing
    if (status === 'generating') {
      try { await cancelGeneration(); } catch { /* ignore */ }
    }
    reset();
    setGenerationStatus('idle');
    setCtxAgent(null);
    setGenerationProgress({ current: 0, total: 0 });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-2xl rounded-2xl bg-[#111113]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Lesson</h3>
          <button onClick={safeClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {/* Step 1: Input Form */}
        {status === 'idle' && !toc && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Grade</label>
                <select
                  className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2"
                  value={selectedGradeIndex}
                  onChange={(e) => setSelectedGradeIndex(Number(e.target.value))}
                >
                  {curriculum.map((g, idx) => (
                    <option key={idx} value={idx}>
                      {g.programme.replace('Kenya Competency-Based Curriculum (CBC) - ', '')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Subject</label>
                <select
                  className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2"
                  value={selectedSubjectIndex}
                  onChange={(e) => setSelectedSubjectIndex(Number(e.target.value))}
                  disabled={!currentGrade}
                >
                  {currentGrade?.subjects.map((s, idx) => (
                    <option key={idx} value={idx}>
                      {s.name}
                    </option>
                  )) || <option value="">No subjects</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Strand/Topic</label>
              <select
                className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2"
                value={selectedStrandId}
                onChange={(e) => setSelectedStrandId(e.target.value)}
                disabled={!currentSubject}
              >
                {currentSubject?.strands.length === 0 ? (
                  <option value="" disabled>
                    No strands available
                  </option>
                ) : (
                  currentSubject?.strands.map((strand) => (
                    <option key={strand.id} value={strand.id}>
                      {strand.name}
                    </option>
                  )) || <option value="">Select a strand</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                Additional Specification (Optional)
              </label>
              <textarea
                className="w-full bg-[#0E0E10] border border-white/10 rounded-xl px-3 py-2 min-h-24 resize-y"
                placeholder="Add any specific focus areas, learning objectives, or constraints beyond the curriculum subtopics..."
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">
                Cancel
              </Button>
              <Button onClick={handleGenerateTOC} className="bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                Generate Table of Contents
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Planning / Splitting indicators */}
        {(status === 'planning' || status === 'accepting' || status === 'splitting') && (
          <div className="space-y-3">
            <AgentWorking agent={currentAgent ?? undefined} />
            <p className="text-center text-white/70 text-sm capitalize">{status}...</p>
            <div className="flex items-center justify-end gap-3">
              <Button onClick={onClose} className="bg-transparent border border-white/10 hover:bg-white/5">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: TOC Review */}
        {editableTOC && toc && status === 'idle' && !final && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Review Table of Contents</h4>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {editableTOC.map((chapter: PlanResponsePayload['toc'][number], idx: number) => (
                <div key={chapter.chapterId} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm">Chapter {idx + 1}:</span>
                    <input
                      className="flex-1 bg-[#0E0E10] border border-white/10 rounded px-2 py-1 text-white text-sm"
                      value={chapter.title}
                      onChange={(e) => {
                        const next = [...editableTOC];
                        next[idx] = { ...chapter, title: e.target.value };
                        setEditableTOC(next);
                      }}
                    />
                  </div>
                  <ul className="list-disc list-inside text-sm text-white/70 mt-1">
                    {chapter.subtopics.map((s: string, i: number) => (
                      <li key={i}>
                        <input
                          className="w-full bg-transparent border-b border-white/10 focus:outline-none focus:border-white/20 text-white/80"
                          value={s}
                          onChange={(e) => {
                            const next = [...editableTOC];
                            const subs = [...chapter.subtopics];
                            subs[i] = e.target.value;
                            next[idx] = { ...chapter, subtopics: subs };
                            setEditableTOC(next);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Replan notes (optional)</label>
              <input
                type="text"
                value={replanNotes}
                onChange={(e) => setReplanNotes(e.target.value)}
                placeholder="e.g., Make it more concise, add more examples"
                className="w-full bg-[#0E0E10] border border-white/10 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button onClick={handleReplan} className="bg-transparent border border-white/10 hover:bg-white/5">
                Replan
              </Button>
              <Button onClick={handleAcceptAndGenerate} className="bg-green-600 hover:bg-green-700 text-white">
                Accept & Generate
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generation */}
        {status === 'generating' && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Generating Lesson</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Progress</span>
                <span>{progress.current} / {progress.total} sections</span>
              </div>
              <div className="w-full bg-[#0E0E10] rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="text-sm text-white/80">
              Active agent: <span className="font-medium">{currentAgent ?? '...'}</span>
            </div>
            <AgentWorking agent={currentAgent ?? undefined} />
            <div className="flex items-center justify-end gap-3">
              <Button onClick={async () => { await cancelGeneration(); onClose(); }} className="bg-red-600 hover:bg-red-700 text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
