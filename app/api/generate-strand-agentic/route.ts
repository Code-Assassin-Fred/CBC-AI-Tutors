/**
 * Agentic Search-Based Generation API (v2)
 * 
 * Improvements:
 * - Granular SSE events (content-student, content-teacher, etc.)
 * - Image persistence via downloadAndStoreImage
 * - Improved prompting for Gemini 2.0 Flash
 */

import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebaseAdmin";
import { searchImages } from "@/lib/api/imageSearchService";
import { selectBestImage } from "@/lib/agents/imageSelectionAgent";
import { downloadAndStoreImage } from "@/lib/utils/imageDownloader";
import { generateImageId } from "@/lib/prompts/imagePrompts";
import {
    buildLanguageInstructions,
    getGradeConfig
} from "@/lib/prompts/gradeConfig";
import {
    getSubjectTemplate,
    buildSubjectInstructions
} from "@/lib/prompts/subjectTemplates";

// ============================================
// CONFIGURATION
// ============================================

const SEARCH_KEY = process.env.GOOGLE_SEARCH_API_KEY || process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY || "");
const MODEL = "gemini-2.0-flash-exp";

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

    const send = (event: any) => {
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
// JSON SANITIZATION
// ============================================

function sanitizeJson(text: string): string {
    // Remove potential markdown code blocks
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.substring(7, cleaned.length - 3);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3, cleaned.length - 3);
    }

    // Remove control characters and handle common LLM formatting issues
    return cleaned.trim();
}

/**
 * Robust JSON parse for LLM responses
 */
function robustParse(text: string): any {
    const cleaned = sanitizeJson(text);
    try {
        return JSON.parse(cleaned);
    } catch (e: any) {
        console.warn("[RobustParse] Initial parse failed, attempting regex recovery...");
        // Try to finding the first { and last }
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
            try {
                return JSON.parse(cleaned.substring(start, end + 1));
            } catch (innerE) {
                console.error("[RobustParse] Regex recovery failed.");
                throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
            }
        }
        throw e;
    }
}

