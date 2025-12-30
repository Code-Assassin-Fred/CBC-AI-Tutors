"use client";

import { useState } from 'react';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { StudyBlockColor } from '@/types/schedule';

export default function LearningGoals() {
    const { goals, createGoal, updateGoal, deleteGoal, currentWeekStart } = useSchedule();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState(5);

    const handleAddGoal = async () => {
        if (!newTitle.trim()) return;

        await createGoal({
            title: newTitle.trim(),
            targetHours: newTarget,
            weekStart: currentWeekStart.toISOString().split('T')[0],
            color: 'cyan',
        });

        setNewTitle('');
        setNewTarget(5);
        setShowAddForm(false);
    };

    const getProgressColor = (completed: number, target: number) => {
        const percent = (completed / target) * 100;
        if (percent >= 100) return '#10b981';
        if (percent >= 50) return '#0ea5e9';
        if (percent >= 25) return '#f59e0b';
        return '#64748b';
    };

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Learning Goals</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 text-sm text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Goal
                </button>
            </div>

            {/* Add form */}
            {showAddForm && (
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Goal title (e.g., Python Programming)"
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50 text-sm"
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={newTarget}
                                onChange={(e) => setNewTarget(parseInt(e.target.value) || 1)}
                                min={1}
                                max={40}
                                className="w-16 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm text-center focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                            <span className="text-white/40 text-sm">hrs</span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleAddGoal}
                            disabled={!newTitle.trim()}
                            className="px-3 py-1.5 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors disabled:opacity-50"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-3 py-1.5 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Goals list */}
            {goals.length > 0 ? (
                <div className="space-y-3">
                    {goals.map((goal) => {
                        const percent = Math.min(100, (goal.completedHours / goal.targetHours) * 100);
                        const progressColor = getProgressColor(goal.completedHours, goal.targetHours);

                        return (
                            <div
                                key={goal.id}
                                className="p-3 bg-white/5 rounded-xl border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">{goal.title}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/50">
                                            {goal.completedHours}/{goal.targetHours} hrs
                                        </span>
                                        <button
                                            onClick={() => deleteGoal(goal.id)}
                                            className="p-1 text-white/30 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percent}%`,
                                            backgroundColor: progressColor,
                                        }}
                                    />
                                </div>
                                {percent >= 100 && (
                                    <p className="text-xs text-[#10b981] mt-1.5 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Goal completed!
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : !showAddForm && (
                <div className="text-center py-6 text-white/40 text-sm">
                    <p>No learning goals yet</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-2 text-[#0ea5e9] hover:underline"
                    >
                        Add your first goal
                    </button>
                </div>
            )}
        </div>
    );
}
