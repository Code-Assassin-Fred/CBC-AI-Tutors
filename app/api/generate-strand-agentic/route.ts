/**
 * Agentic Search-Based Generation API
 * 
 * Uses Gemini 2.0 Flash for content generation and 
 * Google Custom Search for visual asset selection.
 * 
 * Flow:
 * 1. Analyze curriculum sub-strand
 * 2. Generate content with image requirements
 * 3. Search and select best images via visual specialist agent
 * 4. Stream progress to frontend via SSE
 */

import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebaseAdmin";
import { searchImages } from "@/lib/api/imageSearchService";
import { selectBestImage } from "@/lib/agents/imageSelectionAgent";
import { extractImagePlaceholders, generateImageId } from "@/lib/prompts/imagePrompts";
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
// MAIN HANDLER
// ============================================

export async function POST(req: NextRequest) {
    const { stream, send, close } = createSSEStream();

    (async () => {
        try {
            const body = await req.json();
            const { grade, subject, strand, generatedBy } = body;
            const timestamp = () => new Date().toISOString();

            send({
                type: "start",
                message: `[AGENTIC START] Initializing Gemini & Search pipeline for ${grade} ${subject}`,
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
                message: `[ANALYZE] Found ${totalSubStrands} sub-strands to process with Gemini agents`,
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

                // ---- A. Generate Content Brief ----
                const languageInstructions = buildLanguageInstructions(grade);
                const subjectInstructions = buildSubjectInstructions(subject);
                const template = getSubjectTemplate(subject);

                send({
                    type: "content",
                    message: `[WRITER] Gemini is drafting Learner's Book and Teacher's Guide...`,
                    details: { phase: "content-generation", substrand: subName },
                    timestamp: timestamp()
                });

                const contentPrompt = `
                    You are a senior Kenyan curriculum developer writing the official Grade ${grade} ${subject} textbook (Learner's Book and Teacher's Guide).
                    
                    SUB-STRAND: ${subName}
                    OUTCOMES: ${outcomes.join("; ")}
                    
                    ${languageInstructions}
                    ${subjectInstructions}
                    
                    TASK 1: Write the Learner's Book content in HTML. 
                    - Use <h2> for sub-strand title.
                    - Use <h3> for primary sections.
                    - Insert image placeholders using THIS EXACT FORMAT: [IMAGE: description of what the image should show for the search agent]
                    - Include ${template.imageRequirements?.typicalCount || 2} images.
                    
                    TASK 2: Write the Teacher's Guide section in HTML.
                    - Include Lesson Objectives, Teaching Activities, and Differentiation.
                    
                    Return ONLY a JSON object:
                    {
                        "studentHtml": "string of clean html",
                        "teacherHtml": "string of clean html",
                        "imageNeeds": ["highly specific search query for image 1", "highly specific search query for image 2"]
                    }
                `;

                const contentResult = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: contentPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                const contentData = JSON.parse(contentResult.response.text());
                let studentHtml = contentData.studentHtml;
                allTeacherHtml.push(contentData.teacherHtml);

                // ---- B. Visual Specialist Agent Flow ----
                send({
                    type: "image",
                    message: `[VISUALS] Visual Specialist is searching the web for real images...`,
                    details: { phase: "visual-selection", substrand: subName },
                    timestamp: timestamp()
                });

                const imageNeeds = contentData.imageNeeds || [];
                for (const query of imageNeeds) {
                    // Search
                    const searchResults = await searchImages(`${grade} ${subject} ${query}`, 3);

                    if (searchResults.length > 0) {
                        // Select best
                        const selection = await selectBestImage(
                            { grade, subject, substrand: subName, description: query },
                            searchResults
                        );

                        if (selection) {
                            const imageId = generateImageId({ grade, subject, strand, index: allImages.length });
                            const imageUrl = selection.winnerUrl;

                            allImages.push({
                                id: imageId,
                                imageUrl,
                                caption: selection.title,
                                reasoning: selection.reasoning,
                                subject, grade, strand, substrand: subName,
                                isGenerated: true, // Marker for "ready"
                                category: "photograph",
                                createdAt: new Date()
                            });

                            // Replace placeholder in HTML
                            const placeholderRegex = /\[IMAGE:[^\]]+\]/;
                            studentHtml = studentHtml.replace(placeholderRegex, `
                                <figure class="image-figure" data-image-id="${imageId}">
                                    <img src="${imageUrl}" alt="${selection.title}" class="rounded-xl shadow-lg border border-white/10 w-full object-cover max-h-[400px]" />
                                    <figcaption class="mt-2 text-xs text-center text-white/50 italic">${selection.title}</figcaption>
                                </figure>
                            `);

                            send({
                                type: "image",
                                message: `[OK] Selected: ${selection.title}`,
                                timestamp: timestamp()
                            });
                        }
                    }
                }

                allStudentHtml.push(studentHtml);
            }

            // 3. Save to Firestore
            send({
                type: "save",
                message: `[DB] Finalizing content with agent signatures...`,
                details: { phase: "saving" },
                timestamp: timestamp()
            });

            const docId = `${grade}_${subject}_${strand.replace(/\s+/g, "_")}`;
            const finalStudentHtml = allStudentHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");
            const finalTeacherHtml = allTeacherHtml.join("\n\n<hr class=\"substrand-divider\" />\n\n");

            // Save images
            for (const img of allImages) {
                await adminDb.collection("images").doc(img.id).set(img);
            }

            // Save textbook
            await adminDb.collection("textbooks").doc(docId).set({
                grade, subject, strand,
                generatedAt: new Date(),
                generatedBy: generatedBy || "anonymous",
                version: "2.1-agentic",
                student_html: finalStudentHtml,
                teacher_html: finalTeacherHtml,
                student_content: { html: finalStudentHtml, sections: [], imageIds: allImages.map(i => i.id) },
                teacher_content: { html: finalTeacherHtml, sections: [], imageIds: [] }
            }, { merge: true });

            send({
                type: "complete",
                message: `[AGENTIC COMPLETE] Textbook generated successfully using Gemini & Search!`,
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
