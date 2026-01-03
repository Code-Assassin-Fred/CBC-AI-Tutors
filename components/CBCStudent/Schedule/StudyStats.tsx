"use client";

import { useSchedule } from '@/lib/context/ScheduleContext';
import { useMemo } from 'react';

export default function StudyStats() {
    const { streak, daySchedules } = useSchedule();

    const stats = useMemo(() => {
        const totalMinutes = daySchedules.reduce((sum, day) => {
            return sum + day.blocks.filter(b => b.completed).reduce((s, b) => s + (b.actualDuration || b.duration), 0);
        }, 0);

        const plannedMinutes = daySchedules.reduce((sum, day) => sum + day.totalMinutes, 0);
        const completionRate = plannedMinutes > 0 ? Math.round((totalMinutes / plannedMinutes) * 100) : 0;

        return {
            totalHours: (totalMinutes / 60).toFixed(1),
            completionRate,
            activeDays: streak?.weeklyStudyDays?.filter(d => d === 1).length || 0,
        };
    }, [daySchedules, streak]);

    // Simple heatmap data (last 4 weeks - mock since we only have weekly context usually)
    const weeks = [1, 2, 3, 4];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Main Stat Cards */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0ea5e9]/10 rounded-full blur-2xl group-hover:bg-[#0ea5e9]/20 transition-all duration-500" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Total Focus</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{stats.totalHours}</span>
                    <span className="text-white/40 font-medium">hrs</span>
                </div>
                <p className="text-[#0ea5e9] text-xs mt-4 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    12% from last week
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Completion</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{stats.completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${stats.completionRate}%` }}
                    />
                </div>
            </div>

            {/* Persistence Heatmap */}
            <div className="bg-[#0b0f12] border border-white/10 rounded-3xl p-6 relative group lg:col-span-1">
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4 block">Consistency</span>
                <div className="flex gap-1.5 mt-2">
                    {weeks.map(w => (
                        <div key={w} className="flex flex-col gap-1.5">
                            {days.map((d, i) => {
                                // Mock intensity for the heatmap
                                const isActive = w === 4 && streak?.weeklyStudyDays?.[i] === 1;
                                const intensity = isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-white/5';
                                return (
                                    <div
                                        key={`${w}-${i}`}
                                        className={`w-4 h-4 rounded-[4px] ${intensity} transition-all duration-300 hover:scale-110 cursor-help`}
                                        title={`${d} - ${isActive ? 'Focus Session Completed' : 'No activity'}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    <div className="ml-2 flex flex-col justify-between py-0.5 text-[10px] text-white/20 font-bold">
                        <span>M</span>
                        <span>W</span>
                        <span>S</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
