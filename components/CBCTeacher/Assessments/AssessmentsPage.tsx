'use client';

import { useEffect, useState } from 'react';
import { useAssessments } from '@/lib/context/AssessmentsContext';
import MaterialUploader from './MaterialUploader';
import AssessmentCard from './AssessmentCard';
import {
    AssessmentConfig,
    QuestionTypeConfig,
    DifficultyLevel,
    DEFAULT_QUESTION_TYPES,
    QUESTION_TYPE_LABELS,
    DIFFICULTY_LABELS,
    Question,
} from '@/types/assessment';

export default function AssessmentsPage() {
    const {
        assessments,
        isLoadingAssessments,
        loadAssessments,
        deleteAssessment,
        selectedAssessment,
        setSelectedAssessment,
        uploadedMaterials,
        isUploading,
        uploadProgress,
        uploadMaterial,
        removeMaterial,
        isGenerating,
        generationProgress,
        generationError,
        generateAssessment,
    } = useAssessments();

    // Form state
    const [title, setTitle] = useState('');
    const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>(DEFAULT_QUESTION_TYPES);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
    const [specifications, setSpecifications] = useState('');
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        loadAssessments();
    }, [loadAssessments]);

    const handleQuestionTypeToggle = (type: string) => {
        setQuestionTypes(prev => prev.map(qt =>
            qt.type === type ? { ...qt, enabled: !qt.enabled } : qt
        ));
    };

    const handleQuestionCountChange = (type: string, count: number) => {
        setQuestionTypes(prev => prev.map(qt =>
            qt.type === type ? { ...qt, count: Math.max(0, Math.min(20, count)) } : qt
        ));
    };

    const totalQuestions = questionTypes.filter(qt => qt.enabled).reduce((sum, qt) => sum + qt.count, 0);

    const handleGenerate = async () => {
        if (!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0) return;

        const config: AssessmentConfig = {
            title: title.trim(),
            questionTypes,
            difficulty,
            totalQuestions,
            specifications: specifications.trim() || undefined,
        };

        const newAssessment = await generateAssessment(config);
        if (newAssessment) {
            setTitle('');
            setSpecifications('');
            setQuestionTypes(DEFAULT_QUESTION_TYPES);
        }
    };

    const handleDelete = async (assessmentId: string) => {
        if (confirm('Are you sure you want to delete this assessment?')) {
            await deleteAssessment(assessmentId);
        }
    };

    // Assessment Viewer
    if (selectedAssessment) {
        return (
            <div className="flex flex-col h-full overflow-hidden bg-[#0a0f14]">
                {/* Header - Hidden on print */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-10 backdrop-blur-md print:hidden">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setSelectedAssessment(null)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all font-medium text-xs sm:text-sm"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-lg font-bold text-white truncate">{selectedAssessment.title}</h1>
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm text-white/50">
                                <span>{selectedAssessment.questions?.length || 0} Qs</span>
                                <span>•</span>
                                <span>{selectedAssessment.totalPoints} Pts</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 font-bold text-[10px] sm:text-sm whitespace-nowrap"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 print:p-0 print:overflow-visible">
                    <div className="max-w-[800px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none min-h-[1000px] flex flex-col text-gray-900">

                        {/* Print Styles */}
                        <style jsx global>{`
                            @media print {
                                body { background: white !important; color: black !important; }
                                .DashboardLayout_main { padding: 0 !important; }
                                header, aside, .print-hidden, .print\\:hidden { display: none !important; }
                                .print-only { display: block !important; }
                                @page { margin: 2cm; }
                            }
                        `}</style>

                        {/* Assessment Header */}
                        <div className="p-6 sm:p-10 border-b border-gray-100 bg-gray-50/80">
                            <h2 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 mb-4 sm:mb-2">{selectedAssessment.title}</h2>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Points</span>
                                    <span className="text-gray-900 font-bold underline decoration-cyan-500/30 underline-offset-4">{selectedAssessment.totalPoints}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Duration</span>
                                    <span className="text-gray-900 font-bold underline decoration-cyan-500/30 underline-offset-4">{selectedAssessment.estimatedTimeMinutes} min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Student Name</span>
                                    <div className="w-48 h-6 border-b-2 border-gray-200"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-10 space-y-8 sm:space-y-12 flex-1">
                            {/* General Rubric (Teacher Only View) */}
                            {selectedAssessment.rubric && (
                                <section className="print:hidden rounded-2xl bg-cyan-50 border border-cyan-100 p-6 shadow-sm">
                                    <h3 className="text-cyan-800 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Assessment Rubric
                                    </h3>
                                    <p className="text-cyan-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedAssessment.rubric}</p>
                                </section>
                            )}

                            {selectedAssessment.description && (
                                <p className="text-gray-500 text-lg italic leading-relaxed font-serif">{selectedAssessment.description}</p>
                            )}

                            {/* Questions */}
                            <div className="space-y-16">
                                {selectedAssessment.questions?.map((question: Question, index: number) => (
                                    <div key={question.id} className="relative group">
                                        <div className="flex items-start gap-6">
                                            <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 space-y-3 sm:space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">{QUESTION_TYPE_LABELS[question.type]}</span>
                                                    <span className="text-[10px] sm:text-sm font-bold text-gray-400">Score: ____ / {question.points}</span>
                                                </div>
                                                <p className="text-xl sm:text-2xl text-gray-900 font-serif leading-snug font-medium">{question.question}</p>

                                                {/* Multiple Choice Options */}
                                                {question.type === 'multiple-choice' && question.options && (
                                                    <div className="grid grid-cols-1 gap-3 mt-6">
                                                        {question.options.map((option) => (
                                                            <div key={option.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${option.isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-50 bg-gray-50/20'
                                                                }`}>
                                                                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-black ${option.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 text-gray-400'
                                                                    }`}>
                                                                    {option.id.toUpperCase()}
                                                                </div>
                                                                <span className={`text-lg ${option.isCorrect ? 'text-emerald-900 font-semibold' : 'text-gray-800'}`}>{option.text}</span>
                                                                {option.isCorrect && (
                                                                    <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-emerald-600 print:hidden">Correct</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Open Response Lines */}
                                                {(question.type === 'short-answer' || question.type === 'open-ended' || question.type === 'fill-blank') && (
                                                    <div className="mt-6 space-y-4">
                                                        {Array.from({ length: question.type === 'open-ended' ? 10 : question.type === 'short-answer' ? 4 : 1 }).map((_, i) => (
                                                            <div key={i} className="h-10 border-b-2 border-gray-100 w-full mb-1"></div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* True/False Options */}
                                                {question.type === 'true-false' && (
                                                    <div className="flex gap-12 mt-6">
                                                        <div className="flex items-center gap-3 group/opt cursor-pointer">
                                                            <div className="w-8 h-8 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-gray-200 group-hover/opt:border-cyan-500 group-hover/opt:text-cyan-500 transition-all">T</div>
                                                            <span className="text-gray-700 font-bold text-lg">TRUE</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 group/opt cursor-pointer">
                                                            <div className="w-8 h-8 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-gray-200 group-hover/opt:border-cyan-500 group-hover/opt:text-cyan-500 transition-all">F</div>
                                                            <span className="text-gray-700 font-bold text-lg">FALSE</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Rubric/Explanation - Teacher Only */}
                                                <div className="print:hidden space-y-3 pt-6 mt-6 border-t border-gray-100">
                                                    {(question.correctAnswer || question.sampleAnswer) && (
                                                        <div className="rounded-xl bg-emerald-50/80 p-4 border border-emerald-100">
                                                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Expected Answer:</span>
                                                            <p className="text-emerald-900 text-sm font-medium">{question.correctAnswer || question.sampleAnswer}</p>
                                                        </div>
                                                    )}
                                                    {question.rubric && (
                                                        <div className="rounded-xl bg-amber-50/80 p-4 border border-amber-100">
                                                            <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-1">Grading Rubric:</span>
                                                            <p className="text-amber-900 text-sm italic">{question.rubric}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-10 text-center border-t border-gray-50 bg-gray-50/30 text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-auto">
                            Curio Academic Performance Assessment &copy; {new Date().getFullYear()} &bull; Professional Edition
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default view: Form + List
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Form Section */}
            <div className={`border-b border-white/10 transition-all ${showForm ? 'p-4 sm:p-6' : 'p-2 sm:p-3'}`}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
                >
                    <svg className={`w-4 h-4 transition-transform ${showForm ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium">Create New Assessment</span>
                </button>

                {showForm && (
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-6 shadow-2xl">
                        {/* Step 1: Upload */}
                        <div>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">1</span>
                                Upload Materials
                            </h3>
                            <MaterialUploader
                                materials={uploadedMaterials}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                                onUpload={uploadMaterial}
                                onRemove={removeMaterial}
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Step 2: Config */}
                        <div>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">2</span>
                                Configure & Generate
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-white/70 text-xs sm:text-sm mb-1 sm:mb-2 font-medium">Assessment Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Solar System Quiz"
                                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white text-sm focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                        disabled={isGenerating}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-white/70 text-sm mb-3">Question Mix</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {questionTypes.map((qt) => (
                                            <div key={qt.type} className={`flex items-center justify-between p-3 rounded-xl border ${qt.enabled ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={qt.enabled} onChange={() => handleQuestionTypeToggle(qt.type)} className="w-4 h-4 rounded text-cyan-500 bg-transparent border-white/20" disabled={isGenerating} />
                                                    <span className="text-sm text-white/80">{QUESTION_TYPE_LABELS[qt.type]}</span>
                                                </label>
                                                {qt.enabled && (
                                                    <input type="number" min="1" max="20" value={qt.count} onChange={(e) => handleQuestionCountChange(qt.type, parseInt(e.target.value) || 0)} className="w-12 h-8 rounded bg-black/40 border border-white/10 text-center text-sm text-white" disabled={isGenerating} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Difficulty</label>
                                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white outline-none" disabled={isGenerating}>
                                        {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Extra Instructions</label>
                                    <input type="text" value={specifications} onChange={(e) => setSpecifications(e.target.value)} placeholder="e.g. Focus on vocabulary" className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white outline-none" disabled={isGenerating} />
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0 || isGenerating}
                                className={`px-4 sm:px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0 || isGenerating
                                    ? 'bg-white/10 text-white/20'
                                    : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-xl shadow-cyan-500/10'
                                    }`}
                            >
                                {isGenerating ? 'Generating...' : 'Start Intelligence Engine'}
                            </button>
                            {isGenerating && generationProgress && (
                                <div className="flex-1">
                                    <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{generationProgress.message}</div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${generationProgress.percentage}%` }} /></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-between">
                        Assessment Library
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/40 uppercase tracking-widest">{assessments.length} Available</span>
                    </h2>

                    {isLoadingAssessments ? (
                        <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" /></div>
                    ) : assessments.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                            <p className="text-white/30 font-medium">No assessments ready yet. Feed the AI some materials above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assessments.map(a => <AssessmentCard key={a.id} assessment={a} onClick={() => setSelectedAssessment(a)} onDelete={() => handleDelete(a.id)} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
