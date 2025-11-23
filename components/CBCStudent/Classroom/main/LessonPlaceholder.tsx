"use client";

import React, { useState } from 'react';
import LessonFormModal from '@/components/CBCStudent/Classroom/main/LessonFormModal';
import Button from '@/components/ui/Button';

export default function LessonPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)] text-center">
      <h2 className="text-2xl font-semibold mb-3">Welcome to Your Classroom</h2>
      <p className="text-white/60 max-w-md mb-6">
        Start learning by adding your first lesson. Choose your grade, subject, topic, and add a specification to tailor your content.
      </p>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-xl font-medium shadow-[0_0_10px_rgba(124,58,237,0.15)]"
      >
        Add Lesson
      </Button>

      <LessonFormModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
