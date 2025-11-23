import React from 'react';
import Card from '../shared/Card';
import ProgressCircle from '../shared/ProgressCircle';

export default function ProgressSummary() {
  const progressData = [
    {
      value: 75,
      label: 'In Progress',
      count: 34,
      color: '#7c3aed'
    },
    {
      value: 45,
      label: 'Completed',
      count: 72,
      color: '#06b6d4'
    },
    {
      value: 58,
      label: 'Upcoming',
      count: 18,
      color: '#f59e0b'
    }
  ];

  return (
    <Card className="flex-1 min-w-0">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white/95">Progress</h2>
        <p className="text-xs text-[#9aa6b2] mt-0.5">Your learning journey</p>
      </div>

      {/* Two-column layout: Circles (60%) | Continue Learning (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
        {/* Progress Circles - left side */}
        <div className="lg:col-span-3 min-w-0 h-full flex items-center">
          <div className="flex items-start justify-between gap-3 w-full">
            {progressData.map((item, index) => (
              <div key={index} className="flex flex-col items-center min-w-0">
                <ProgressCircle
                  value={item.value}
                  size={80}
                  strokeWidth={5}
                  color={item.color}
                />
                <p className="text-xs font-medium text-white/90 mt-2">{item.label}</p>
                <p className="text-[11px] text-[#9aa6b2] mt-0.5">{item.count} courses</p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Learning - right side */}
        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-white/8 pt-4 lg:pt-0 lg:pl-5 min-w-0 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white/95 leading-tight">Continue learning</h3>
              <p className="text-[11px] text-[#9aa6b2] mt-0.5 leading-tight">Latest topic you were learning</p>
            </div>
            <button
              className="px-2.5 py-1.5 rounded-lg border border-[#7c3aed] text-[#7c3aed] font-medium text-[11px] shrink-0 hover:bg-linear-to-r hover:from-[#6b21a8] hover:to-[#7c3aed] hover:text-white hover:border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              aria-label="Continue learning"
            >
              Continue →
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#0b0f12] border border-white/8 ring-1 ring-white/5">
            <div className="flex flex-col gap-2.5">

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-[#9aa6b2]">Course Progress</p>
                  <p className="text-[11px] font-semibold text-white/90">78%</p>
                </div>
                <div className="relative w-full h-1.5 bg-[#0a0f14] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-linear-to-r from-[#6b21a8] via-[#7c3aed] to-[#a855f7] rounded-full"
                    style={{ width: `78%` }}
                  >
                    <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                  </div>
                </div>
              </div>

              {/* Lesson meta */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-[#9aa6b2] mb-0.5">Current Lesson</p>
                  <p className="text-sm text-white/90 leading-tight">Navigation Patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
