/**
 * Streaming Generation API
 * 
 * Uses Server-Sent Events (SSE) to stream real-time progress
 * during textbook generation.
 * 
 * Progress events include:
 * - Phase transitions
 * - Sub-strand progress
 * - Image processing
 * - Completion status
 */

import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { adminDb } from "@/lib/firebaseAdmin";
import {
    buildLanguageInstructions,
    buildSubjectInstructions,
    getSubjectTemplate,
    extractImagePlaceholders,
    generateImageId,
    generateImagePrompts
} from "@/lib/prompts";
import { ImageMetadata } from "@/types/textbook";
import { generateImageBatch, BatchGenerationProgress } from "@/lib/api/geminiImageGeneration";

// ============================================
// CONFIGURATION
// ============================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4.1";
const TEMPERATURE = 0.4;
const MAX_TOKENS = 8000;

// ============================================
// PROGRESS EVENT TYPES
// ============================================

interface ProgressEvent {
    type: "start" | "phase" | "substrand" | "content" | "image" | "save" | "complete" | "error";
    message: string;
    details?: {
        phase?: string;
        substrand?: string;
        current?: number;
        total?: number;
        content?: string;
    };
    timestamp: string;
}

// ============================================
// SSE HELPER
// ============================================

function createSSEStream() {
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream({
        start(c) {
            controller = c;
        },
    });

    const send = (event: ProgressEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
    };

    const close = () => {
        controller.close();
    };

    return { stream, send, close };
}

// ============================================
// CURRICULUM LOADER
// ============================================

