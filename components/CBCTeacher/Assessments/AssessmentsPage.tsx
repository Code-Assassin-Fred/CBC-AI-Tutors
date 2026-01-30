'use client';

import { useEffect, useState, useRef } from 'react';
import { useAssessments } from '@/lib/context/AssessmentsContext';
import MaterialUploader from './MaterialUploader';
import AssessmentCard from './AssessmentCard';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import {
    AssessmentConfig,
    QuestionTypeConfig,
    DifficultyLevel,
    DEFAULT_QUESTION_TYPES,
    QUESTION_TYPE_LABELS,
    DIFFICULTY_LABELS,
    Question,
} from '@/types/assessment';

const FLICKER_STATES = ['Thinking...', 'Working...', 'Generating...'];

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
    const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Flickering status indicator
    const [flickerText, setFlickerText] = useState(FLICKER_STATES[0]);
    useEffect(() => {
        if (!isGenerating) return;
        const intervals = [150, 300, 800, 1500, 3000, 5000, 6000]; // Small, medium, and large pauses
        let timeout: NodeJS.Timeout;
        const cycle = () => {
            setFlickerText(FLICKER_STATES[Math.floor(Math.random() * FLICKER_STATES.length)]);
            timeout = setTimeout(cycle, intervals[Math.floor(Math.random() * intervals.length)]);
        };
        cycle();
        return () => clearTimeout(timeout);
    }, [isGenerating]);

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

    const handleDelete = (assessmentId: string) => {
        setAssessmentToDelete(assessmentId);
    };

    const confirmDelete = async () => {
        if (!assessmentToDelete) return;
        setIsDeleting(true);
        try {
            await deleteAssessment(assessmentToDelete);
        } finally {
            setIsDeleting(false);
            setAssessmentToDelete(null);
        }
    };

    const handlePrint = () => {
        if (!selectedAssessment) return;

        // Save original title
        const originalTitle = document.title;

        // Set dynamic title for filename and browser header
        const docTitle = viewMode === 'questions'
            ? `${selectedAssessment.title} - Assessment`
            : `${selectedAssessment.title} - Rubric`;

        document.title = docTitle;

        // Print
        window.print();

        // Restore original title
        document.title = originalTitle;
    };

    // Assessment Viewer
    const [viewMode, setViewMode] = useState<'questions' | 'rubric'>('questions');

    if (selectedAssessment) {
        return (
            <div className="flex flex-col h-full overflow-hidden bg-[#0a0f14]">
                {/* Header - Hidden on print */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-[#0d1117] flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-10 print:hidden">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setSelectedAssessment(null)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1a1f24] transition-all font-medium text-xs sm:text-sm"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-lg font-bold text-white truncate">{selectedAssessment.title}</h1>
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm text-white/50">
                                <span>{selectedAssessment.questions?.length || 0} Questions</span>
                            </div>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2">
                        <div className="flex bg-[#0b0f12] border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('questions')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'questions'
                                    ? 'bg-cyan-500 text-white'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                Questions
                            </button>
                            <button
                                onClick={() => setViewMode('rubric')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'rubric'
                                    ? 'bg-amber-500 text-white'
                                    : 'text-white/50 hover:text-white'
                                    }`}
                            >
                                Rubric
                            </button>
                        </div>

                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 transition-all font-bold text-[10px] sm:text-sm whitespace-nowrap"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 print:p-0 print:overflow-visible">
                    <div className="max-w-[800px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none min-h-[1000px] flex flex-col text-black assessment-printable">

                        {/* Print Styles */}
                        <style jsx global>{`
                            @media print {
                                /* Hide everything by default */
                                body * { visibility: hidden; }
                                
                                /* Show only the assessment document and its children */
                                .assessment-printable, .assessment-printable * { visibility: visible; }
                                
                                /* Position the document at the top left and remove browser margins */
                                .assessment-printable { 
                                    position: absolute; 
                                    left: 0; 
                                    top: 0; 
                                    width: 100% !important;
                                    margin: 0 !important;
                                    padding: 1.5cm !important;
                                    box-shadow: none !important;
                                }

                                /* Ensure backgrounds are handled */
                                body { background: white !important; margin: 0 !important; }
                                .bg-gray-50 { background: white !important; }
                                
                                /* Hide specific UI elements */
                                header, nav, aside, footer, .print-hidden, [role="navigation"] { display: none !important; }
                                
                                /* Remove browser-generated headers and footers by setting page margin to 0 */
                                @page { 
                                    margin: 0; 
                                    size: auto;
                                }
                            }
                        `}</style>

                        {/* Assessment Header */}
                        <div className="p-6 sm:p-10 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl sm:text-3xl font-serif font-bold text-black mb-4 sm:mb-2">{selectedAssessment.title}</h2>
                            {/* Points removed at user request */}
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-10 space-y-8 sm:space-y-12 flex-1">
                            {selectedAssessment.description && viewMode === 'questions' && (
                                <p className="text-black text-lg italic leading-relaxed font-serif">{selectedAssessment.description}</p>
                            )}

                            {/* Questions View */}
                            {viewMode === 'questions' && (
                                <div className="space-y-10">
                                    {selectedAssessment.questions?.map((question: Question, index: number) => (
                                        <div key={question.id || `question-${index}`} className="pb-8 border-b border-gray-100 last:border-0">
                                            {/* Question with number inline */}
                                            <div className="flex items-baseline justify-between gap-4 mb-6">
                                                <p className="text-lg sm:text-xl text-black leading-relaxed">
                                                    <span className="font-bold mr-2">{index + 1}.</span>
                                                    {question.question}
                                                </p>
                                            </div>

                                            {/* Multiple Choice Options */}
                                            {question.type === 'multiple-choice' && question.options && (
                                                <div className="space-y-3">
                                                    {question.options.map((option, optIndex) => (
                                                        <div key={option.id} className="flex items-start gap-3 py-2">
                                                            <span className="font-bold text-black w-6">{String.fromCharCode(65 + optIndex)}.</span>
                                                            <span className="text-black font-medium">{option.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Open Response Lines - only for open-ended and fill-blank */}
                                            {(question.type === 'open-ended' || question.type === 'fill-blank') && (
                                                <div className="space-y-3">
                                                    {Array.from({ length: question.type === 'open-ended' ? 8 : 1 }).map((_, i) => (
                                                        <div key={i} className="border-b border-gray-200 h-8"></div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* True/False Options */}
                                            {question.type === 'true-false' && (
                                                <div className="flex gap-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-black rounded"></div>
                                                        <span className="font-bold text-black">True</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-black rounded"></div>
                                                        <span className="font-bold text-black">False</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Rubric View */}
                            {viewMode === 'rubric' && (
                                <div className="space-y-8">
                                    {/* Overall Rubric */}
                                    {selectedAssessment.rubric && (
                                        <section className="pb-6 border-b border-gray-300">
                                            <h3 className="text-black font-black mb-3 text-sm uppercase tracking-wider">Overall Assessment Rubric</h3>
                                            <p className="text-black leading-relaxed whitespace-pre-wrap font-medium">{selectedAssessment.rubric}</p>
                                        </section>
                                    )}

                                    {/* Question-Level Rubrics */}
                                    <div className="space-y-6">
                                        <h3 className="text-black font-bold text-lg">Question Rubrics & Answers</h3>
                                        {selectedAssessment.questions?.map((question: Question, index: number) => (
                                            <div key={question.id || `rubric-${index}`} className="pb-6 border-b border-gray-100 last:border-0">
                                                <div className="flex items-baseline gap-2 mb-3">
                                                    <span className="font-black text-black">Q{index + 1}:</span>
                                                    <span className="text-black font-bold text-sm">{question.question}</span>
                                                </div>

                                                {(question.correctAnswer || question.sampleAnswer) && (
                                                    <div className="mb-3">
                                                        <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Expected Answer</span>
                                                        <p className="text-black text-sm mt-1 font-medium">{question.correctAnswer || question.sampleAnswer}</p>
                                                    </div>
                                                )}

                                                {question.rubric && (
                                                    <div>
                                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Grading Criteria</span>
                                                        <p className="text-black text-sm mt-1 font-medium">{question.rubric}</p>
                                                    </div>
                                                )}

                                                {!question.correctAnswer && !question.sampleAnswer && !question.rubric && (
                                                    <p className="text-gray-700 text-sm italic">No rubric available for this question.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-10 text-center border-t border-gray-100 bg-gray-50/10 text-[9px] text-black font-bold uppercase tracking-[0.3em] mt-auto">
                            Curio Academic Performance Assessment &copy; {new Date().getFullYear()} &bull; Professional Edition
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default view: Form + List
    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
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
                                <span className="text-cyan-400 font-bold">1.</span>
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
                                <span className="text-cyan-400 font-bold">2.</span>
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
                                            <div key={qt.type} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${qt.enabled ? 'border-cyan-500 bg-[#0d1117]' : 'border-white/10 bg-[#0b0f12]'}`}>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={qt.enabled} onChange={() => handleQuestionTypeToggle(qt.type)} className="w-4 h-4 rounded text-cyan-500 bg-transparent border-white/20" disabled={isGenerating} />
                                                    <span className="text-sm text-white/80">{QUESTION_TYPE_LABELS[qt.type]}</span>
                                                </label>
                                                {qt.enabled && (
                                                    <input type="number" min="1" max="20" value={qt.count} onChange={(e) => handleQuestionCountChange(qt.type, parseInt(e.target.value) || 0)} className="w-12 h-8 rounded bg-black border border-white/10 text-center text-sm text-white" disabled={isGenerating} />
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
                                    <label className="block text-white/70 text-sm mb-2">Extra Instructions <span className="text-white/30 text-xs font-normal">(Optional)</span></label>
                                    <textarea
                                        value={specifications}
                                        onChange={(e) => setSpecifications(e.target.value)}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
                                        }}
                                        placeholder="e.g. Focus on vocabulary..."
                                        className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white outline-none resize-none min-h-[48px] max-h-[160px] overflow-y-auto transition-all"
                                        rows={1}
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            {!isGenerating && (
                                <button
                                    onClick={handleGenerate}
                                    disabled={!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0}
                                    className={`px-4 sm:px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0
                                        ? 'bg-[#1a1f24] text-white/20'
                                        : 'bg-cyan-500 text-white hover:bg-cyan-400'
                                        }`}
                                >
                                    Start Intelligence Engine
                                </button>
                            )}
                            {isGenerating && generationProgress && (
                                <div className="flex-1 relative rounded-xl overflow-hidden">
                                    {/* Marching Ants + Border Tracer Effect */}
                                    <style>{`
                                        @keyframes marching-ants {
                                            0% { background-position: 0 0, 0 100%, 0 0, 100% 0; }
                                            100% { background-position: 40px 0, -40px 100%, 0 -40px, 100% 40px; }
                                        }
                                        @keyframes border-tracer {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                        @keyframes tracer-color-swap {
                                            0%, 80% { color: #22d3ee; }
                                            80.1%, 100% { color: #f97316; }
                                        }
                                    `}</style>

                                    {/* Border Tracer (Conic Sweep) */}
                                    <div className="absolute inset-[-100%] animate-[border-tracer_3s_linear_infinite,tracer-color-swap_15s_step-end_infinite]">
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                background: 'conic-gradient(from 0deg, transparent 70%, currentColor 85%, currentColor 100%)'
                                            }}
                                        />
                                    </div>

                                    {/* Marching Ants */}
                                    <div
                                        className="absolute inset-0 rounded-xl"
                                        style={{
                                            backgroundImage: `
                                                linear-gradient(90deg, #22d3ee 50%, transparent 50%),
                                                linear-gradient(90deg, #22d3ee 50%, transparent 50%),
                                                linear-gradient(0deg, #22d3ee 50%, transparent 50%),
                                                linear-gradient(0deg, #22d3ee 50%, transparent 50%)
                                            `,
                                            backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
                                            backgroundSize: '20px 1.5px, 20px 1.5px, 1.5px 20px, 1.5px 20px',
                                            backgroundPosition: '0 0, 0 100%, 0 0, 100% 0',
                                            animation: 'marching-ants 1s linear infinite',
                                            opacity: 0.3
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="relative bg-[#0d1117] m-[2px] rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                                                {flickerText}
                                            </span>
                                            <span className="text-[10px] font-mono text-white/40">{Math.round(generationProgress.percentage)}%</span>
                                        </div>
                                        <div className="text-xs text-white/70 mb-3 line-clamp-1">{generationProgress.message}</div>
                                        <div className="h-1.5 bg-[#1a1f24] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500 transition-all duration-700 ease-out"
                                                style={{ width: `${generationProgress.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-between">
                        Assessment Library
                        <span className="px-2 py-0.5 rounded-md bg-[#0d1117] border border-white/10 text-[10px] text-white/40 uppercase tracking-widest">{assessments.length} Available</span>
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
            {/* Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={!!assessmentToDelete}
                title="Delete Assessment"
                message="Are you sure you want to delete this assessment? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setAssessmentToDelete(null)}
                isLoading={isDeleting}
            />
        </div>
    );
}
