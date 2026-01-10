/**
 * Enhanced Textbook Generation
 * 
 * Multi-phase generation system that produces professional-quality
 * educational content with:
 * - Subject-specific formatting
 * - Grade-appropriate language
 * - Structured sections
 * - Image placeholders with AI tutor descriptions
 */

import OpenAI from "openai";
import {
    EnhancedTextbook,
    TextbookContent,
    TextbookSection,
    ImageMetadata,
    GenerationParams,
    SectionType
} from "@/types/textbook";
import {
    buildLanguageInstructions,
    buildSubjectInstructions,
    getSubjectTemplate,
    extractImagePlaceholders,
    generateImageId,
    generateImagePrompts
} from "@/lib/prompts";

// ============================================
// CONFIGURATION
// ============================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-4.1";
const TEMPERATURE = 0.4;
const MAX_TOKENS_OUTLINE = 2000;
const MAX_TOKENS_CONTENT = 8000;

// ============================================
// TYPES
// ============================================

interface GenerationContext {
    params: GenerationParams;
    languageInstructions: string;
    subjectInstructions: string;
    systemPrompt: string;
}

interface ContentOutline {
    sections: Array<{
        type: SectionType;
        title: string;
        keyPoints: string[];
    }>;
    suggestedImages: Array<{
        description: string;
        placement: string;
        type: "diagram" | "photograph" | "illustration";
    }>;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generate enhanced textbook content with multi-phase approach
 */
export async function generateEnhancedTextbook(
    params: GenerationParams
): Promise<{
    studentContent: TextbookContent;
    teacherContent: TextbookContent;
    images: ImageMetadata[];
}> {
    // Build context
    const context = buildGenerationContext(params);

    // Phase 1: Generate student content with image placeholders
    console.log(`[Phase 1] Generating student content for ${params.substrand}...`);
    const studentHtml = await generateStudentContent(context);

    // Phase 2: Generate teacher content
    console.log(`[Phase 2] Generating teacher content for ${params.substrand}...`);
    const teacherHtml = await generateTeacherContent(context);

    // Phase 3: Extract and process image placeholders
    console.log(`[Phase 3] Processing image placeholders...`);
    const images = processImagePlaceholders(studentHtml, params);

    // Phase 4: Structure the content
    console.log(`[Phase 4] Structuring content...`);
    const studentContent = structureContent(studentHtml, images);
    const teacherContent = structureContent(teacherHtml, []);

    return {
        studentContent,
        teacherContent,
        images
    };
}

// ============================================
// CONTEXT BUILDING
// ============================================

function buildGenerationContext(params: GenerationParams): GenerationContext {
    const languageInstructions = buildLanguageInstructions(params.grade);
    const subjectInstructions = buildSubjectInstructions(params.subject);

    const systemPrompt = `
You are a senior Kenyan curriculum developer writing the official Grade ${params.grade} ${params.subject} textbook.
This is the authoritative Learner's Book published by KICD (Kenya Institute of Curriculum Development).

Your content must be:
1. Accurate and educationally sound
2. Age-appropriate for Grade ${params.grade} students
3. Aligned with the Competency-Based Curriculum (CBC)
4. Engaging and practical
5. Culturally relevant to Kenyan students

${languageInstructions}

${subjectInstructions}
  `.trim();

    return {
        params,
        languageInstructions,
        subjectInstructions,
        systemPrompt
    };
}

// ============================================
// PHASE 1: STUDENT CONTENT GENERATION
// ============================================

async function generateStudentContent(context: GenerationContext): Promise<string> {
    const { params, systemPrompt } = context;
    const template = getSubjectTemplate(params.subject);

    const userPrompt = `
Generate complete textbook content for:
- Grade: ${params.grade}
- Subject: ${params.subject}
- Strand: ${params.strand}
- Sub-Strand: ${params.substrand}
- Learning Outcomes: ${params.outcomes.join("; ")}

REQUIRED SECTIONS (include ALL):
${template.requiredSections.map((s, i) => `${i + 1}. ${formatSectionName(s)}`).join("\n")}

OPTIONAL SECTIONS (include where appropriate):
${template.optionalSections.map(s => `- ${formatSectionName(s)}`).join("\n")}

CRITICAL RULES - MUST FOLLOW:
1. DO NOT include any quizzes, tests, assessments, or evaluation sections
2. DO NOT use any emojis or emoticons anywhere in the content
3. Keep the style clean and professional like a traditional printed textbook
4. Focus on teaching content ONLY: explanations, examples, activities, and key concepts
5. NO "Test Yourself", "Quiz", "Assessment", or "Evaluation" sections

IMAGE PLACEHOLDERS:
- Insert image placeholders using this format: [IMAGE: detailed description of what the image should show]
- Include ${template.imageRequirements.typicalCount} images minimum
- Image types to use: ${template.imageRequirements.types.join(", ")}
- Suggested placements: ${template.imageRequirements.suggestedPlacements.join("; ")}

HTML STRUCTURE REQUIREMENTS:
- Use <h2> for the sub-strand title (only one)
- Use <h3> for major section headings
- Use <h4> for sub-section headings
- Use <section class="[section-type]"> to wrap each major section
- Use <ul> and <ol> for lists
- Use <table> for comparison data
- Use <div class="note-box">, <div class="tip-box">, <div class="warning-box"> for callouts
- NO emoji icons in headings or anywhere in content

OUTPUT RULES:
- Return ONLY clean HTML, no markdown
- Be comprehensive but age-appropriate
- Include real Kenyan examples where possible
- Make content engaging and practical
- ABSOLUTELY NO quizzes or assessments

Write the complete textbook content now:
  `.trim();

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS_CONTENT
    });

    return response.choices[0]?.message?.content || "";
}

