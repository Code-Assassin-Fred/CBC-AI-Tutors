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
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-4">
                    <button
                        onClick={() => setSelectedAssessment(null)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white truncate">{selectedAssessment.title}</h1>
                        <div className="flex items-center gap-3 text-sm text-white/50">
                            <span>{selectedAssessment.questions?.length || 0} Questions</span>
                            <span>•</span>
                            <span>{selectedAssessment.totalPoints} Points</span>
                            <span>•</span>
                            <span>{selectedAssessment.estimatedTimeMinutes} min</span>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
                    {selectedAssessment.description && (
                        <p className="text-white/70 text-lg">{selectedAssessment.description}</p>
                    )}

                    {selectedAssessment.questions?.map((question: Question, index: number) => (
                        <div key={question.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            {/* Question Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${question.type === 'multiple-choice' ? 'bg-blue-500/20 text-blue-400' :
                                            question.type === 'true-false' ? 'bg-purple-500/20 text-purple-400' :
                                                question.type === 'short-answer' ? 'bg-green-500/20 text-green-400' :
                                                    question.type === 'open-ended' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-pink-500/20 text-pink-400'
                                            }`}>
                                            {QUESTION_TYPE_LABELS[question.type]}
                                        </span>
                                        <span className="text-xs text-white/40">{question.points} pts</span>
                                    </div>
                                    <p className="text-white text-lg">{question.question}</p>
                                </div>
                            </div>

                            {/* Options for Multiple Choice */}
                            {question.type === 'multiple-choice' && question.options && (
                                <div className="ml-12 space-y-2 mb-4">
                                    {question.options.map((option) => (
                                        <div
                                            key={option.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border ${option.isCorrect
                                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                                : 'border-white/10 bg-white/5'
                                                }`}
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${option.isCorrect
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/10 text-white/60'
                                                }`}>
                                                {option.id.toUpperCase()}
                                            </span>
                                            <span className={option.isCorrect ? 'text-emerald-400' : 'text-white/80'}>
                                                {option.text}
                                            </span>
                                            {option.isCorrect && (
                                                <svg className="w-5 h-5 text-emerald-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Answer for other types */}
                            {question.type !== 'multiple-choice' && (question.correctAnswer || question.sampleAnswer) && (
                                <div className="ml-12 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
                                    <div className="text-xs text-emerald-400 font-medium mb-1">
                                        {question.type === 'open-ended' ? 'Sample Answer' : 'Correct Answer'}
                                    </div>
                                    <p className="text-white/90">{question.correctAnswer || question.sampleAnswer}</p>
                                </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                                <div className="ml-12 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-cyan-400 font-medium mb-1">Explanation</div>
                                    <p className="text-white/70 text-sm">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Main View: Form + Assessments List
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Collapsible Form Section */}
            <div className={`border-b border-white/10 transition-all ${showForm ? 'p-6' : 'p-3'}`}>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2"
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${showForm ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm font-medium">Create New Assessment</span>
                </button>

                {showForm && (
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 space-y-6">
                        {/* Step 1: Upload Materials */}
                        <div>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">1</span>
                                Upload Learning Materials
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

                        {/* Step 2: Configure Assessment */}
                        <div>
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">2</span>
                                Configure Assessment
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-white/70 text-sm mb-2">Assessment Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Chapter 5 Quiz - Photosynthesis"
                                        className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        disabled={isGenerating}
                                    />
                                </div>

                                {/* Question Types */}
                                <div className="md:col-span-2">
                                    <label className="block text-white/70 text-sm mb-3">Question Types</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {questionTypes.map((qt) => (
                                            <div
                                                key={qt.type}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${qt.enabled
                                                    ? 'border-cyan-500/50 bg-cyan-500/10'
                                                    : 'border-white/10 bg-white/5'
                                                    }`}
                                            >
                                                <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={qt.enabled}
                                                        onChange={() => handleQuestionTypeToggle(qt.type)}
                                                        className="w-4 h-4 rounded border-white/30 bg-transparent text-cyan-500 focus:ring-cyan-500/50"
                                                        disabled={isGenerating}
                                                    />
                                                    <span className={`text-sm ${qt.enabled ? 'text-white' : 'text-white/50'}`}>
                                                        {QUESTION_TYPE_LABELS[qt.type]}
                                                    </span>
                                                </label>
                                                {qt.enabled && (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        value={qt.count}
                                                        onChange={(e) => handleQuestionCountChange(qt.type, parseInt(e.target.value) || 0)}
                                                        className="w-14 px-2 py-1 rounded-lg bg-[#0b0f12] border border-white/20 text-white text-center text-sm focus:outline-none focus:border-cyan-500/50"
                                                        disabled={isGenerating}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-white/40 text-xs mt-2">
                                        Total: {totalQuestions} questions
                                    </p>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Difficulty Level</label>
                                    <select
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                                        className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        disabled={isGenerating}
                                    >
                                        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Additional Specifications */}
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Additional Specifications (optional)</label>
                                    <input
                                        type="text"
                                        value={specifications}
                                        onChange={(e) => setSpecifications(e.target.value)}
                                        placeholder="e.g., Focus on vocabulary, include diagrams"
                                        className="w-full px-4 py-3 rounded-xl bg-[#0b0f12] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0 || isGenerating}
                                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0 || isGenerating
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        Generate Assessment
                                    </>
                                )}
                            </button>

                            {/* Progress */}
                            {isGenerating && generationProgress && (
                                <div className="flex-1">
                                    <div className="text-white/60 text-sm mb-1">{generationProgress.message}</div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                            style={{ width: `${generationProgress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {generationError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {generationError}
                            </div>
                        )}

                        {/* Validation hints */}
                        {(!title.trim() || uploadedMaterials.length === 0 || totalQuestions === 0) && !isGenerating && (
                            <div className="text-white/40 text-sm space-y-1">
                                {uploadedMaterials.length === 0 && <p>• Upload at least one material</p>}
                                {!title.trim() && <p>• Enter an assessment title</p>}
                                {totalQuestions === 0 && <p>• Select at least one question type</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Assessments List */}
            <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-lg font-semibold text-cyan-400 mb-4">
                    Your Assessments {assessments.length > 0 && `(${assessments.length})`}
                </h2>

                {isLoadingAssessments ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="w-8 h-8 animate-spin text-white/40" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : assessments.length === 0 ? (
                    <div className="text-center py-12 text-white/40">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <p>No assessments yet. Upload materials and generate your first assessment above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assessments.map((assessment) => (
                            <AssessmentCard
                                key={assessment.id}
                                assessment={assessment}
                                onClick={() => setSelectedAssessment(assessment)}
                                onDelete={() => handleDelete(assessment.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
