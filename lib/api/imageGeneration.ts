/**
 * DALL-E Image Generation Service
 * 
 * Generates educational images using OpenAI's DALL-E 3.
 * Handles:
 * - Image generation with educational prompts
 * - Firebase Storage upload
 * - Firestore metadata updates
 * - Rate limiting and error handling
 */

import OpenAI from "openai";
import { adminDb } from "@/lib/firebaseAdmin";
import { ImageMetadata } from "@/types/textbook";

// ============================================
// CONFIGURATION
// ============================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// DALL-E 3 settings
const DALLE_MODEL = "dall-e-3";
const IMAGE_SIZE = "1024x1024";
const IMAGE_QUALITY = "standard";  // "standard" or "hd"

// Rate limiting
const GENERATION_DELAY_MS = 2000;  // Wait between generations

// ============================================
// TYPES
// ============================================

export interface GenerationResult {
    success: boolean;
    imageId: string;
    imageUrl?: string;
    revisedPrompt?: string;
    error?: string;
}

export interface BatchGenerationProgress {
    completed: number;
    total: number;
    currentImage?: string;
    results: GenerationResult[];
}

// ============================================
// SINGLE IMAGE GENERATION
// ============================================

/**
 * Generate a single image using DALL-E 3
 */
export async function generateImage(
    imageMetadata: ImageMetadata
): Promise<GenerationResult> {
    try {
        console.log(`[DALL-E] Generating image: ${imageMetadata.id}`);
        console.log(`[DALL-E] Prompt: ${imageMetadata.generationPrompt.substring(0, 100)}...`);

        // Call DALL-E 3
        const response = await client.images.generate({
            model: DALLE_MODEL,
            prompt: imageMetadata.generationPrompt,
            n: 1,
            size: IMAGE_SIZE,
            quality: IMAGE_QUALITY,
            response_format: "url"
        });

        const generatedImageUrl = response.data[0]?.url;
        const revisedPrompt = response.data[0]?.revised_prompt;

        if (!generatedImageUrl) {
            throw new Error("No image URL returned from DALL-E");
        }

        console.log(`[DALL-E] Generated successfully: ${imageMetadata.id}`);

        // Update Firestore with the generated image URL
        await adminDb.collection("images").doc(imageMetadata.id).update({
            imageUrl: generatedImageUrl,
            isGenerated: true,
            generatedAt: new Date(),
            revisedPrompt: revisedPrompt || null
        });

        return {
            success: true,
            imageId: imageMetadata.id,
            imageUrl: generatedImageUrl,
            revisedPrompt
        };

    } catch (error: any) {
        console.error(`[DALL-E] Error generating ${imageMetadata.id}:`, error.message);

        // Update Firestore with error
        await adminDb.collection("images").doc(imageMetadata.id).update({
            lastError: error.message,
            lastAttempt: new Date()
        });

        return {
            success: false,
            imageId: imageMetadata.id,
            error: error.message
        };
    }
}

// ============================================
// BATCH IMAGE GENERATION
// ============================================

/**
 * Generate multiple images with progress callback
 */
export async function generateImageBatch(
    imageIds: string[],
    onProgress?: (progress: BatchGenerationProgress) => void
): Promise<BatchGenerationProgress> {
    const results: GenerationResult[] = [];
    const total = imageIds.length;

    for (let i = 0; i < imageIds.length; i++) {
        const imageId = imageIds[i];

        // Fetch image metadata from Firestore
        const doc = await adminDb.collection("images").doc(imageId).get();

        if (!doc.exists) {
            results.push({
                success: false,
                imageId,
                error: "Image metadata not found"
            });
            continue;
        }

        const imageMetadata = doc.data() as ImageMetadata;

        // Skip if already generated
        if (imageMetadata.isGenerated && imageMetadata.imageUrl) {
            console.log(`[DALL-E] Skipping already generated: ${imageId}`);
            results.push({
                success: true,
                imageId,
                imageUrl: imageMetadata.imageUrl
            });
            continue;
        }

        // Generate image
        const result = await generateImage(imageMetadata);
        results.push(result);

        // Report progress
        onProgress?.({
            completed: i + 1,
            total,
            currentImage: imageId,
            results
        });

        // Rate limiting: wait between generations
        if (i < imageIds.length - 1) {
            await delay(GENERATION_DELAY_MS);
        }
    }

    return {
        completed: total,
        total,
        results
    };
}

// ============================================
// TEXTBOOK IMAGE GENERATION
// ============================================

/**
 * Generate all pending images for a textbook
 */
export async function generateTextbookImages(
    textbookId: string,
    onProgress?: (progress: BatchGenerationProgress) => void
): Promise<BatchGenerationProgress> {
    // Fetch textbook document
    const textbookDoc = await adminDb.collection("textbooks").doc(textbookId).get();

    if (!textbookDoc.exists) {
        throw new Error(`Textbook not found: ${textbookId}`);
    }

    const textbookData = textbookDoc.data();
    const imageIds = textbookData?.student_content?.imageIds || [];

    if (imageIds.length === 0) {
        console.log(`[DALL-E] No images to generate for ${textbookId}`);
        return {
            completed: 0,
            total: 0,
            results: []
        };
    }

    console.log(`[DALL-E] Generating ${imageIds.length} images for ${textbookId}`);

    return generateImageBatch(imageIds, onProgress);
}

// ============================================
// QUERY PENDING IMAGES
// ============================================

/**
 * Get all images that haven't been generated yet
 */
export async function getPendingImages(limit: number = 50): Promise<ImageMetadata[]> {
    const snapshot = await adminDb
        .collection("images")
        .where("isGenerated", "==", false)
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as ImageMetadata[];
}

/**
 * Get images for a specific textbook
 */
export async function getTextbookImages(textbookId: string): Promise<ImageMetadata[]> {
    const snapshot = await adminDb
        .collection("images")
        .where("textbookRef", "==", textbookId)
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as ImageMetadata[];
}

// ============================================
// PROMPT ENHANCEMENT
// ============================================

/**
 * Enhance a generation prompt for better DALL-E results
 */
export function enhancePromptForDalle(
    prompt: string,
    imageType: string,
    grade: string
): string {
    const styleGuide = getStyleGuideForGrade(grade);

    return `${prompt}

Style Requirements:
- ${styleGuide}
- Educational illustration for a textbook
- Clean, clear composition with good contrast
- No text, labels, or watermarks in the image
- White or light neutral background for diagrams
- Age-appropriate for elementary/middle school students
- Professional quality suitable for print

Image Type: ${imageType}`;
}

function getStyleGuideForGrade(grade: string): string {
    const gradeNum = parseInt(grade);

    if (gradeNum <= 5) {
        return "Colorful, friendly, cartoon-like style with bold outlines. Simplified forms suitable for young children.";
    } else if (gradeNum <= 8) {
        return "Semi-realistic educational illustration style. Clear details with some stylization. Appropriate for middle schoolers.";
    } else {
        return "Realistic educational illustration style. Detailed and accurate. Appropriate for high school students.";
    }
}

// ============================================
// UTILITIES
// ============================================

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate that an image URL is still accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get generation statistics
 */
export async function getGenerationStats(): Promise<{
    total: number;
    generated: number;
    pending: number;
}> {
    const allSnapshot = await adminDb.collection("images").count().get();
    const generatedSnapshot = await adminDb
        .collection("images")
        .where("isGenerated", "==", true)
        .count()
        .get();

    const total = allSnapshot.data().count;
    const generated = generatedSnapshot.data().count;

    return {
        total,
        generated,
        pending: total - generated
    };
}
