/**
 * Image Generation API
 * 
 * Endpoints for generating educational images using DALL-E 3.
 * 
 * POST /api/images/generate
 * - Generate images for a textbook or specific image IDs
 * - Supports single or batch generation
 * - Returns progress via streaming for batch operations
 * 
 * GET /api/images/generate
 * - Get generation statistics and pending images
 */

import { NextRequest, NextResponse } from "next/server";
import {
    generateImage,
    generateImageBatch,
    generateTextbookImages,
    getPendingImages,
    getGenerationStats,
    getTextbookImages
} from "@/lib/api/imageGeneration";
import { adminDb } from "@/lib/firebaseAdmin";
import { ImageMetadata } from "@/types/textbook";

// ============================================
// POST - Generate Images
// ============================================

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode, textbookId, imageIds, imageId } = body;

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
            const result = await generateImage(imageMetadata);

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
            const pendingImages = await getPendingImages(body.limit || 10);

            if (pendingImages.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: "No pending images to generate",
                    completed: 0,
                    total: 0,
                    results: []
                });
            }

            const imageIds = pendingImages.map(img => img.id);
            const results = await generateImageBatch(imageIds);

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
                images: pending.map(img => ({
                    id: img.id,
                    caption: img.caption,
                    type: img.type,
                    textbookRef: img.textbookRef
                }))
            });
        }

        // Get images for a specific textbook
        if (action === "textbook" && textbookId) {
            const images = await getTextbookImages(textbookId);
            return NextResponse.json({
                textbookId,
                count: images.length,
                generated: images.filter(img => img.isGenerated).length,
                pending: images.filter(img => !img.isGenerated).length,
                images: images.map(img => ({
                    id: img.id,
                    caption: img.caption,
                    type: img.type,
                    isGenerated: img.isGenerated,
                    imageUrl: img.imageUrl
                }))
            });
        }

        return NextResponse.json(
            { error: "Invalid action. Use: stats, pending, or textbook" },
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
