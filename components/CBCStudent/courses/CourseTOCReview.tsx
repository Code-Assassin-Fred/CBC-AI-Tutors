"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit2, Check, X, Sparkles, Loader2 } from "lucide-react";
import type { CourseChapter, GeneratedCourseTOC } from "@/lib/types";

interface CourseTOCReviewProps {
  toc: GeneratedCourseTOC;
  onBack: () => void;
  onSave: (editedChapters: CourseChapter[]) => Promise<void>;
  onCancel: () => void;
  onLessonPlanningStarted?: (courseId: string) => void;
}

export function CourseTOCReview({ toc, onBack, onSave, onCancel, onLessonPlanningStarted }: CourseTOCReviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<CourseChapter[]>(toc.chapters);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedTopics, setEditedTopics] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savingStage, setSavingStage] = useState<'saving' | 'planning' | null>(null);

  const startEdit = (chapter: CourseChapter) => {
    setEditingId(chapter.id);
    setEditedTitle(chapter.title);
    setEditedTopics(chapter.topics.join(", "));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedTitle("");
    setEditedTopics("");
  };

  const saveEdit = (chapterId: string) => {
    setChapters(prev => prev.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          title: editedTitle.trim(),
          topics: editedTopics.split(",").map(t => t.trim()).filter(Boolean),
        };
      }
      return chapter;
    }));
    cancelEdit();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavingStage('saving');
    try {
      await onSave(chapters);
      // After successful save, the parent component will receive courseId
      // and can trigger lesson planning
      setSavingStage('planning');
    } catch (err) {
      console.error('Failed to save course:', err);
      setIsSaving(false);
      setSavingStage(null);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            disabled={isSaving}
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </button>
          <DialogTitle className="text-white/95">Review Your Course</DialogTitle>
        </div>
        <p className="text-[#9aa6b2] text-sm mt-2">
          Review and edit your AI-generated course structure before saving
        </p>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Course Overview */}
        <div className="p-4 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#7c3aed]/20 shrink-0">
              <Sparkles className="h-5 w-5 text-[#a78bfa]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white/95 mb-1">{toc.courseName}</h3>
              <p className="text-sm text-[#9aa6b2] mb-2">{toc.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-[#9aa6b2]">
                <span>📚 {chapters.length} chapters</span>
                <span>⏱️ {toc.estimatedDuration}</span>
                <span>📊 {toc.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {chapters.map((chapter, index) => (
            <div 
              key={chapter.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              {editingId === chapter.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#9aa6b2] mb-1 block">Chapter Title</label>
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter chapter title"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9aa6b2] mb-1 block">Topics (comma separated)</label>
                    <Textarea
                      value={editedTopics}
                      onChange={(e) => setEditedTopics(e.target.value)}
                      rows={3}
                      className="bg-white/5 border-white/10 text-white resize-none"
                      placeholder="Topic 1, Topic 2, Topic 3"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-white/70" />
                    </button>
                    <button
                      onClick={() => saveEdit(chapter.id)}
                      className="p-1.5 hover:bg-[#7c3aed]/20 bg-[#7c3aed]/10 rounded transition-colors"
                    >
                      <Check className="h-4 w-4 text-[#a78bfa]" />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#a78bfa]">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white/95 mb-1">{chapter.title}</h4>
                        <p className="text-xs text-[#9aa6b2]">{chapter.subject}</p>
                      </div>
                      <button
                        onClick={() => startEdit(chapter)}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors shrink-0"
                      >
                        <Edit2 className="h-4 w-4 text-white/70" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {chapter.topics.map((topic, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-white/5 text-[#9aa6b2]"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-white/5 hover:bg-white/10 text-white border-white/10"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-linear-to-r from-[#7c3aed] to-[#a78bfa] hover:from-[#6d28d9] hover:to-[#9333ea] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {savingStage === 'saving' && 'Saving Course...'}
                {savingStage === 'planning' && 'Planning Lessons...'}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save & Plan Lessons
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
