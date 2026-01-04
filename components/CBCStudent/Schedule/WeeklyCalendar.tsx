"use client";

import { useEffect, useRef } from 'react';

import { useSchedule } from '@/lib/context/ScheduleContext';
import { useRouter } from 'next/navigation';

export default function WeeklyCalendar() {
    const router = useRouter();
    const {
        currentWeekStart,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        daySchedules,
        setShowBlockModal,
        setEditingBlock,
        setModalPrefill,
    } = useSchedule();

    const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23 (24h)

    const formatWeekRange = () => {
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);

        const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
        const startDay = currentWeekStart.getDate();
        const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
        const endDay = endDate.getDate();

        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    };

    const isCurrentWeek = () => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1));
        monday.setHours(0, 0, 0, 0);
        return currentWeekStart.getTime() === monday.getTime();
    };

    // Auto-scroll to earliest block
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!daySchedules.length || !scrollContainerRef.current) return;

        let earliestHour = 8; // Default to 8 AM
        let hasBlocks = false;

        daySchedules.forEach(day => {
            day.blocks.forEach(block => {
                if (block.startTime) {
                    const hour = parseInt(block.startTime.split(':')[0]);
                    if (!hasBlocks || hour < earliestHour) {
                        earliestHour = hour;
                        hasBlocks = true;
                    }
                }
            });
        });

        // Add some padding (e.g. 1 hour before)
        const scrollToHour = Math.max(0, earliestHour - 1);
        scrollContainerRef.current.scrollTop = scrollToHour * 80;
    }, [daySchedules]);

    const getBlockColor = (color: string) => {
        switch (color) {
            case 'emerald': return 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 border-0';
            case 'amber': return 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 border-0';
            case 'violet': return 'bg-violet-600 text-white shadow-lg shadow-violet-900/20 border-0';
            case 'rose': return 'bg-rose-600 text-white shadow-lg shadow-rose-900/20 border-0';
            case 'slate': return 'bg-slate-600 text-white shadow-lg shadow-slate-900/20 border-0';
            default: return 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 border-0';
        }
    };

    const handleLaunchSession = (e: React.MouseEvent, block: any) => {
        e.stopPropagation();
        if (block.courseId) {
            router.push(`/dashboard/student/courses/${block.courseId}`);
        } else if (block.source === 'classroom' && block.classroom) {
            const { grade, subject, strand, substrand } = block.classroom;
            const params = new URLSearchParams({
                grade,
                subject,
                strand
            });
            if (substrand) params.append('substrand', substrand);
            router.push(`/dashboard/student/classroom?${params.toString()}`);
        }
    };

    return (
        <div className="bg-[#0b0f12] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
            {/* Grid Header */}
            <div className="px-6 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Weekly Plan</h2>
                    <p className="text-white/40 text-sm font-medium mb-1">{formatWeekRange()}</p>
                    <p className="text-sky-400 text-xs font-medium">Click any empty slot to schedule</p>
                </div>
                <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
                    <button onClick={goToPreviousWeek} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToCurrentWeek}
                        className={`px-4 py-2 text-sm font-bold transition-all rounded-xl ${isCurrentWeek() ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        This Week
                    </button>
                    <button onClick={goToNextWeek} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Time Grid Layout */}
            <div ref={scrollContainerRef} className="flex flex-col h-[600px] overflow-y-auto custom-scrollbar scroll-smooth">
                {/* Day Columns Header */}
                <div className="flex border-b border-white/5 sticky top-0 bg-[#0b0f12] z-10">
                    <div className="w-16 flex-shrink-0" />
                    {daySchedules.map((day) => (
                        <div key={day.date} className="flex-1 py-4 text-center border-l border-white/5">
                            <span className={`block text-[10px] font-black uppercase tracking-widest ${day.isToday ? 'text-sky-400' : 'text-white/20'}`}>
                                {day.dayName}
                            </span>
                            <span className={`text-lg font-bold ${day.isToday ? 'text-white' : 'text-white/40'}`}>
                                {new Date(day.date).getDate()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="flex relative items-start">
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 flex flex-col">
                        {hours.map(hour => (
                            <div key={hour} className="h-20 text-[10px] font-black text-white/20 flex items-start justify-center pt-2">
                                {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="flex-1 flex relative">
                        {daySchedules.map((day) => (
                            <div key={day.date} className="flex-1 h-[1920px] border-l border-white/5 relative group">
                                {/* Clickable BG for creating new blocks */}
                                {hours.map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-full h-20 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer"
                                        style={{ top: `${i * 80}px` }}
                                        onClick={() => {
                                            const hour = i;
                                            const timeString = `${hour.toString().padStart(2, '0')}:00`;
                                            setModalPrefill({ date: day.date, startTime: timeString });
                                            setEditingBlock(null);
                                            setShowBlockModal(true);
                                        }}
                                        title={`Schedule for ${day.dayName} at ${i}:00`}
                                    />
                                ))}

                                {day.blocks.map(block => {
                                    const startH = block.startTime ? parseInt(block.startTime.split(':')[0]) : 0;
                                    const startM = block.startTime ? parseInt(block.startTime.split(':')[1]) : 0;
                                    const top = startH * 80 + (startM / 60) * 80;
                                    const height = (block.duration / 60) * 80;

                                    return (
                                        <div
                                            key={block.id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent grid click
                                                setEditingBlock(block);
                                                setShowBlockModal(true);
                                            }}
                                            className={`absolute left-1 right-1 p-2 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] hover:z-20 cursor-pointer shadow-xl ${getBlockColor(block.color)} ${block.courseId ? 'ring-1 ring-white/10' : ''}`}
                                            style={{ top: `${top}px`, height: `${height}px`, minHeight: '40px' }}
                                        >
                                            <div className="relative">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-bold truncate text-[11px] leading-tight">
                                                        {block.topic}
                                                    </span>
                                                </div>

                                                {/* Subtitle / Details */}
                                                <div className="pl-3 text-[9px] text-white/50 truncate leading-tight">
                                                    {block.source === 'classroom' && block.classroom ? (
                                                        `${block.classroom.subject} • ${block.classroom.grade}`
                                                    ) : block.source === 'course' ? (
                                                        'Course Session'
                                                    ) : (
                                                        `${block.duration} min`
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Button (Start Session) */}
                                            {(block.courseId || (block.source === 'classroom' && block.classroom)) && height >= 50 && (
                                                <button
                                                    onClick={(e) => handleLaunchSession(e, block)}
                                                    className="mt-auto w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                    Start Session
                                                </button>
                                            )}

                                            {block.completed && (
                                                <div className="absolute bottom-1 right-1">
                                                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                    </div>
                </div>
            </div>


        </div>
    );
}
