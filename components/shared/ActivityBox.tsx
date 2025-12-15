/**
 * ActivityBox Component
 * 
 * Renders structured activity sections with:
 * - Activity title and aim
 * - Materials list
 * - Step-by-step procedure
 * - Safety notes (if applicable)
 * - Observations section
 * - Conclusion
 * 
 * Matches the structure used in real CBC textbooks.
 */

"use client";

import React from "react";

interface ActivityBoxProps {
    title: string;
    aim?: string;
    materials?: string[];
    equipment?: string[];
    ingredients?: string[];  // For Home Science
    procedure?: string[];
    safetyNotes?: string[];
    observations?: string;
    conclusion?: string;
    duration?: string;
    className?: string;
}

export default function ActivityBox({
    title,
    aim,
    materials,
    equipment,
    ingredients,
    procedure,
    safetyNotes,
    observations,
    conclusion,
    duration,
    className = ""
}: ActivityBoxProps) {
    return (
        <div className={`activity-box my-8 rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-amber-600/20 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
                <h4 className="text-xl font-bold text-amber-300 flex items-center gap-3 m-0">
                    <ActivityIcon />
                    <span>Activity: {title}</span>
                </h4>
                {duration && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-sm rounded-full flex items-center gap-1">
                        <ClockIcon />
                        {duration}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {/* Aim */}
                {aim && (
                    <div className="activity-aim">
                        <h5 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                            Aim
                        </h5>
                        <p className="text-white/80">{aim}</p>
                    </div>
                )}

                {/* Materials / Equipment / Ingredients */}
                {(materials || equipment || ingredients) && (
                    <div className="activity-materials">
                        <h5 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                            {ingredients ? "Ingredients" : materials ? "Materials" : "Equipment"}
                        </h5>
                        <ul className="grid grid-cols-2 gap-2">
                            {(ingredients || materials || equipment)?.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2 text-white/80 bg-black/20 px-3 py-2 rounded-lg"
                                >
                                    <span className="text-amber-400">-</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Safety Notes */}
                {safetyNotes && safetyNotes.length > 0 && (
                    <div className="activity-safety bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <WarningIcon />
                            Safety Precautions
                        </h5>
                        <ul className="space-y-1">
                            {safetyNotes.map((note, i) => (
                                <li key={i} className="text-white/80 flex items-start gap-2">
                                    <span className="text-red-400 mt-1">-</span>
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Procedure */}
                {procedure && procedure.length > 0 && (
                    <div className="activity-procedure">
                        <h5 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                            Procedure
                        </h5>
                        <ol className="space-y-3">
                            {procedure.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-white/80">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/30 text-amber-300 text-sm font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Observations */}
                {observations && (
                    <div className="activity-observations bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <EyeIcon />
                            Observations
                        </h5>
                        <p className="text-white/80">{observations}</p>
                    </div>
                )}

                {/* Conclusion */}
                {conclusion && (
                    <div className="activity-conclusion bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <CheckIcon />
                            Conclusion
                        </h5>
                        <p className="text-white/80">{conclusion}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// ICONS
// ============================================

const ActivityIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const NoteIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TipIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

/**
 * NoteBox Component - For important notes
 */
export function NoteBox({
    children,
    title = "Note"
}: {
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <div className="note-box my-6 p-5 rounded-xl bg-cyan-900/30 border-l-4 border-cyan-500 backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <span className="text-cyan-400"><NoteIcon /></span>
                <div>
                    <strong className="text-cyan-400 block mb-1">{title}</strong>
                    <div className="text-white/80">{children}</div>
                </div>
            </div>
        </div>
    );
}

/**
 * TipBox Component - For helpful tips
 */
export function TipBox({
    children,
    title = "Tip"
}: {
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <div className="tip-box my-6 p-5 rounded-xl bg-emerald-900/30 border-l-4 border-emerald-500 backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <span className="text-emerald-400"><TipIcon /></span>
                <div>
                    <strong className="text-emerald-400 block mb-1">{title}</strong>
                    <div className="text-white/80">{children}</div>
                </div>
            </div>
        </div>
    );
}

/**
 * WarningBox Component - For safety warnings
 */
export function WarningBox({
    children,
    title = "Warning"
}: {
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <div className="warning-box my-6 p-5 rounded-xl bg-red-900/30 border-l-4 border-red-500 backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <span className="text-red-400"><WarningIcon /></span>
                <div>
                    <strong className="text-red-400 block mb-1">{title}</strong>
                    <div className="text-white/80">{children}</div>
                </div>
            </div>
        </div>
    );
}

/**
 * SafetyPrecautions Component - Standalone safety section
 */
export function SafetyPrecautions({
    items,
    title = "Safety Precautions"
}: {
    items: string[];
    title?: string;
}) {
    return (
        <div className="safety-precautions my-6 p-5 rounded-xl bg-red-900/30 border border-red-500/30">
            <h4 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
                <WarningIcon />
                {title}
            </h4>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/80">
                        <span className="text-red-400 mt-1">-</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
