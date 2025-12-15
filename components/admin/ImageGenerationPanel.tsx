/**
 * Image Generation Panel Component
 * 
 * Admin interface for generating DALL-E images:
 * - View pending images
 * - Generate single or batch images
 * - View generation progress
 * - Preview generated images
 */

"use client";

import React, { useState, useEffect } from "react";

// ============================================
// TYPES
// ============================================

interface ImageData {
    id: string;
    caption: string;
    type: string;
    textbookRef: string;
    isGenerated?: boolean;
    imageUrl?: string;
}

interface GenerationStats {
    total: number;
    generated: number;
    pending: number;
}

interface GenerationResult {
    success: boolean;
    imageId: string;
    imageUrl?: string;
    error?: string;
}

// ============================================
// ICONS
// ============================================

const ImageIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function ImageGenerationPanel() {
    const [stats, setStats] = useState<GenerationStats | null>(null);
    const [pendingImages, setPendingImages] = useState<ImageData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

    // Fetch stats on mount
    useEffect(() => {
        fetchStats();
        fetchPendingImages();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/images/generate?action=stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchPendingImages = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/images/generate?action=pending&limit=50");
            if (res.ok) {
                const data = await res.json();
                setPendingImages(data.images || []);
            }
        } catch (error) {
            console.error("Failed to fetch pending images:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSingleImage = async (imageId: string) => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/images/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "single", imageId })
            });

            const result = await res.json();
            setGenerationResults(prev => [...prev, result]);

            // Refresh lists
            await fetchStats();
            await fetchPendingImages();
        } catch (error) {
            console.error("Failed to generate image:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateSelectedImages = async () => {
        if (selectedImages.size === 0) return;

        setIsGenerating(true);
        setGenerationResults([]);

        try {
            const res = await fetch("/api/images/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "batch",
                    imageIds: Array.from(selectedImages)
                })
            });

            const data = await res.json();
            setGenerationResults(data.results || []);
            setSelectedImages(new Set());

            // Refresh lists
            await fetchStats();
            await fetchPendingImages();
        } catch (error) {
            console.error("Failed to generate images:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleImageSelection = (imageId: string) => {
        const newSelected = new Set(selectedImages);
        if (newSelected.has(imageId)) {
            newSelected.delete(imageId);
        } else {
            newSelected.add(imageId);
        }
        setSelectedImages(newSelected);
    };

    const selectAll = () => {
        if (selectedImages.size === pendingImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(pendingImages.map(img => img.id)));
        }
    };

    return (
        <div className="image-generation-panel bg-[#1e1e28] rounded-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="bg-[#252532] px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ImageIcon />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Image Generation</h3>
                            <p className="text-sm text-white/50">Generate DALL-E images for textbooks</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { fetchStats(); fetchPendingImages(); }}
                        disabled={isLoading}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshIcon />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            {stats && (
                <div className="px-6 py-4 bg-black/20 border-b border-white/10">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                            <div className="text-xs text-white/50 uppercase">Total Images</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">{stats.generated}</div>
                            <div className="text-xs text-white/50 uppercase">Generated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
                            <div className="text-xs text-white/50 uppercase">Pending</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedImages.size === pendingImages.length && pendingImages.length > 0}
                            onChange={selectAll}
                            className="rounded border-white/20 bg-white/10 text-purple-500"
                        />
                        Select All ({selectedImages.size})
                    </label>
                </div>

                <button
                    onClick={generateSelectedImages}
                    disabled={isGenerating || selectedImages.size === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon />
                            <span>Generate Selected</span>
                        </>
                    )}
                </button>
            </div>

            {/* Pending Images List */}
            <div className="p-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center py-8 text-white/50">Loading...</div>
                ) : pendingImages.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-emerald-400 mb-2">
                            <CheckIcon />
                        </div>
                        <div className="text-white/70">All images have been generated!</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {pendingImages.map((image) => (
                            <div
                                key={image.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedImages.has(image.id)
                                        ? "bg-purple-500/20 border-purple-500/50"
                                        : "bg-white/[0.02] border-white/5 hover:border-white/20"
                                    }`}
                                onClick={() => toggleImageSelection(image.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedImages.has(image.id)}
                                    onChange={() => toggleImageSelection(image.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded border-white/20 bg-white/10 text-purple-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white truncate">{image.caption}</div>
                                    <div className="text-xs text-white/40">
                                        {image.type} - {image.textbookRef}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        generateSingleImage(image.id);
                                    }}
                                    disabled={isGenerating}
                                    className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors disabled:opacity-50"
                                >
                                    Generate
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Generation Results */}
            {generationResults.length > 0 && (
                <div className="border-t border-white/10 p-4">
                    <h4 className="text-sm font-medium text-white/70 mb-3">Recent Results</h4>
                    <div className="space-y-2">
                        {generationResults.slice(-5).map((result, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-2 p-2 rounded text-sm ${result.success
                                        ? "bg-emerald-900/30 text-emerald-400"
                                        : "bg-red-900/30 text-red-400"
                                    }`}
                            >
                                {result.success ? <CheckIcon /> : <AlertIcon />}
                                <span className="truncate">
                                    {result.success
                                        ? `Generated: ${result.imageId}`
                                        : `Failed: ${result.error}`}
                                </span>
                                {result.imageUrl && (
                                    <a
                                        href={result.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs underline ml-auto"
                                    >
                                        View
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