const loadGradeContent = (grade: string) => {
    const filePath = path.join(process.cwd(), "content", `Grade ${grade}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    const content = JSON.parse(raw);
    return content[grade] || content;
};

// ============================================
// MAIN STREAMING HANDLER
// ============================================

export async function POST(req: NextRequest) {
    const { stream, send, close } = createSSEStream();

    // Start processing in background
    (async () => {
        try {
            const body = await req.json();
            const { grade, subject, strand, generatedBy } = body;

            const timestamp = () => new Date().toISOString();

            // ========================================
            // INITIALIZATION
            // ========================================

            send({
                type: "start",
                message: `[START] Initializing textbook generation for ${grade} ${subject}`,
                details: { phase: "initialization" },
                timestamp: timestamp()
            });

            // Validate inputs
            if (!grade || !subject || !strand) {
                send({
                    type: "error",
                    message: "[ERROR] Missing required fields: grade, subject, or strand",
                    timestamp: timestamp()
                });
                close();
                return;
            }

            // Load curriculum
            send({
                type: "phase",
                message: "[LOAD] Loading curriculum data...",
                details: { phase: "loading" },
                timestamp: timestamp()
            });

            const curriculum = loadGradeContent(grade);

            if (!curriculum || !curriculum[subject]) {
                send({
                    type: "error",
                    message: `[ERROR] Invalid grade or subject: ${grade} ${subject}`,
                    timestamp: timestamp()
                });
                close();
                return;
            }

            const strands = curriculum[subject].Strands;
            const selectedStrand = strands[strand];

            if (!selectedStrand) {
                send({
                    type: "error",
                    message: `[ERROR] Strand not found: ${strand}`,
                    timestamp: timestamp()
                });
                close();
                return;
            }

            const subStrands = selectedStrand.SubStrands || selectedStrand;
            const subStrandEntries = Object.entries<any>(subStrands);
            const totalSubStrands = subStrandEntries.length;

            send({
                type: "phase",
                message: `[PLAN] Found ${totalSubStrands} sub-strand(s) to generate`,
                details: { phase: "planning", total: totalSubStrands },
                timestamp: timestamp()
            });

            // Build generation context
            const languageInstructions = buildLanguageInstructions(grade);
            const subjectInstructions = buildSubjectInstructions(subject);
            const template = getSubjectTemplate(subject);

            // ========================================
            // GENERATION LOOP
            // ========================================

            const allStudentHtml: string[] = [];
            const allTeacherHtml: string[] = [];
            const allImages: ImageMetadata[] = [];

            for (let i = 0; i < subStrandEntries.length; i++) {
                const [subName, details] = subStrandEntries[i];
                const outcomes = details.Outcomes || [];

                send({
                    type: "substrand",
                    message: `[SUBSTRAND] Processing ${i + 1}/${totalSubStrands}: ${subName}`,
                    details: {
                        substrand: subName,
                        current: i + 1,
                        total: totalSubStrands
                    },
                    timestamp: timestamp()
                });

                // ---- Generate Student Content ----
                send({
                    type: "content",
                    message: `[GENERATE] Creating student content for "${subName}"...`,
                    details: { phase: "student-content", substrand: subName },
                    timestamp: timestamp()
                });

                const studentPrompt = buildStudentPrompt(grade, subject, strand, subName, outcomes, template, languageInstructions, subjectInstructions);

                const studentResponse = await client.chat.completions.create({
                    model: MODEL,
                    messages: [
                        { role: "system", content: buildSystemPrompt(grade, subject) },
                        { role: "user", content: studentPrompt }
                    ],
                    temperature: TEMPERATURE,
                    max_tokens: MAX_TOKENS
                });

                const studentHtml = studentResponse.choices[0]?.message?.content || "";
                allStudentHtml.push(studentHtml);

                send({
                    type: "content",
                    message: `[DONE] Student content generated (${studentHtml.length} chars)`,
                    details: { phase: "student-content-done", substrand: subName },
                    timestamp: timestamp()
                });

                // ---- Generate Teacher Content ----
                send({
                    type: "content",
                    message: `[GENERATE] Creating teacher guide for "${subName}"...`,
                    details: { phase: "teacher-content", substrand: subName },
                    timestamp: timestamp()
                });

                const teacherPrompt = buildTeacherPrompt(grade, subject, strand, subName, outcomes, languageInstructions);

                const teacherResponse = await client.chat.completions.create({
                    model: MODEL,
                    messages: [
                        { role: "system", content: buildSystemPrompt(grade, subject).replace("Learner's Book", "Teacher's Guide") },
                        { role: "user", content: teacherPrompt }
                    ],
                    temperature: TEMPERATURE,
                    max_tokens: MAX_TOKENS
                });

                const teacherHtml = teacherResponse.choices[0]?.message?.content || "";
                allTeacherHtml.push(teacherHtml);

                send({
                    type: "content",
                    message: `[DONE] Teacher guide generated (${teacherHtml.length} chars)`,
                    details: { phase: "teacher-content-done", substrand: subName },
                    timestamp: timestamp()
                });

                // ---- Process Images ----
                send({
                    type: "image",
                    message: `[IMAGE] Processing image placeholders...`,
                    details: { phase: "images", substrand: subName },
                    timestamp: timestamp()
                });

                const placeholders = extractImagePlaceholders(studentHtml);

                placeholders.forEach((placeholder: { placeholder: string; description: string; position: number }, idx: number) => {
                    const imageId = generateImageId({ grade, subject, strand, index: allImages.length + idx });
                    const imageType = inferImageType(placeholder.description);
                    const prompts = generateImagePrompts({
                        subject, grade, strand, substrand: subName,
                        topic: subName,
                        imageType,
                        specificContent: placeholder.description,
                        caption: `Figure ${idx + 1}: ${summarize(placeholder.description)}`
                    });

                    allImages.push({
                        id: imageId,
                        textbookRef: `${grade}_${subject}_${strand}`.replace(/\s+/g, "_"),
                        // New classification
                        category: prompts.category,
                        type: imageType,
                        position: "inline",
                        caption: prompts.caption,
                        // New rich metadata for AI tutor
                        visualDescription: prompts.visualDescription,
                        labeledParts: prompts.labeledParts,
                        conceptExplanation: prompts.conceptExplanation,
                        tutorScript: prompts.tutorScript,
                        // Legacy fields
                        description: prompts.description,
                        educationalContext: prompts.educationalContext,
                        generationPrompt: prompts.generationPrompt,
                        isGenerated: false,
                        subject, grade, strand, substrand: subName,
                        createdAt: new Date()
                    });
                });

                send({
                    type: "image",
                    message: `[DONE] Found ${placeholders.length} image placeholder(s)`,
                    details: { phase: "images-done", substrand: subName },
                    timestamp: timestamp()
                });
            }

            // ========================================
            // SAVE TO FIRESTORE
            // ========================================

            send({
                type: "save",
                message: `[SAVE] Preparing to save to database...`,
                details: { phase: "saving" },
                timestamp: timestamp()
            });

            const finalStudentHtml = allStudentHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");
            const finalTeacherHtml = allTeacherHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");
            const docId = `${grade}_${subject}_${strand.replace(/\s+/g, "_")}`;

            // Save images
            send({
                type: "save",
                message: `[SAVE] Storing ${allImages.length} image metadata records...`,
                details: { phase: "saving-images" },
                timestamp: timestamp()
            });

            for (const image of allImages) {
                await adminDb.collection("images").doc(image.id).set({
                    ...image,
                    createdAt: new Date()
                });
            }

            // Save textbook
            send({
                type: "save",
                message: `[SAVE] Storing textbook document...`,
                details: { phase: "saving-textbook" },
                timestamp: timestamp()
            });

            // Start DALL-E Generation if there are images
            if (allImages.length > 0) {
                send({
                    type: "image",
                    message: `[IMAGE] Starting Gemini image generation for ${allImages.length} images...`,
                    details: { phase: "generating-images", total: allImages.length },
                    timestamp: timestamp()
                });

                try {
                    // Get IDs of images to generate
                    const imageIds = allImages.map(img => img.id);

                    // Generate images with SSE progress updates
                    await generateImageBatch(imageIds, (progress: BatchGenerationProgress) => {
                        send({
                            type: "image",
                            message: `[IMAGE] Generated image ${progress.completed}/${progress.total}`,
                            details: {
                                phase: "generating-images",
                                current: progress.completed,
                                total: progress.total,
                                content: progress.currentImage
                            },
                            timestamp: timestamp()
                        });
                    }); // Uses Gemini now

                    send({
                        type: "image",
                        message: `[IMAGE] Successfully generated ${allImages.length} images`,
                        details: { phase: "generating-images-complete" },
                        timestamp: timestamp()
                    });

                } catch (imgError: any) {
                    console.error("Image generation failed:", imgError);
                    send({
                        type: "image",
                        message: `[IMAGE] Background generation warning: ${imgError.message}`,
                        details: { phase: "generating-images-error" },
                        timestamp: timestamp()
                    });
                    // Don't fail the whole request, just log it
                }
            }

            await adminDb.collection("textbooks").doc(docId).set({
                grade, subject, strand,
                generatedAt: new Date(),
                generatedBy: generatedBy || "anonymous",
                version: "2.0",
                student_content: {
                    html: finalStudentHtml,
                    sections: [],
                    imageIds: allImages.map(img => img.id)
                },
                teacher_content: {
                    html: finalTeacherHtml,
                    sections: [],
                    imageIds: []
                },
                student_html: finalStudentHtml,
                teacher_html: finalTeacherHtml
            }, { merge: true });

            // ========================================
            // COMPLETE
            // ========================================

            send({
                type: "complete",
                message: `[COMPLETE] Generation finished! Created content for ${totalSubStrands} sub-strand(s) with ${allImages.length} images.`,
                details: {
                    phase: "complete",
                    total: totalSubStrands
                },
                timestamp: timestamp()
            });

        } catch (error: any) {
            send({
                type: "error",
                message: `[ERROR] ${error.message}`,
                timestamp: new Date().toISOString()
            });
        } finally {
            close();
        }
    })();

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

// ============================================
// PROMPT BUILDERS
// ============================================

function buildSystemPrompt(grade: string, subject: string): string {
    return `You are a senior Kenyan curriculum developer writing the official Grade ${grade} ${subject} textbook.
This is the authoritative Learner's Book published by KICD (Kenya Institute of Curriculum Development).

Your content must be:
1. Accurate and educationally sound
2. Age-appropriate for Grade ${grade} students
3. Aligned with the Competency-Based Curriculum (CBC)
4. Engaging and practical
5. Culturally relevant to Kenyan students`;
}

function buildStudentPrompt(
    grade: string, subject: string, strand: string, substrand: string,
    outcomes: string[], template: any, languageInstructions: string, subjectInstructions: string
): string {
    return `
Generate complete textbook content for:
- Grade: ${grade}
- Subject: ${subject}
- Strand: ${strand}
- Sub-Strand: ${substrand}
- Learning Outcomes: ${outcomes.join("; ")}

${languageInstructions}

${subjectInstructions}

CRITICAL RULES:
1. DO NOT include any quizzes, tests, assessments, or evaluation sections
2. DO NOT use any emojis or emoticons anywhere in the content
3. Keep the style clean and professional like a traditional printed textbook
4. Focus on teaching content only: explanations, examples, activities, and key concepts

IMAGE PLACEHOLDERS:
Insert image placeholders using: [IMAGE: detailed description of what the image should show]
Include ${template.imageRequirements?.typicalCount || 3} images minimum.

HTML STRUCTURE:
- Use <h2> for sub-strand title (only one)
- Use <h3> for major sections
- Use <h4> for sub-sections
- Use <section class="[type]"> wrappers
- Use <ul>/<ol> for lists
- NO emoji icons in headings or content

Return ONLY clean HTML. Write comprehensive, engaging content.
  `.trim();
}

function buildTeacherPrompt(
    grade: string, subject: string, strand: string, substrand: string,
    outcomes: string[], languageInstructions: string
): string {
    return `
Generate Teacher's Guide for:
- Grade: ${grade}, Subject: ${subject}
- Strand: ${strand}, Sub-Strand: ${substrand}
- Outcomes: ${outcomes.join("; ")}

${languageInstructions}

Include sections:
1. Lesson Objectives
2. Prior Knowledge
3. Key Concepts & Development
4. Teaching Experiences
5. Differentiation Strategies
6. Common Misconceptions
7. Cross-Curricular Links
8. Community Connections

CRITICAL RULES:
- DO NOT include formal assessments, quizzes, or tests
- DO NOT use any emojis or emoticons
- Keep the style professional and clean
- Focus on teaching guidance only

Return ONLY clean HTML with <section> wrappers. NO emojis.
  `.trim();
}

// ============================================
// HELPERS
// ============================================

function inferImageType(desc: string): "diagram" | "photograph" | "illustration" {
    const lower = desc.toLowerCase();
    if (lower.includes("diagram") || lower.includes("labeled") || lower.includes("parts")) return "diagram";
    if (lower.includes("photo") || lower.includes("real")) return "photograph";
    return "illustration";
}

function summarize(text: string): string {
    const first = text.split(".")[0];
    return first.length > 60 ? first.substring(0, 57) + "..." : first;
}
