/**
 * ImageFigure Component
 * 
 * Renders images with captions and supports:
 * - Generated images (with URL)
 * - Placeholder images (awaiting generation)
 * - Image descriptions for accessibility
 * - Admin view shows AI description for review
 */

"use client";

import React, { useState } from "react";
import { ImageMetadata } from "@/types/textbook";

interface ImageFigureProps {
    image: ImageMetadata;
    showDescription?: boolean;  // Show AI description (admin mode)
    className?: string;
}

export default function ImageFigure({
    image,
    showDescription = false,
    className = ""
}: ImageFigureProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <figure className={`image-figure my-8 ${className}`}>
            {/* Image or Placeholder */}
            {image.imageUrl && image.isGenerated ? (
                <img
                    src={image.imageUrl}
                    alt={image.description}
                    className="rounded-xl mx-auto block max-w-full h-auto shadow-lg border border-white/10"
                    loading="lazy"
                />
            ) : (
                <div className="image-placeholder bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-dashed border-purple-500/40 rounded-xl p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        {/* Placeholder Icon */}
                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-3xl">🖼️</span>
                        </div>

                        {/* Image Type Badge */}
                        <span className="px-3 py-1 bg-purple-500/30 text-purple-300 text-xs font-medium rounded-full uppercase">
                            {image.type}
                        </span>

                        {/* Caption Preview */}
                        <p className="text-white/70 text-sm max-w-md">
                            {image.caption}
                        </p>

                        {/* Generation Status */}
                        <p className="text-white/40 text-xs">
                            Image pending generation
                        </p>
                    </div>
                </div>
            )}

            {/* Caption */}
            <figcaption className="mt-4 text-center text-sm text-white/60 italic">
                {image.caption}
            </figcaption>

            {/* AI Description (Admin/Debug Mode) */}
            {showDescription && (
                <div className="mt-4 bg-black/30 rounded-lg border border-white/10 overflow-hidden">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full px-4 py-2 flex items-center justify-between text-left text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
                    >
                        <span className="text-xs font-medium flex items-center gap-2">
                            <span>🤖</span>
                            AI Tutor Description
                        </span>
                        <span className="text-xs">
                            {isExpanded ? "▼" : "▶"}
                        </span>
                    </button>

                    {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 text-sm">
                            <div>
                                <h5 className="text-white/50 text-xs uppercase tracking-wider mb-1">
                                    Visual Description
                                </h5>
                                <p className="text-white/70">
                                    {image.description}
                                </p>
                            </div>

                            <div>
                                <h5 className="text-white/50 text-xs uppercase tracking-wider mb-1">
                                    Educational Context
                                </h5>
                                <p className="text-white/70">
                                    {image.educationalContext}
                                </p>
                            </div>

                            <div>
                                <h5 className="text-white/50 text-xs uppercase tracking-wider mb-1">
                                    Generation Prompt
                                </h5>
                                <p className="text-white/50 text-xs font-mono bg-black/30 p-2 rounded">
                                    {image.generationPrompt}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </figure>
    );
}

/**
 * Simple placeholder for inline image references in HTML
 */
export function ImagePlaceholderInline({
    caption,
    imageId
}: {
    caption: string;
    imageId?: string;
}) {
    return (
        <div
            className="inline-block bg-purple-900/30 border border-purple-500/30 rounded-lg px-3 py-2 my-2"
            data-image-id={imageId}
        >
            <span className="text-purple-300 text-sm">
                🖼️ {caption}
            </span>
        </div>
    );
}
