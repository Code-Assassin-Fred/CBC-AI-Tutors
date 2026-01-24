/**
 * GenerationProgress Component
 * 
 * Displays real-time progress during textbook generation.
 * Shows streaming logs like an AI agent working.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

// ============================================
// TYPES
// ============================================

interface ProgressEvent {
    type: "start" | "phase" | "substrand" | "content" | "image" | "save" | "complete" | "error";
    message: string;
    details?: {
        phase?: string;
        substrand?: string;
        current?: number;
        total?: number;
        candidates?: Array<{ title: string; url: string; thumb: string }>;
    };
    timestamp: string;
}

interface GenerationProgressProps {
    isGenerating: boolean;
    grade: string;
    subject: string;
    strand: string;
    pipelineMode?: "Standard" | "Agentic";
    generatedBy?: string;
    onComplete?: (success: boolean) => void;
}

// ============================================
// ICONS
// ============================================

const StartIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const PhaseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const SubstrandIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const ContentIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const ImageIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const SaveIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const CompleteIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DotIcon = () => (
    <span className="w-2 h-2 bg-current rounded-full inline-block" />
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function GenerationProgress({
    isGenerating,
    grade,
    subject,
    strand,
    pipelineMode = "Standard",
    generatedBy,
    onComplete
}: GenerationProgressProps) {
    const [events, setEvents] = useState<ProgressEvent[]>([]);
    const [status, setStatus] = useState<"idle" | "running" | "complete" | "error">("idle");
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [events]);

    // Start generation when isGenerating becomes true
    useEffect(() => {
        if (!isGenerating) return;

        setEvents([]);
        setStatus("running");
        setProgress({ current: 0, total: 0 });

        startGeneration();
    }, [isGenerating, grade, subject, strand, pipelineMode]);

    const startGeneration = async () => {
        const endpoint = pipelineMode === "Agentic"
            ? "/api/generate-strand-agentic"
            : "/api/generate-strand-stream";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grade, subject, strand, generatedBy })
            });

            if (!response.ok || !response.body) {
                throw new Error("Failed to start generation");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const event: ProgressEvent = JSON.parse(line.slice(6));
                            handleEvent(event);
                        } catch (e) {
                            console.error("Failed to parse event:", line);
                        }
                    }
                }
            }
        } catch (error: any) {
            setEvents(prev => [...prev, {
                type: "error",
                message: `[ERROR] Connection error: ${error.message}`,
                timestamp: new Date().toISOString()
            }]);
            setStatus("error");
            onComplete?.(false);
        }
    };

    const handleEvent = (event: ProgressEvent) => {
        setEvents(prev => [...prev, event]);

        // Update progress if available
        if (event.details?.current && event.details?.total) {
            setProgress({
                current: event.details.current,
                total: event.details.total
            });
        }

        // Update status
        if (event.type === "complete") {
            setStatus("complete");
            onComplete?.(true);
        } else if (event.type === "error") {
            setStatus("error");
            onComplete?.(false);
        }
    };

    // Get icon for event type
    const getEventIcon = (type: string) => {
        switch (type) {
            case "start": return <StartIcon />;
            case "phase": return <PhaseIcon />;
            case "substrand": return <SubstrandIcon />;
            case "content": return <ContentIcon />;
            case "image": return <ImageIcon />;
            case "save": return <SaveIcon />;
            case "complete": return <CompleteIcon />;
            case "error": return <ErrorIcon />;
            default: return <DotIcon />;
        }
    };

    // Get color for event type
    const getEventColor = (type: string) => {
        switch (type) {
            case "start": return "text-blue-400";
            case "phase": return "text-purple-400";
            case "substrand": return "text-amber-400";
            case "content": return "text-green-400";
            case "image": return "text-pink-400";
            case "save": return "text-cyan-400";
            case "complete": return "text-emerald-400";
            case "error": return "text-red-400";
            default: return "text-white/60";
        }
    };

    if (!isGenerating && status === "idle") return null;

    return (
        <div className="generation-progress bg-[#0a0a15] rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-[#1a1a2e] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {status === "running" && (
                        <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    {status === "complete" && (
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                    {status === "error" && (
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                    )}
                    <h3 className="text-lg font-semibold text-white">
                        {status === "running" && "AI is generating textbook content..."}
                        {status === "complete" && "Generation Complete"}
                        {status === "error" && "Generation Failed"}
                    </h3>
                </div>

                {/* Progress bar */}
                {progress.total > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white/60">
                            {progress.current}/{progress.total} sub-strands
                        </span>
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Logs */}
            <div className="p-4 max-h-96 overflow-y-auto font-mono text-sm space-y-1">
                {events.map((event, i) => (
                    <div
                        key={i}
                        className={`flex items-start gap-3 py-1 ${getEventColor(event.type)} animate-fadeIn`}
                    >
                        <span className="flex-shrink-0 mt-0.5">{getEventIcon(event.type)}</span>
                        <span className="text-white/40 text-xs min-w-[70px]">
                            {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex-1 space-y-2">
                            <span>{event.message}</span>
                            {event.details?.candidates && (
                                <div className="flex gap-2 overflow-x-auto py-2">
                                    {event.details.candidates.map((c, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-24 space-y-1">
                                            <div className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                                                <img src={c.thumb || c.url} alt={c.title} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="text-[8px] text-white/40 truncate">{c.title}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {status === "running" && (
                    <div className="flex items-center gap-3 py-1 text-white/40">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                        <span>Processing...</span>
                    </div>
                )}

                <div ref={logsEndRef} />
            </div>

            {/* Footer with stats */}
            {status === "complete" && (
                <div className="bg-emerald-900/20 border-t border-emerald-500/30 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-medium">
                            Content ready to view
                        </span>
                        <span className="text-white/60 text-sm">
                            {events.length} steps completed
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
