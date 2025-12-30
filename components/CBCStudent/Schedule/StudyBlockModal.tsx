"use client";

import { useState, useEffect } from 'react';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { StudyBlockColor } from '@/types/schedule';

export default function StudyBlockModal() {
    const {
        showBlockModal,
        setShowBlockModal,
        editingBlock,
        setEditingBlock,
        createBlock,
        updateBlock,
        deleteBlock,
        completeBlock,
        daySchedules,
    } = useSchedule();

    const [topic, setTopic] = useState('');
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState(60);
    const [startTime, setStartTime] = useState('');
    const [color, setColor] = useState<StudyBlockColor>('cyan');
    const [notes, setNotes] = useState('');

    // Populate form when editing
    useEffect(() => {
        if (editingBlock) {
            setTopic(editingBlock.topic);
            setDate(editingBlock.date);
            setDuration(editingBlock.duration);
            setStartTime(editingBlock.startTime || '');
            setColor(editingBlock.color);
            setNotes(editingBlock.notes || '');
        } else {
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            setTopic('');
            setDate(today);
            setDuration(60);
            setStartTime('');
            setColor('cyan');
            setNotes('');
        }
    }, [editingBlock, showBlockModal]);

    const handleClose = () => {
        setShowBlockModal(false);
        setEditingBlock(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !date) return;

        if (editingBlock) {
            await updateBlock(editingBlock.id, {
                topic: topic.trim(),
                date,
                duration,
                startTime: startTime || undefined,
                color,
                notes: notes.trim() || undefined,
            });
        } else {
            await createBlock({
                topic: topic.trim(),
                date,
                duration,
                startTime: startTime || undefined,
                color,
                notes: notes.trim() || undefined,
            });
        }

        handleClose();
    };

    const handleDelete = async () => {
        if (editingBlock) {
            await deleteBlock(editingBlock.id);
            handleClose();
        }
    };

    const handleComplete = async () => {
        if (editingBlock) {
            await completeBlock(editingBlock.id);
            handleClose();
        }
    };

    const colors: { value: StudyBlockColor; label: string; class: string }[] = [
        { value: 'cyan', label: 'Default', class: 'bg-[#0ea5e9]' },
        { value: 'emerald', label: 'Done', class: 'bg-[#10b981]' },
        { value: 'amber', label: 'Priority', class: 'bg-[#f59e0b]' },
        { value: 'violet', label: 'Career', class: 'bg-[#8b5cf6]' },
        { value: 'slate', label: 'Low', class: 'bg-[#64748b]' },
    ];

    const durations = [
        { value: 15, label: '15 min' },
        { value: 30, label: '30 min' },
        { value: 45, label: '45 min' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hrs' },
        { value: 120, label: '2 hours' },
        { value: 180, label: '3 hours' },
    ];

    if (!showBlockModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-[#0b0f12] rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">
                        {editingBlock ? 'Edit Study Block' : 'Add Study Block'}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Topic */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">What to study</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Python Basics, Machine Learning..."
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                            autoFocus
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-white/50 mb-1.5">Start time (optional)</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0ea5e9]/50"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">Duration</label>
                        <div className="flex flex-wrap gap-2">
                            {durations.map((d) => (
                                <button
                                    key={d.value}
                                    type="button"
                                    onClick={() => setDuration(d.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${duration === d.value
                                            ? 'bg-[#0ea5e9] text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">Color</label>
                        <div className="flex gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full ${c.class} transition-transform ${color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b0f12] scale-110' : ''
                                        }`}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                            rows={2}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {editingBlock && !editingBlock.completed && (
                            <button
                                type="button"
                                onClick={handleComplete}
                                className="px-4 py-2.5 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#10b981]/90 transition-colors"
                            >
                                Mark Complete
                            </button>
                        )}
                        {editingBlock && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2.5 bg-white/5 text-white/60 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!topic.trim() || !date}
                            className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingBlock ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
