"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useSchedule } from '@/lib/context/ScheduleContext';
import { useCourses } from '@/lib/context/CoursesContext';
import { StudyBlock, StudyBlockColor } from '@/types/schedule';
import contentJson from '@/content.json';

interface GradeMap {
    [grade: string]: {
        [subject: string]: {
            Strands: {
                [strand: string]: {
                    SubStrands: {
                        [substrand: string]: unknown
                    }
                }
            }
        }
    }
}

export default function StudyBlockModal() {
    const {
        showBlockModal,
        setShowBlockModal,
        createBlock,
        updateBlock,
        editingBlock,
        setEditingBlock,
        modalPrefill,
    } = useSchedule();

    const { myCourses, loadMyCourses } = useCourses();

    // Form State
    const [source, setSource] = useState<'course' | 'classroom'>('course');
    const [topic, setTopic] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [color, setColor] = useState<StudyBlockColor>('cyan');

    // Load courses on mount
    useEffect(() => {
        loadMyCourses();
    }, [loadMyCourses]);

    // ... existing initialization effect ...

    // Course Selection
    const [selectedCourseId, setSelectedCourseId] = useState('');

    // Classroom Selection
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [strand, setStrand] = useState('');
    const [substrand, setSubstrand] = useState('');

    // Load available grades
    const grades = Object.keys(contentJson);
    const subjects = grade ? Object.keys((contentJson as GradeMap)[grade] || {}) : [];
    const strands = (grade && subject) ? Object.keys((contentJson as GradeMap)[grade][subject]?.Strands || {}) : [];
    const substrands = (grade && subject && strand)
        ? Object.keys((contentJson as GradeMap)[grade][subject].Strands[strand]?.SubStrands || {})
        : [];

    useEffect(() => {
        if (editingBlock) {
            setTopic(editingBlock.topic || '');
            setDate(editingBlock.date);
            setStartTime(editingBlock.startTime || '');
            setDuration(editingBlock.duration.toString());
            setColor(editingBlock.color);
            setSource(editingBlock.source || 'course');

            if (editingBlock.source === 'course') {
                setSelectedCourseId(editingBlock.courseId || '');
            } else if (editingBlock.source === 'classroom' && editingBlock.classroom) {
                setGrade(editingBlock.classroom.grade);
                setSubject(editingBlock.classroom.subject);
                setStrand(editingBlock.classroom.strand);
                setSubstrand(editingBlock.classroom.substrand || '');
            }
        } else {
            // Defaults for new block
            setTopic('');
            // Use prefill if available, otherwise default to today/9am
            setDate(modalPrefill?.date || new Date().toISOString().split('T')[0]);
            setStartTime(modalPrefill?.startTime || '09:00');
            setDuration('60');
            setColor('cyan');
            setSource('course');

            setSelectedCourseId('');
            setGrade('');
            setSubject('');
            setStrand('');
            setSubstrand('');
        }
    }, [editingBlock, showBlockModal, modalPrefill]);

    // Auto-fill topic based on selection
    useEffect(() => {
        if (source === 'course' && selectedCourseId) {
            const course = myCourses.find(c => c.id === selectedCourseId);
            if (course) setTopic(course.title);
        }
    }, [source, selectedCourseId, myCourses]);

    useEffect(() => {
        if (source === 'classroom') {
            if (substrand) setTopic(substrand);
            else if (strand) setTopic(strand);
        }
    }, [source, strand, substrand]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const blockData: any = {
            date,
            startTime,
            duration: parseInt(duration),
            topic,
            color,
            source,
        };

        if (source === 'course') {
            blockData.courseId = selectedCourseId;
        } else {
            blockData.classroom = {
                grade,
                subject,
                strand,
                substrand
            };
        }

        if (editingBlock) {
            await updateBlock(editingBlock.id, blockData);
        } else {
            await createBlock(blockData);
        }

        handleClose();
    };

    const handleClose = () => {
        setShowBlockModal(false);
        setEditingBlock(null);
    };

    return (
        <Transition appear show={showBlockModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-xl font-bold text-white mb-6">
                                {editingBlock ? 'Edit Session' : 'Schedule Session'}
                            </Dialog.Title>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Activity Type Toggle */}
                                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setSource('course')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${source === 'course' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                                            }`}
                                    >
                                        My Courses
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSource('classroom')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${source === 'classroom' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                                            }`}
                                    >
                                        Classroom
                                    </button>
                                </div>

                                {source === 'course' ? (
                                    /* Course Selection */
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Select Course</label>
                                        {myCourses.length > 0 ? (
                                            <select
                                                required
                                                value={selectedCourseId}
                                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                                className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                <option value="">Choose a course...</option>
                                                {myCourses.map(course => (
                                                    <option key={course.id} value={course.id}>{course.title}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-sm text-yellow-400/80 bg-yellow-400/10 p-4 rounded-xl border border-yellow-400/20">
                                                No enrolled courses found.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Classroom Selection */
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Grade</label>
                                                <select
                                                    required
                                                    value={grade}
                                                    onChange={(e) => {
                                                        setGrade(e.target.value);
                                                        setSubject(''); setStrand(''); setSubstrand('');
                                                    }}
                                                    className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                                                >
                                                    <option value="">Select Grade</option>
                                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Subject</label>
                                                <select
                                                    required
                                                    value={subject}
                                                    onChange={(e) => {
                                                        setSubject(e.target.value);
                                                        setStrand(''); setSubstrand('');
                                                    }}
                                                    disabled={!grade}
                                                    className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Strand</label>
                                            <select
                                                required
                                                value={strand}
                                                onChange={(e) => {
                                                    setStrand(e.target.value);
                                                    setSubstrand('');
                                                }}
                                                disabled={!subject}
                                                className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                            >
                                                <option value="">Select Strand</option>
                                                {strands.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        {strands && (
                                            <div>
                                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Sub-Strand / Topic</label>
                                                <select
                                                    value={substrand}
                                                    onChange={(e) => setSubstrand(e.target.value)}
                                                    disabled={!strand}
                                                    className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                                >
                                                    <option value="">Select Specific Topic (Optional)</option>
                                                    {substrands.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Time & Duration Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Time</label>
                                            <input
                                                type="time"
                                                required
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Dur.</label>
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="w-full bg-black/20 text-white border border-white/10 rounded-xl px-2 py-3 focus:outline-none focus:border-indigo-500 appearance-none text-center"
                                            >
                                                {[15, 30, 45, 60, 90, 120].map(m => (
                                                    <option key={m} value={m}>{m}m</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 border-t border-white/10 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-6 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
                                    >
                                        {editingBlock ? 'Save Changes' : 'Schedule Session'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
