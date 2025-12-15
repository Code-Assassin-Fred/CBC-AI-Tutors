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
    // Determine icon based on content type
    const icon = ingredients ? "👩‍🍳" : "🔬";

    return (
        <div className={`activity-box my-8 rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/30 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-amber-600/20 border-b border-amber-500/30 px-6 py-4 flex items-center justify-between">
                <h4 className="text-xl font-bold text-amber-300 flex items-center gap-3 m-0">
                    <span className="text-2xl">{icon}</span>
                    <span>Activity: {title}</span>
                </h4>
                {duration && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-sm rounded-full">
                        ⏱️ {duration}
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
                                    <span className="text-amber-400">•</span>
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
                            <span>⚠️</span>
                            Safety Precautions
                        </h5>
                        <ul className="space-y-1">
                            {safetyNotes.map((note, i) => (
                                <li key={i} className="text-white/80 flex items-start gap-2">
                                    <span className="text-red-400 mt-1">•</span>
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
                            <span>👁️</span>
                            Observations
                        </h5>
                        <p className="text-white/80">{observations}</p>
                    </div>
                )}

                {/* Conclusion */}
                {conclusion && (
                    <div className="activity-conclusion bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span>✅</span>
                            Conclusion
                        </h5>
                        <p className="text-white/80">{conclusion}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * NoteBox Component - For important notes
 */
export function NoteBox({
    children,
    title = "Note",
    icon = "📝"
}: {
    children: React.ReactNode;
    title?: string;
    icon?: string;
}) {
    return (
        <div className="note-box my-6 p-5 rounded-xl bg-cyan-900/30 border-l-4 border-cyan-500 backdrop-blur-sm">
            <div className="flex items-start gap-3">
                <span className="text-xl">{icon}</span>
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
                <span className="text-xl">💡</span>
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
                <span className="text-xl">⚠️</span>
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
                <span>⚠️</span>
                {title}
            </h4>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/80">
                        <span className="text-red-400 mt-1">•</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
