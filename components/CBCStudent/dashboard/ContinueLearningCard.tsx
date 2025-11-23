'use client';

import React from 'react';
import Card from '../shared/Card';
import Tag from '../shared/Tag';
import AvatarStack from '../shared/AvatarStack';

export default function ContinueLearningCard() {
  const progress = 78;

  const handleContinue = () => {
    console.log('Continue Learning clicked');
    // TODO: Navigate to course or resume lesson
  };

  return (
    <Card className="h-full">
      {/* Header with menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-white/95 mb-3">
            Build A Navigation Hierarchy
          </h2>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag variant="purple">UI Design</Tag>
            <Tag variant="cyan">App</Tag>
            <Tag variant="green">Illustration</Tag>
          </div>
        </div>
        
        {/* Menu button */}
        <button
          className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="More options"
        >
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-[#9aa6b2] line-clamp-2 mb-6">
        Learn how to structure your app&apos;s navigation and create intuitive user flows. Master the principles of information architecture.
      </p>

      {/* Participants */}
      <div className="mb-6">
        <p className="text-xs text-[#9aa6b2] mb-3">Participants</p>
        <AvatarStack max={4} size={36} />
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#9aa6b2]">Course Progress</p>
          <p className="text-sm font-semibold text-white/95">{progress}%</p>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-[#0b0f12] rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-linear-to-r from-[#6b21a8] to-[#7c3aed] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Lesson Info */}
      <div className="mb-6 p-3 rounded-lg bg-[#0b0f12] border border-white/6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9aa6b2] mb-1">Current Lesson</p>
            <p className="text-sm font-medium text-white/90">Navigation Patterns</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9aa6b2] mb-1">Time Remaining</p>
            <p className="text-sm font-medium text-white/90">12 min</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleContinue}
        className="w-full py-3 rounded-lg border border-[#7c3aed] text-[#7c3aed] font-medium text-sm hover:bg-linear-to-r hover:from-[#6b21a8] hover:to-[#7c3aed] hover:text-white hover:border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label="Continue learning"
      >
        Continue Learning →
      </button>
    </Card>
  );
}