// ============================================
// PHASE 2: TEACHER CONTENT GENERATION
// ============================================

async function generateTeacherContent(context: GenerationContext): Promise<string> {
    const { params, systemPrompt } = context;

    const userPrompt = `
Generate the TEACHER'S GUIDE for:
- Grade: ${params.grade}
- Subject: ${params.subject}
- Strand: ${params.strand}
- Sub-Strand: ${params.substrand}
- Learning Outcomes: ${params.outcomes.join("; ")}

REQUIRED SECTIONS FOR TEACHER'S GUIDE:

1. LESSON OBJECTIVES
   - Clear, measurable objectives aligned with outcomes
   - What students should know/do by end of lesson

2. SUGGESTED PRIOR KNOWLEDGE
   - What students should already know
   - How to assess readiness

3. KEY CONCEPTS & CONCEPT DEVELOPMENT
   - Core concepts to teach
   - How to build understanding progressively

4. TEACHING & LEARNING EXPERIENCES
   - Step-by-step teaching activities
   - Time allocations for each activity
   - Student engagement strategies

5. DIFFERENTIATION & SUPPORT
   - How to support struggling learners
   - Extension activities for advanced learners
   - Inclusive teaching strategies

6. FORMATIVE CHECKING (NOT formal assessment)
   - Observation strategies
   - Questions to check understanding during lessons
   - Success criteria for teachers to monitor progress

7. COMMON ERRORS & MISCONCEPTIONS
   - What students often get wrong
   - How to address these

8. CROSS-CURRICULAR LINKS
   - Connections to other subjects
   - Integration opportunities

9. REAL-LIFE & COMMUNITY CONNECTIONS
   - How to make content relevant
   - Community resources to use

CRITICAL RULES - MUST FOLLOW:
- DO NOT include formal assessments, quizzes, tests, or evaluation sections
- DO NOT use any emojis or emoticons
- This is teaching guidance only, NOT student-facing content
- Keep professional and clean style

HTML STRUCTURE REQUIREMENTS (MUST MATCH STUDENT TEXTBOOK FORMAT):
- Use <h2> for the sub-strand title ONLY (just one h2 at the top)
- Use <h3> for major section headings (e.g., Learning Objectives, Prior Knowledge, Key Concepts)
- Use <h4> for sub-section headings within each section
- Use <section class="[section-type]"> to wrap each major section
- Use <ul> and <ol> for lists
- Use practical, actionable language
- NO emoji icons anywhere

CRITICAL: The numbered sections above (1-9) should ALL use <h3> tags, NOT <h2>. 
Only the sub-strand title at the very top uses <h2>.

Write the complete Teacher's Guide now:
  `.trim();

    const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt.replace("Learner's Book", "Teacher's Guide") },
            { role: "user", content: userPrompt }
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS_CONTENT
    });

    return response.choices[0]?.message?.content || "";
}

// ============================================
// PHASE 3: IMAGE PROCESSING
// ============================================

function processImagePlaceholders(
    html: string,
    params: GenerationParams
): ImageMetadata[] {
    const placeholders = extractImagePlaceholders(html);
    const images: ImageMetadata[] = [];

    placeholders.forEach((placeholder: { placeholder: string; description: string; position: number }, index: number) => {
        const id = generateImageId({
            grade: params.grade,
            subject: params.subject,
            strand: params.strand,
            index
        });

        // Determine image type from description
        const imageType = inferImageType(placeholder.description);

        // Generate prompts and descriptions (now includes category, labeledParts, tutorScript)
        const prompts = generateImagePrompts({
            subject: params.subject,
            grade: params.grade,
            strand: params.strand,
            substrand: params.substrand,
            topic: params.substrand,
            imageType,
            specificContent: placeholder.description,
            caption: `Figure ${index + 1}: ${summarizeDescription(placeholder.description)}`
        });

        images.push({
            id,
            textbookRef: `${params.grade}_${params.subject}_${params.strand}`.replace(/\s+/g, "_"),
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
            // Legacy fields (kept for backward compatibility)
            description: prompts.description,
            educationalContext: prompts.educationalContext,
            // Generation
            generationPrompt: prompts.generationPrompt,
            isGenerated: false,
            // Metadata
            subject: params.subject,
            grade: params.grade,
            strand: params.strand,
            substrand: params.substrand,
            createdAt: new Date()
        });
    });

    return images;
}

