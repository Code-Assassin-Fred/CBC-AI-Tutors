/**
 * Gemini 2.5 Flash Image Generation Service
 * 
 * Generates educational images using Google's Gemini 2.5 Flash model.
 * Key features:
 * - Can generate text/labels in images (unlike DALL-E)
 * - Supports labeled diagrams for educational content
 * - Smaller image sizes for better performance
 * - Firebase Storage integration
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";
import { ImageMetadata, ImageCategory } from "@/types/textbook";

// ============================================
// CONFIGURATION
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("[Gemini] Warning: GEMINI_IMAGE_API_KEY not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// Image settings - smaller sizes than DALL-E default
const IMAGE_CONFIG = {
    model: "gemini-2.0-flash-exp",  // Gemini 2.5 Flash with image generation
    mimeType: "image/png" as const,
    maxRetries: 3,
    retryDelayMs: 2000,
};

// Rate limiting
const GENERATION_DELAY_MS = 1500;

// Storage settings
const STORAGE_FOLDER = "textbook-images";

// ============================================
// TYPES
// ============================================

export interface GeminiGenerationResult {
    success: boolean;
    imageId: string;
    imageUrl?: string;
    error?: string;
}

export interface BatchGenerationProgress {
    completed: number;
    total: number;
    currentImage?: string;
    results: GeminiGenerationResult[];
}

// ============================================
// PROMPT BUILDERS
// ============================================

/**
 * Build a Gemini prompt based on image category
 */
function buildGeminiPrompt(metadata: ImageMetadata): string {
    const basePrompt = metadata.generationPrompt;

    if (metadata.category === "labeled_diagram") {
        // For labeled diagrams, explicitly request text labels
        return `
${basePrompt}

CRITICAL REQUIREMENTS FOR THIS LABELED DIAGRAM:
- Include clear text labels pointing to each important part
- Use simple, readable font for labels
- Labels should be in English
- Use arrows or lines connecting labels to parts
- Keep the diagram clean and educational
- White or light background for clarity
- Make labels large enough to read easily
- This is for Grade ${metadata.grade} students

Parts to label:
${metadata.labeledParts?.map(p => `- ${p.partName}: ${p.location}`).join("\n") || "Label all key parts visible in the diagram"}
        `.trim();
    }

    // For illustrations and photographs, no labels needed
    return `
${basePrompt}

STYLE REQUIREMENTS:
- NO text or labels in the image
- Clean, educational illustration style
- Age-appropriate for Grade ${metadata.grade} students
- Colorful and engaging
- White or light neutral background
- High contrast for clarity
    `.trim();
}

/**
 * Get style guidance based on grade level
 */
function getGradeStyleGuide(grade: string): string {
    const gradeNum = parseInt(grade);

    if (gradeNum <= 3) {
        return "Very colorful, cartoon-like, friendly characters with big eyes, simple shapes, thick outlines. Like a children's picture book.";
    } else if (gradeNum <= 5) {
        return "Colorful, semi-cartoon style with clear shapes. Friendly and approachable. Bold colors.";
    } else if (gradeNum <= 8) {
        return "Semi-realistic educational illustration. Clear details, good proportions. Professional textbook quality.";
    } else {
        return "Realistic, detailed educational illustration. Accurate proportions and details. Publication quality.";
    }
}

// ============================================
// IMAGE GENERATION
// ============================================

/**
 * Generate a single image using Gemini 2.5 Flash
 */
