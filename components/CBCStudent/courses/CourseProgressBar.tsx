"use client";

interface CourseProgressBarProps {
  progress: number;
  completed?: number;
  total?: number;
}

export function CourseProgressBar({ progress, completed, total }: CourseProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#9aa6b2]">Progress</span>
        <div className="flex items-center gap-2">
          {completed !== undefined && total !== undefined && (
            <span className="text-[#9aa6b2] text-xs">{completed}/{total} chapters</span>
          )}
          <span className="text-white/90 font-medium">{progress}%</span>
        </div>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
