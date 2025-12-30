"use client";

import { useSchedule } from '@/lib/context/ScheduleContext';

export default function WeeklyCalendar() {
    const {
        currentWeekStart,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        daySchedules,
        setShowBlockModal,
        setEditingBlock,
        completeBlock,
    } = useSchedule();

    const formatWeekRange = () => {
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);

        const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'short' });
        const startDay = currentWeekStart.getDate();
        const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
        const endDay = endDate.getDate();

        if (startMonth === endMonth) {
            return `${startMonth} ${startDay} - ${endDay}`;
        }
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    };

    const isCurrentWeek = () => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(monday.getDate() - monday.getDay() + (monday.getDay() === 0 ? -6 : 1));
        monday.setHours(0, 0, 0, 0);
        return currentWeekStart.getTime() === monday.getTime();
    };

    const handleAddBlock = (date: string) => {
        setEditingBlock(null);
        setShowBlockModal(true);
    };

    const getBlockColor = (color: string) => {
        switch (color) {
            case 'emerald': return 'bg-[#10b981]';
            case 'amber': return 'bg-[#f59e0b]';
            case 'violet': return 'bg-[#8b5cf6]';
            case 'rose': return 'bg-[#f43f5e]';
            case 'slate': return 'bg-[#64748b]';
            default: return 'bg-[#0ea5e9]';
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Weekly Calendar</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousWeek}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToCurrentWeek}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${isCurrentWeek()
                                ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {formatWeekRange()}
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {daySchedules.map((day) => (
                    <div
                        key={day.date}
                        className={`min-h-[140px] p-3 rounded-xl border transition-colors ${day.isToday
                                ? 'bg-[#0ea5e9]/5 border-[#0ea5e9]/30'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        {/* Day header */}
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-medium ${day.isToday ? 'text-[#0ea5e9]' : 'text-white/50'
                                }`}>
                                {day.dayName}
                            </span>
                            <span className={`text-xs ${day.isToday ? 'text-[#0ea5e9]' : 'text-white/40'
                                }`}>
                                {new Date(day.date).getDate()}
                            </span>
                        </div>

                        {/* Blocks */}
                        <div className="space-y-1.5">
                            {day.blocks.map((block) => (
                                <button
                                    key={block.id}
                                    onClick={() => {
                                        setEditingBlock(block);
                                        setShowBlockModal(true);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80 ${getBlockColor(block.color)}`}
                                >
                                    <div className="font-medium text-white truncate">
                                        {block.topic}
                                    </div>
                                    <div className="text-white/70">
                                        {formatDuration(block.duration)}
                                    </div>
                                    {block.completed && (
                                        <svg className="w-3 h-3 text-white absolute top-1 right-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Add button */}
                        <button
                            onClick={() => handleAddBlock(day.date)}
                            className="w-full mt-2 py-1.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                        </button>
                    </div>
                ))}
            </div>

            {/* Total for week */}
            <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                <span>
                    Total planned: {formatDuration(daySchedules.reduce((sum, d) => sum + d.totalMinutes, 0))}
                </span>
                <button
                    onClick={() => {
                        setEditingBlock(null);
                        setShowBlockModal(true);
                    }}
                    className="flex items-center gap-1 text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Study Block
                </button>
            </div>
        </div>
    );
}