export async function generateImageWithGemini(
    imageMetadata: ImageMetadata
): Promise<GeminiGenerationResult> {
    try {
        console.log(`[Gemini] Generating image: ${imageMetadata.id}`);
        console.log(`[Gemini] Category: ${imageMetadata.category}`);

        const prompt = buildGeminiPrompt(imageMetadata);
        console.log(`[Gemini] Prompt preview: ${prompt.substring(0, 150)}...`);

        // Use Gemini with image generation capability
        const model = genAI.getGenerativeModel({
            model: IMAGE_CONFIG.model,
            generationConfig: {
                // @ts-ignore - Gemini SDK types may not include all options
                responseModalities: ["image", "text"],
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;

        // Extract image from response
        let imageData: string | null = null;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.mimeType?.startsWith("image/")) {
                imageData = part.inlineData.data;
                break;
            }
        }

        if (!imageData) {
            throw new Error("No image data returned from Gemini");
        }

        console.log(`[Gemini] Image generated, uploading to Firebase Storage...`);

        // Upload to Firebase Storage
        const storageUrl = await uploadImageToStorage(
            imageData,
            imageMetadata.id,
            {
                grade: imageMetadata.grade,
                subject: imageMetadata.subject,
                strand: imageMetadata.strand,
                category: imageMetadata.category
            }
        );

        // Update Firestore with the image URL
        await adminDb.collection("images").doc(imageMetadata.id).update({
            imageUrl: storageUrl,
            isGenerated: true,
            generatedAt: new Date(),
            generationModel: "gemini-2.0-flash-exp"
        });

        console.log(`[Gemini] Successfully generated: ${imageMetadata.id}`);

        return {
            success: true,
            imageId: imageMetadata.id,
            imageUrl: storageUrl
        };

    } catch (error: any) {
        console.error(`[Gemini] Error generating ${imageMetadata.id}:`, error.message);

        // Update Firestore with error
        try {
            await adminDb.collection("images").doc(imageMetadata.id).update({
                lastError: error.message,
                lastAttempt: new Date()
            });
        } catch (e) {
            // Ignore update errors
        }

        return {
            success: false,
            imageId: imageMetadata.id,
            error: error.message
        };
    }
}

// ============================================
// FIREBASE STORAGE
// ============================================

/**
 * Upload base64 image data to Firebase Storage
 */
async function uploadImageToStorage(
    base64Data: string,
    imageId: string,
    metadata: {
        grade: string;
        subject: string;
        strand: string;
        category: string;
    }
): Promise<string> {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Create storage path
    const sanitizedSubject = metadata.subject.replace(/[^a-zA-Z0-9]/g, "_");
    const storagePath = `${STORAGE_FOLDER}/${metadata.grade}/${sanitizedSubject}/${imageId}.png`;

    console.log(`[Storage] Uploading to: ${storagePath}`);

    // Get bucket
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const bucket = adminStorage.bucket(bucketName);
    const file = bucket.file(storagePath);

    // Upload
    await file.save(buffer, {
        metadata: {
            contentType: "image/png",
            metadata: {
                imageId,
                grade: metadata.grade,
                subject: metadata.subject,
                strand: metadata.strand,
                category: metadata.category,
                generatedAt: new Date().toISOString(),
                generator: "gemini-2.0-flash-exp"
            }
        }
    });

    // Make public
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    console.log(`[Storage] Upload complete: ${publicUrl}`);

    return publicUrl;
}

// ============================================
// BATCH GENERATION
// ============================================

/**
 * Generate multiple images with progress callback
 */
export async function generateImageBatch(
    imageIds: string[],
    onProgress?: (progress: BatchGenerationProgress) => void
): Promise<BatchGenerationProgress> {
    const results: GeminiGenerationResult[] = [];
    const total = imageIds.length;

    console.log(`[Gemini] Starting batch generation of ${total} images`);

    for (let i = 0; i < imageIds.length; i++) {
        const imageId = imageIds[i];

        // Fetch image metadata from Firestore
        const doc = await adminDb.collection("images").doc(imageId).get();

        if (!doc.exists) {
            console.log(`[Gemini] Image metadata not found: ${imageId}`);
            results.push({
                success: false,
                imageId,
                error: "Image metadata not found"
            });
            continue;
        }

        const imageMetadata = { id: doc.id, ...doc.data() } as ImageMetadata;

        // Skip if already generated
        if (imageMetadata.isGenerated && imageMetadata.imageUrl) {
            console.log(`[Gemini] Skipping already generated: ${imageId}`);
            results.push({
                success: true,
                imageId,
                imageUrl: imageMetadata.imageUrl
            });
            continue;
        }

        // Generate image
        const result = await generateImageWithGemini(imageMetadata);
        results.push(result);

        // Report progress
        onProgress?.({
            completed: i + 1,
            total,
            currentImage: imageId,
            results
        });

        // Rate limiting between generations
        if (i < imageIds.length - 1) {
            await delay(GENERATION_DELAY_MS);
        }
    }

    console.log(`[Gemini] Batch complete: ${results.filter(r => r.success).length}/${total} successful`);

    return {
        completed: total,
        total,
        results
    };
}

/**
 * Generate all pending images for a textbook
 */
export async function generateTextbookImages(
    textbookId: string,
    onProgress?: (progress: BatchGenerationProgress) => void
): Promise<BatchGenerationProgress> {
    const textbookDoc = await adminDb.collection("textbooks").doc(textbookId).get();

    if (!textbookDoc.exists) {
        throw new Error(`Textbook not found: ${textbookId}`);
    }

    const textbookData = textbookDoc.data();
    const imageIds = textbookData?.student_content?.imageIds || [];

    if (imageIds.length === 0) {
        console.log(`[Gemini] No images to generate for ${textbookId}`);
        return {
            completed: 0,
            total: 0,
            results: []
        };
    }

    console.log(`[Gemini] Generating ${imageIds.length} images for ${textbookId}`);

    return generateImageBatch(imageIds, onProgress);
}

// ============================================
// UTILITIES
// ============================================

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get pending images that haven't been generated
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

// ============================================
// COURSE THUMBNAIL GENERATION
// ============================================

/**
 * Generate a course thumbnail using Gemini 2.0 Flash
 * Returns the Firebase Storage URL or null if generation fails
 */
export async function generateCourseThumbnail(params: {
    courseId: string;
    title: string;
    topic: string;
    tags: string[];
}): Promise<string | null> {
    try {
        console.log(`[Gemini Thumbnail] Generating thumbnail for course: ${params.courseId}`);

        // Import the prompt builder dynamically to avoid circular dependencies
        const { buildCourseThumbnailPrompt } = await import('@/lib/prompts/coursePrompts');
        const prompt = buildCourseThumbnailPrompt({
            title: params.title,
            topic: params.topic,
            tags: params.tags
        });

        console.log(`[Gemini Thumbnail] Prompt preview: ${prompt.substring(0, 100)}...`);

        // Use Gemini with image generation capability
        const model = genAI.getGenerativeModel({
            model: IMAGE_CONFIG.model,
            generationConfig: {
                // @ts-ignore - Gemini SDK types may not include all options
                responseModalities: ["image", "text"],
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;

        // Extract image from response
        let imageData: string | null = null;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.mimeType?.startsWith("image/")) {
                imageData = part.inlineData.data;
                break;
            }
        }

        if (!imageData) {
            console.error("[Gemini Thumbnail] No image data returned from Gemini");
            return null;
        }

        console.log(`[Gemini Thumbnail] Image generated, uploading to Firebase Storage...`);

        // Upload to Firebase Storage
        const storageUrl = await uploadCourseThumbnailToStorage(imageData, params.courseId);

        console.log(`[Gemini Thumbnail] Successfully generated and uploaded: ${storageUrl}`);

        return storageUrl;

    } catch (error: any) {
        console.error(`[Gemini Thumbnail] Error generating thumbnail for ${params.courseId}:`, error.message);
        return null;
    }
}

/**
 * Upload course thumbnail to Firebase Storage
 */
async function uploadCourseThumbnailToStorage(
    base64Data: string,
    courseId: string
): Promise<string> {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Create storage path for course thumbnails
    const storagePath = `course-thumbnails/${courseId}.png`;

    console.log(`[Storage] Uploading course thumbnail to: ${storagePath}`);

    // Get bucket
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    const bucket = adminStorage.bucket(bucketName);
    const file = bucket.file(storagePath);

    // Upload
    await file.save(buffer, {
        metadata: {
            contentType: "image/png",
            metadata: {
                courseId,
                generatedAt: new Date().toISOString(),
                generator: "gemini-2.0-flash-exp"
            }
        }
    });

    // Make public
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    console.log(`[Storage] Course thumbnail upload complete: ${publicUrl}`);

    return publicUrl;
}

