"use client";

import { useSchedule } from '@/lib/context/ScheduleContext';

export default function StreakReminders() {
    const { streak, reminders } = useSchedule();

    const currentStreak = streak?.currentStreak || 0;
    const longestStreak = streak?.longestStreak || 0;

    const getStreakEmoji = () => {
        if (currentStreak >= 30) return '🏆';
        if (currentStreak >= 14) return '⭐';
        if (currentStreak >= 7) return '🔥';
        if (currentStreak >= 3) return '✨';
        return '📚';
    };

    const getUrgencyStyles = (urgency: string) => {
        switch (urgency) {
            case 'high':
                return 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]';
            case 'medium':
                return 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 text-[#0ea5e9]';
            default:
                return 'bg-white/5 border-white/10 text-white/60';
        }
    };

    return (
        <div className="space-y-4">
            {/* Streak */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStreakEmoji()}</span>
                        <div>
                            <p className="text-sm text-white/50">Current Streak</p>
                            <p className="text-2xl font-bold text-white">
                                {currentStreak} <span className="text-sm font-normal text-white/40">days</span>
                            </p>
                        </div>
                    </div>
                    {longestStreak > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-white/40">Best</p>
                            <p className="text-sm text-white/60">{longestStreak} days</p>
                        </div>
                    )}
                </div>

                {/* Weekly activity dots */}
                {streak?.weeklyStudyDays && (
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/10">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                            const studied = streak.weeklyStudyDays[idx] === 1;
                            return (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-white/30">{day}</span>
                                    <div className={`w-3 h-3 rounded-full ${studied ? 'bg-[#10b981]' : 'bg-white/10'
                                        }`} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {currentStreak === 0 && (
                    <p className="text-xs text-white/40 mt-3">
                        Complete a study session to start your streak!
                    </p>
                )}
            </div>

            {/* Reminders */}
            {reminders.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-white mb-2">Upcoming</h3>
                    <div className="space-y-2">
                        {reminders.map((reminder) => (
                            <div
                                key={reminder.id}
                                className={`p-3 rounded-xl border ${getUrgencyStyles(reminder.urgency)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{reminder.title}</p>
                                        <p className="text-xs opacity-70">{reminder.description}</p>
                                    </div>
                                    {reminder.time && (
                                        <span className="text-xs opacity-60 whitespace-nowrap ml-2">
                                            {reminder.time}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {reminders.length === 0 && currentStreak > 0 && (
                <div className="text-center py-4 text-white/40 text-sm">
                    <p>All caught up! No upcoming items.</p>
                </div>
            )}
        </div>
    );
}
