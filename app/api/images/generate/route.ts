/**
 * Image Generation API
 * 
 * Endpoints for generating educational images using Gemini 3 Pro.
 */

import { NextRequest, NextResponse } from "next/server";
import {
    generateImageWithGemini,
    generateImageBatch,
    generateTextbookImages,
    getPendingImages,
    getGenerationStats
} from "@/lib/api/geminiImageGeneration";
import { adminDb } from "@/lib/firebaseAdmin";
import { ImageMetadata } from "@/types/textbook";


// ============================================
// POST - Generate Images
// ============================================

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode, textbookId, imageIds, imageId, limit } = body;

        // Single image generation
        if (mode === "single" && imageId) {
            const doc = await adminDb.collection("images").doc(imageId).get();

            if (!doc.exists) {
                return NextResponse.json(
                    { error: "Image not found" },
                    { status: 404 }
                );
            }

            const imageMetadata = { id: doc.id, ...doc.data() } as ImageMetadata;
            const result = await generateImageWithGemini(imageMetadata);

            return NextResponse.json(result);
        }

        // Batch generation for specific image IDs
        if (mode === "batch" && imageIds && Array.isArray(imageIds)) {
            const results = await generateImageBatch(imageIds);

            return NextResponse.json({
                success: true,
                ...results
            });
        }

        // Generate all images for a textbook
        if (mode === "textbook" && textbookId) {
            const results = await generateTextbookImages(textbookId);

            return NextResponse.json({
                success: true,
                textbookId,
                ...results
            });
        }

        // Generate all pending images
        if (mode === "pending") {
            const pendingImages = await getPendingImages(limit || 10);

            if (pendingImages.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: "No pending images to generate",
                    completed: 0,
                    total: 0,
                    results: []
                });
            }

            const pendingIds = pendingImages.map(img => img.id);
            const results = await generateImageBatch(pendingIds);

            return NextResponse.json({
                success: true,
                ...results
            });
        }

        return NextResponse.json(
            { error: "Invalid mode. Use: single, batch, textbook, or pending" },
            { status: 400 }
        );

    } catch (error: any) {
        console.error("[Image Generation API] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate images" },
            { status: 500 }
        );
    }
}

// ============================================
// GET - Generation Status & Stats
// ============================================

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "stats";
        const textbookId = searchParams.get("textbookId");
        const limit = parseInt(searchParams.get("limit") || "20");

        // Get overall statistics
        if (action === "stats") {
            const stats = await getGenerationStats();
            return NextResponse.json(stats);
        }

        // Get pending images
        if (action === "pending") {
            const pending = await getPendingImages(limit);
            return NextResponse.json({
                count: pending.length,
                images: pending.map((img: ImageMetadata) => ({
                    id: img.id,
                    caption: img.caption,
                    type: img.type,
                    category: img.category,
                    textbookRef: img.textbookRef
                }))
            });
        }

        return NextResponse.json(
            { error: "Invalid action. Use: stats or pending" },
            { status: 400 }
        );

    } catch (error: any) {
        console.error("[Image Generation API] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get image data" },
            { status: 500 }
        );
    }
}
