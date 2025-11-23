"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Sparkles } from "lucide-react";
import { CBCCourseForm } from "./CBCCourseForm";
import { CustomCourseForm } from "./CustomCourseForm";

interface CourseCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCourseCreated: () => void;
}

type Step = 'choice' | 'cbc' | 'custom';

export function CourseCreationModal({ open, onClose, onCourseCreated }: CourseCreationModalProps) {
  const [step, setStep] = useState<Step>('choice');

  const handleClose = () => {
    setStep('choice');
    onClose();
  };

  const handleCourseCreated = () => {
    handleClose();
    onCourseCreated();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/10 text-white max-h-[90vh] overflow-y-auto">
        {step === 'choice' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-white/95 text-2xl">Create a New Course</DialogTitle>
              <p className="text-[#9aa6b2] text-sm mt-2">
                Choose how you'd like to create your learning journey
              </p>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => setStep('cbc')}
                className="p-6 rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#a78bfa]/10 hover:from-[#7c3aed]/30 hover:to-[#a78bfa]/20 transition-all border border-white/10 text-left group"
              >
                <div className="flex flex-col items-start gap-3">
                  <div className="p-3 rounded-lg bg-[#7c3aed]/20 group-hover:bg-[#7c3aed]/30 transition-colors">
                    <BookOpen className="h-6 w-6 text-[#a78bfa]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">CBC Curriculum Course</h3>
                    <p className="text-sm text-[#9aa6b2] leading-relaxed">
                      AI generates a complete course aligned with Kenya's CBC for your grade and subjects
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('custom')}
                className="p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-left group"
              >
                <div className="flex flex-col items-start gap-3">
                  <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Sparkles className="h-6 w-6 text-[#9aa6b2]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white/95 text-lg mb-2">Custom Course</h3>
                    <p className="text-sm text-[#9aa6b2] leading-relaxed">
                      AI generates a personalized course based on your specific learning goals and interests
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'cbc' && (
          <CBCCourseForm 
            onBack={() => setStep('choice')}
            onSuccess={handleCourseCreated}
            onCancel={handleClose}
          />
        )}

        {step === 'custom' && (
          <CustomCourseForm 
            onBack={() => setStep('choice')}
            onSuccess={handleCourseCreated}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