export async function POST(req: NextRequest) {
    const { stream, send, close } = createSSEStream();

    (async () => {
        try {
            const body = await req.json();
            const { grade, subject, strand, generatedBy } = body;
            const timestamp = () => new Date().toISOString();

            send({
                type: "start",
                message: `[AGENTIC START] Initializing Gemini & Search pipeline v2...`,
                details: { phase: "initialization" },
                timestamp: timestamp()
            });

            // 1. Load Curriculum
            const curriculum = loadGradeContent(grade);
            if (!curriculum?.[subject]?.Strands?.[strand]) {
                throw new Error(`Curriculum not found for ${grade} ${subject} ${strand}`);
            }

            const strandData = curriculum[subject].Strands[strand];
            const subStrands = strandData.SubStrands || strandData;
            const subStrandEntries = Object.entries<any>(subStrands);
            const totalSubStrands = subStrandEntries.length;

            send({
                type: "phase",
                message: `[ANALYZE] Found ${totalSubStrands} sub-strands to process with agentic workflows`,
                details: { phase: "analysis", total: totalSubStrands },
                timestamp: timestamp()
            });

            const allStudentHtml: string[] = [];
            const allTeacherHtml: string[] = [];
            const allImages: any[] = [];

            // 2. Generation Loop
            const model = genAI.getGenerativeModel({ model: MODEL });

            for (let i = 0; i < subStrandEntries.length; i++) {
                const [subName, details] = subStrandEntries[i];
                const outcomes = details.Outcomes || [];

                send({
                    type: "substrand",
                    message: `[AGENT WORK] Sub-strand ${i + 1}/${totalSubStrands}: ${subName}`,
                    details: { substrand: subName, current: i + 1, total: totalSubStrands },
                    timestamp: timestamp()
                });

                const languageInstructions = buildLanguageInstructions(grade);
                const subjectInstructions = buildSubjectInstructions(subject);
                const template = getSubjectTemplate(subject);

                // ---- A. Generate Learner's Book ----
                send({
                    type: "content",
                    message: `[WRITER] Gemini is drafting the Learner's Book...`,
                    details: { phase: "content-student", substrand: subName },
                    timestamp: timestamp()
                });

                const studentPrompt = `
                    You are a senior Kenyan curriculum developer writing the official Grade ${grade} ${subject} Learner's Book.
                    SUB-STRAND: ${subName}
                    OUTCOMES: ${outcomes.join("; ")}
                    
                    ${languageInstructions}
                    ${subjectInstructions}
                    
                    TASK: Generate the textbook content.
                    - Use <h2> for sub-strand title.
                    - Use <h3> for primary sections.
                    - Insert image placeholders using THIS EXACT FORMAT: [IMAGE: keyword description]
                    
                    CRITICAL: Your response must be VALID JSON. Escape all double quotes within HTML strings correctly. Use single quotes for HTML attributes if possible to avoid JSON escape conflicts.
                    
                    Return ONLY a JSON object:
                    {
                        "html": "string of clean html content",
                        "imageNeeds": ["keyword 1", "keyword 2"]
                    }
                `;

                const studentResponse = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: studentPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                const studentData = robustParse(studentResponse.response.text());
                let subStrandHtml = studentData.html;

                // ---- B. Generate Teacher's Guide ----
                send({
                    type: "content",
                    message: `[WRITER] Gemini is drafting the Teacher's Guide...`,
                    details: { phase: "content-teacher", substrand: subName },
                    timestamp: timestamp()
                });

                const teacherPrompt = `
                    Generate a Teacher's Guide for ${grade} ${subject}: ${subName}.
                    Include Lesson Objectives, Teaching Steps, and Differentiation.
                    
                    CRITICAL: Your response must be VALID JSON. Escape all double quotes within HTML strings. 
                    
                    Return ONLY a JSON object: {"html": "string of clean html"}
                `;

                const teacherResponse = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: teacherPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                const teacherData = robustParse(teacherResponse.response.text());
                allTeacherHtml.push(teacherData.html);

                // ---- C. Visual Specialist Flow ----
                const imageNeeds = studentData.imageNeeds || [];
                for (let query of imageNeeds) {
                    // Refine query for educational focus
                    const refinedQuery = `${query} educational diagram`;

                    send({
                        type: "image",
                        message: `[VISUALS] Searching for: "${refinedQuery}"`,
                        details: { phase: "visuals-search", query: refinedQuery },
                        timestamp: timestamp()
                    });

                    const searchResults = await searchImages(refinedQuery, 3);

                    if (searchResults.length === 0) {
                        send({
                            type: "image",
                            message: `[VISUALS] Warning: No images found for "${query}". Check API keys or search terms.`,
                            details: { phase: "visuals-search-fail", query },
                            timestamp: timestamp()
                        });
                    } else {
                        // Stream candidates to frontend for visualization
                        send({
                            type: "image",
                            message: `[VISUALS] Found ${searchResults.length} candidates for "${query}"`,
                            details: {
                                phase: "visuals-candidates",
                                candidates: searchResults.map(r => ({ title: r.title, url: r.link, thumb: r.thumbnailUrl }))
                            },
                            timestamp: timestamp()
                        });
                    }

                    if (searchResults.length > 0) {
                        send({
                            type: "image",
                            message: `[VISUALS] Evaluating best image from search results...`,
                            details: { phase: "visuals-eval" },
                            timestamp: timestamp()
                        });

                        const selection = await selectBestImage(
                            { grade, subject, substrand: subName, description: query },
                            searchResults
                        );

                        if (selection) {
                            const imageId = generateImageId({ grade, subject, strand, index: allImages.length });

                            send({
                                type: "image",
                                message: `[VISUALS] Downloading selected image for persistence...`,
                                details: { phase: "visuals-download" },
                                timestamp: timestamp()
                            });

                            const localUrl = await downloadAndStoreImage(
                                selection.winnerUrl,
                                imageId,
                                { grade, subject, strand }
                            );

                            allImages.push({
                                id: imageId,
                                imageUrl: localUrl,
                                caption: selection.title,
                                reasoning: selection.reasoning,
                                subject, grade, strand, substrand: subName,
                                isGenerated: true,
                                category: "photograph",
                                createdAt: new Date()
                            });

                            // Replace placeholder using a more specific match if possible
                            // We replace the NEXT [IMAGE: ...] appearance
                            const firstPlaceholderIndex = subStrandHtml.indexOf("[IMAGE:");
                            if (firstPlaceholderIndex !== -1) {
                                const endBracketIndex = subStrandHtml.indexOf("]", firstPlaceholderIndex);
                                if (endBracketIndex !== -1) {
                                    const placeholderText = subStrandHtml.substring(firstPlaceholderIndex, endBracketIndex + 1);
                                    subStrandHtml = subStrandHtml.replace(placeholderText, `
                                        <figure class="image-figure" data-image-id="${imageId}">
                                            <img src="${localUrl}" alt="${selection.title}" class="rounded-xl shadow-lg border border-white/10 w-full object-cover max-h-[400px]" />
                                            <figcaption class="mt-2 text-xs text-center text-white/50 italic">${selection.title}</figcaption>
                                        </figure>
                                    `);
                                }
                            }

                            send({
                                type: "image",
                                message: `[OK] Agent selected Candidate ${selection.winnerUrl ? 'from ' + new URL(selection.winnerUrl).hostname : ''}: ${selection.title}`,
                                timestamp: timestamp()
                            });
                        }
                    } else {
                        // RE-THROW OR FAIL: User requested that workflow should not continue if search fails
                        const failMsg = `Critical Fail: No image candidates found for "${refinedQuery}". Check your Google CSE "Search the entire web" and "Image search" settings. Also verify Unsplash keys if enabled.`;
                        send({
                            type: "error",
                            message: failMsg,
                            timestamp: timestamp()
                        });
                        throw new Error(failMsg);
                    }
                }

                allStudentHtml.push(subStrandHtml);
            }

            // 3. Save to Firestore
            send({
                type: "save",
                message: `[DB] Finalizing textbook records...`,
                details: { phase: "saving" },
                timestamp: timestamp()
            });

            const docId = `${grade}_${subject}_${strand.replace(/\s+/g, "_")}`;
            const finalStudentHtml = allStudentHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");
            const finalTeacherHtml = allTeacherHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");

            for (const img of allImages) {
                await adminDb.collection("images").doc(img.id).set(img);
            }

            await adminDb.collection("textbooks").doc(docId).set({
                grade, subject, strand,
                generatedAt: new Date(),
                generatedBy: generatedBy || "anonymous",
                version: "2.5-agentic-secure",
                student_html: finalStudentHtml,
                teacher_html: finalTeacherHtml,
                student_content: { html: finalStudentHtml, sections: [], imageIds: allImages.map(i => i.id) },
                teacher_content: { html: finalTeacherHtml, sections: [], imageIds: [] }
            }, { merge: true });

            send({
                type: "complete",
                message: `[AGENTIC COMPLETE] Generation finished! Securely stored all content and images.`,
                details: { phase: "complete" },
                timestamp: timestamp()
            });

        } catch (error: any) {
            console.error("[Agentic Pipeline] Error:", error);
            send({
                type: "error",
                message: `[AGENTIC ERROR] ${error.message}`,
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