function inferImageType(description: string): "diagram" | "photograph" | "illustration" {
    const lower = description.toLowerCase();
    if (lower.includes("diagram") || lower.includes("labeled") || lower.includes("parts") || lower.includes("structure")) {
        return "diagram";
    }
    if (lower.includes("photo") || lower.includes("photograph") || lower.includes("real")) {
        return "photograph";
    }
    return "illustration";
}

function summarizeDescription(description: string): string {
    // Take first 50 characters or up to first period
    const firstSentence = description.split(".")[0];
    if (firstSentence.length > 60) {
        return firstSentence.substring(0, 57) + "...";
    }
    return firstSentence;
}

// ============================================
// PHASE 4: CONTENT STRUCTURING
// ============================================

function structureContent(html: string, images: ImageMetadata[]): TextbookContent {
    // Replace image placeholders with proper HTML
    let processedHtml = html;
    let imageIndex = 0;

    // Replace each [IMAGE: ...] placeholder with proper HTML
    processedHtml = processedHtml.replace(/\[IMAGE:\s*([^\]]+)\]/gi, (match, description) => {
        const image = images[imageIndex];
        imageIndex++;

        if (image) {
            // We have image metadata for this placeholder
            return `
      <figure class="image-figure" data-image-id="${image.id}">
        <div class="image-placeholder" data-generation-prompt="${escapeHtml(image.generationPrompt)}">
          <div class="placeholder-content">
            <span class="placeholder-badge">${escapeHtml(image.type || 'image')}</span>
            <span class="placeholder-text">${escapeHtml(image.caption)}</span>
          </div>
        </div>
        <figcaption>${escapeHtml(image.caption)}</figcaption>
      </figure>
    `.trim();
        } else {
            // Fallback for placeholders without metadata
            const caption = description.trim().substring(0, 80);
            return `
      <figure class="image-figure">
        <div class="image-placeholder">
          <div class="placeholder-content">
            <span class="placeholder-badge">image</span>
            <span class="placeholder-text">${escapeHtml(caption)}</span>
          </div>
        </div>
        <figcaption>Figure: ${escapeHtml(caption)}</figcaption>
      </figure>
    `.trim();
        }
    });

    // Extract sections from HTML
    const sections = extractSections(processedHtml);

    return {
        html: processedHtml,
        sections,
        imageIds: images.map(img => img.id)
    };
}

function extractImageDescription(html: string, index: number): string {
    const placeholders = extractImagePlaceholders(html);
    return placeholders[index]?.description || "";
}

function extractSections(html: string): TextbookSection[] {
    // Simple section extraction based on h3 tags
    const sections: TextbookSection[] = [];
    const sectionRegex = /<section\s+class="([^"]+)"[^>]*>([\s\S]*?)<\/section>/gi;

    let match;
    let index = 0;
    while ((match = sectionRegex.exec(html)) !== null) {
        const className = match[1];
        const content = match[2];

        // Extract title from first h3 or h4
        const titleMatch = content.match(/<h[34][^>]*>([^<]+)<\/h[34]>/i);
        const title = titleMatch ? titleMatch[1].trim() : `Section ${index + 1}`;

        sections.push({
            id: `section-${index}`,
            type: mapClassToSectionType(className),
            title,
            html: content
        });

        index++;
    }

    return sections;
}

function mapClassToSectionType(className: string): SectionType {
    const mapping: Record<string, SectionType> = {
        "learning-outcomes": "learning_outcomes",
        "key-concepts": "key_concepts",
        "detailed-explanation": "detailed_explanation",
        "content-explanation": "detailed_explanation",
        "examples": "examples",
        "activity": "activity",
        "practical-activity": "practical_activity",
        "safety-precautions": "safety_precautions",
        "note-box": "note_box",
        "tip-box": "tip_box",
        "warning-box": "warning_box",
        "summary": "summary",
        "hygiene-notes": "hygiene_notes"
    };

    return mapping[className] || "detailed_explanation";
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatSectionName(type: SectionType): string {
    return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================
// BATCH GENERATION (for future use)
// ============================================

export interface BatchProgress {
    completed: number;
    total: number;
    current: {
        grade: string;
        subject: string;
        strand: string;
        substrand: string;
    };
    errors: Array<{
        item: string;
        error: string;
    }>;
}

export async function generateBatch(
    items: GenerationParams[],
    onProgress?: (progress: BatchProgress) => void
): Promise<void> {
    const total = items.length;
    const errors: Array<{ item: string; error: string }> = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
            await generateEnhancedTextbook(item);

            onProgress?.({
                completed: i + 1,
                total,
                current: item,
                errors
            });

            // Rate limiting: wait 2 seconds between generations
            if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            errors.push({
                item: `${item.grade}_${item.subject}_${item.strand}_${item.substrand}`,
                error: errorMessage
            });
        }
    }
}
