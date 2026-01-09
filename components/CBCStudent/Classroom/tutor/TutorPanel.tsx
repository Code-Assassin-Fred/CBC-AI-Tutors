"use client";

import React from 'react';
import { useTutor } from '@/lib/context/TutorContext';
import { useGamification } from '@/lib/context/GamificationContext';
import LoadingState from './LoadingState';
import IdleState from './IdleState';
import TutorModeSelector from './TutorModeSelector';
import ReadModeView from './modes/ReadModeView';
import PodcastModeView from './modes/PodcastModeView';
import ImmersiveModeView from './modes/ImmersiveModeView';
import QuizModeView from './modes/QuizModeView';
import XPPopup from '@/components/gamification/XPPopup';

interface TutorPanelProps {
  mobileExpanded?: boolean;
}

export default function TutorPanel({ mobileExpanded = false }: TutorPanelProps) {
  const {
    mode,
    learningSubMode,
    context,
    preparedContent,
    quizContent,
    loadingProgress,
    setLearningSubMode,
    exitMode,
  } = useTutor();
  const { xpPopup, hideXPPopup } = useGamification();

  // XP Popup wrapper - renders XP animation on top of any mode
  const xpPopupElement = xpPopup && (
    <XPPopup
      amount={xpPopup.amount}
      x={xpPopup.x}
      y={xpPopup.y}
      onComplete={hideXPPopup}
    />
  );

  // Loading state
  if (mode === 'loading' && loadingProgress) {
    return (
      <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
        <LoadingState progress={loadingProgress} />
        {xpPopupElement}
      </div>
    );
  }

  // Quiz mode
  if (mode === 'quiz' && quizContent) {
    return (
      <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
        {/* Quiz Header */}
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
            Quiz Mode
          </h3>
          <button
            onClick={exitMode}
            className="text-[10px] font-bold text-white/40 hover:text-white/60 uppercase tracking-widest transition-colors"
          >
            Exit Quiz
          </button>
        </div>

        <div className="flex-1 overflow-hidden mt-4">
          <QuizModeView quiz={quizContent} />
        </div>
        {xpPopupElement}
      </div>
    );
  }

  // Learning mode
  if (mode === 'learning' && preparedContent && learningSubMode) {
    return (
      <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
        {/* Learning Header */}
        <div className="pb-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
              {context?.substrand || 'Learning'}
            </h3>
            <button
              onClick={exitMode}
              className="text-[10px] font-bold text-white/40 hover:text-white/60 uppercase tracking-widest transition-colors"
            >
              Exit
            </button>
          </div>

          <TutorModeSelector
            currentMode={learningSubMode}
            onModeChange={setLearningSubMode}
          />
        </div>

        {/* Mode Content */}
        <div className="flex-1 overflow-hidden mt-4">
          {learningSubMode === 'explanation' && (
            <ReadModeView content={preparedContent.readContent} />
          )}
          {learningSubMode === 'podcast' && (
            <PodcastModeView script={preparedContent.podcastScript} />
          )}
          {learningSubMode === 'practice' && (
            <ImmersiveModeView content={preparedContent.immersiveContent} />
          )}
        </div>
        {xpPopupElement}
      </div>
    );
  }

  // Idle state (default)
  return (
    <div className="flex flex-col h-full pb-[env(safe-area-inset-bottom)]">
      {/* Header - shown on desktop or when mobile is expanded */}
      <div className={`${mobileExpanded ? 'block' : 'hidden sm:block'} pb-3 border-b border-white/10`}>
        <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">AI Tutor</h3>
      </div>

      {/* Mobile collapsed: Just show "AI Tutor" text centered */}
      {!mobileExpanded && (
        <div className="flex sm:hidden items-center justify-center h-full">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">AI Tutor</h3>
        </div>
      )}

      {/* Desktop or Mobile expanded: Show full IdleState content */}
      <div className={`${mobileExpanded ? 'flex' : 'hidden sm:flex'} flex-1 items-center justify-center`}>
        <IdleState />
      </div>

      {xpPopupElement}
    </div>
  );
}
