/**
 * DALL-E Image Generation Service
 * 
 * Generates educational images using Gemini 3 Pro.
 * Handles:
 * - Image generation with educational prompts
 * - Firebase Storage upload for permanent hosting
 * - Firestore metadata updates
 * - Rate limiting and error handling
 */

import { generateImageWithGemini } from "./geminiImageGeneration";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";
import { ImageMetadata } from "@/types/textbook";

// ============================================
// CONFIGURATION
// ============================================

// Rate limiting
const GENERATION_DELAY_MS = 2000;  // Wait between generations

// Storage settings
const STORAGE_FOLDER = "textbook-images";

// ============================================
// TYPES
// ============================================

export interface GenerationResult {
    success: boolean;
    imageId: string;
    imageUrl?: string;
    storageUrl?: string;
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
// FIREBASE STORAGE UPLOAD
// ============================================

/**
 * Download image from URL and upload to Firebase Storage
 */
async function uploadToFirebaseStorage(
    imageUrl: string,
    imageId: string,
    metadata: {
        grade: string;
        subject: string;
        strand: string;
    }
): Promise<string> {
    console.log(`[Storage] Downloading image for: ${imageId}`);

    // Download the image from DALL-E URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create storage path: textbook-images/{grade}/{subject}/{imageId}.png
    const sanitizedSubject = metadata.subject.replace(/[^a-zA-Z0-9]/g, "_");
    const storagePath = `${STORAGE_FOLDER}/${metadata.grade}/${sanitizedSubject}/${imageId}.png`;

    console.log(`[Storage] Uploading to: ${storagePath}`);

    // Get bucket and create file reference
    // Explicitly use bucket name to avoid "Bucket name not specified" error
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const bucket = adminStorage.bucket(bucketName);
    const file = bucket.file(storagePath);

    // Upload the image
    await file.save(buffer, {
        metadata: {
            contentType: "image/png",
            metadata: {
                imageId,
                grade: metadata.grade,
                subject: metadata.subject,
                strand: metadata.strand,
                generatedAt: new Date().toISOString()
            }
        }
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    console.log(`[Storage] Upload complete: ${publicUrl}`);

    return publicUrl;
}

// ============================================
// SINGLE IMAGE GENERATION
// ============================================

/**
 * Generate a single image using DALL-E 3 and upload to Firebase Storage
 */
export async function generateImage(
    imageMetadata: ImageMetadata,
    uploadToStorage: boolean = true
): Promise<GenerationResult> {
    try {
        console.log(`[DALL-E] Generating image: ${imageMetadata.id}`);
        console.log(`[DALL-E] Prompt: ${imageMetadata.generationPrompt.substring(0, 100)}...`);

        // Call DALL-E 3
        const result = await generateImageWithGemini(imageMetadata);

        if (!result.success) {
            throw new Error(result.error || "Gemini image generation failed");
        }

        return {
            success: true,
            imageId: imageMetadata.id,
            imageUrl: result.imageUrl,
            storageUrl: result.imageUrl,
        };
    } catch (error: any) {
        console.error(`[Gemini Image] Error generating ${imageMetadata.id}:`, error.message);

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
    onProgress?: (progress: BatchGenerationProgress) => void,
    uploadToStorage: boolean = true
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

        // Skip if already generated with storage URL
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
        const result = await generateImage(imageMetadata, uploadToStorage);
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
// RE-UPLOAD EXISTING IMAGES
// ============================================

/**
 * Re-upload images that only have DALL-E URLs to Firebase Storage
 * Useful for migrating existing images to permanent storage
 */
export async function migrateImagesToStorage(
    limit: number = 50,
    onProgress?: (progress: { completed: number; total: number; current: string }) => void
): Promise<{ success: number; failed: number }> {
    // Find images with DALL-E URLs but no storage URL
    const snapshot = await adminDb
        .collection("images")
        .where("isGenerated", "==", true)
        .limit(limit)
        .get();

    const imagesToMigrate = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.imageUrl && !data.storageUrl;
    });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < imagesToMigrate.length; i++) {
        const doc = imagesToMigrate[i];
        const data = doc.data() as ImageMetadata;

        try {
            const storageUrl = await uploadToFirebaseStorage(
                data.imageUrl!,
                doc.id,
                {
                    grade: data.grade,
                    subject: data.subject,
                    strand: data.strand
                }
            );

            await adminDb.collection("images").doc(doc.id).update({
                storageUrl,
                imageUrl: storageUrl,
                dalleUrl: data.imageUrl
            });

            success++;
        } catch (error: any) {
            console.error(`Failed to migrate ${doc.id}:`, error.message);
            failed++;
        }

        onProgress?.({
            completed: i + 1,
            total: imagesToMigrate.length,
            current: doc.id
        });
    }

    return { success, failed };
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
    inStorage: number;
}> {
    const allSnapshot = await adminDb.collection("images").count().get();
    const generatedSnapshot = await adminDb
        .collection("images")
        .where("isGenerated", "==", true)
        .count()
        .get();

    const total = allSnapshot.data().count;
    const generated = generatedSnapshot.data().count;

    // Count images with storage URLs (approximate - would need additional query)
    const inStorage = generated; // Assume all generated images are in storage

    return {
        total,
        generated,
        pending: total - generated,
        inStorage
    };
}

/**
 * Delete an image from storage and Firestore
 */
export async function deleteImage(imageId: string): Promise<boolean> {
    try {
        const doc = await adminDb.collection("images").doc(imageId).get();
        if (!doc.exists) return false;

        const data = doc.data();

        // Delete from storage if exists
        if (data?.storageUrl) {
            try {
                const bucket = adminStorage.bucket();
                const urlParts = data.storageUrl.split(`${bucket.name}/`);
                if (urlParts[1]) {
                    const file = bucket.file(urlParts[1]);
                    await file.delete();
                }
            } catch (storageError) {
                console.warn(`Failed to delete from storage: ${storageError}`);
            }
        }

        // Delete from Firestore
        await adminDb.collection("images").doc(imageId).delete();

        return true;
    } catch (error) {
        console.error(`Failed to delete image ${imageId}:`, error);
        return false;
    }
}
