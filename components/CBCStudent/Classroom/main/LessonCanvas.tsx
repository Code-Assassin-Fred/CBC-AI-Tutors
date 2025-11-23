"use client";

import React, { useState } from 'react';
import { useLesson } from '../context/LessonContext';
import LessonPlaceholder from './LessonPlaceholder';
import LessonHeader from './LessonHeader';
import LessonContent from './LessonContent';
import LessonActions from './LessonActions';
import LessonFormModal from './LessonFormModal';
import AgentWorking from './AgentWorking';
// Using shared generation state from LessonContext

export default function LessonCanvas() {
  const { lesson, generationStatus, currentAgent } = useLesson();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Keep the modal visible during planning/accepting/splitting/generating
  // by not early-returning here. We'll rely on the modal's own status views.

  if (!lesson) return <LessonPlaceholder />;

  return (
    <div className="flex flex-col space-y-6 h-full">
      <LessonHeader onCreateNewLesson={() => setIsCreateOpen(true)} />
      <LessonContent />
      <LessonActions />
      <LessonFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
