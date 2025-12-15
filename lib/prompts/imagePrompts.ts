/**
 * Image Prompt Templates
 * 
 * Generates consistent, educational image prompts for DALL-E
 * and creates detailed descriptions for AI tutoring.
 * 
 * The description field is critical - it's what the AI tutor
 * uses to explain images to students.
 */

import { ImageType, ImageMetadata } from "@/types/textbook";
import { getAgeRange } from "./gradeConfig";

// ============================================
// TYPES
// ============================================

export interface ImagePromptParams {
    subject: string;
    grade: string;
    strand: string;
    substrand: string;
    topic: string;
    imageType: ImageType;
    specificContent: string;
    caption: string;
}

export interface GeneratedImagePrompts {
    /** Prompt for DALL-E image generation */
    generationPrompt: string;
    /** Detailed description for AI tutor */
    description: string;
    /** Educational context for the image */
    educationalContext: string;
    /** Suggested caption */
    caption: string;
}

// ============================================
// STYLE CONFIGURATIONS
// ============================================

const IMAGE_STYLES: Record<ImageType, (grade: string) => string> = {
    diagram: (grade) => {
        const gradeNum = parseInt(grade);
        if (gradeNum <= 5) {
            return "Clean, colorful educational diagram with simple labels. Cartoon-like style. Thick outlines. Bright, cheerful colors.";
        } else if (gradeNum <= 8) {
            return "Clear educational diagram with accurate labels. Semi-realistic style. Good contrast. Professional textbook quality.";
        } else {
            return "Detailed scientific diagram with precise labels. Realistic, technical illustration style. Publication quality.";
        }
    },

    photograph: (grade) => {
        return "Clear, high-quality educational photograph. Good lighting. Sharp focus. Appropriate for classroom use.";
    },

    illustration: (grade) => {
        const gradeNum = parseInt(grade);
        if (gradeNum <= 5) {
            return "Friendly, colorful illustration. Age-appropriate style for young children. Warm, inviting colors.";
        } else {
            return "Clear educational illustration. Realistic proportions. Appropriate detail level.";
        }
    },

    chart: (grade) => {
        return "Clean, professional chart or graph. Clear labels. Easy to read. Good use of color for data distinction.";
    }
};

// ============================================
// SUBJECT-SPECIFIC IMAGE CONTEXTS
// ============================================

const SUBJECT_IMAGE_CONTEXTS: Record<string, string> = {
    "Science & Technology": `
    - Show accurate scientific details
    - Include relevant labeled parts
    - Use realistic colors for natural subjects
    - Avoid anthropomorphization of animals/plants
    - Show safety equipment if relevant
  `,

    "Social Studies": `
    - Show cultural sensitivity
    - Include diverse representations
    - Use historically accurate depictions
    - Show Kenyan/African contexts where relevant
  `,

    "Home Science": `
    - Show clean, hygienic settings
    - Include proper technique demonstrations
    - Show finished products attractively
    - Include safety elements where relevant
  `,

    "Mathematics": `
    - Use clear geometric shapes with accurate proportions
    - Include grid lines or measurement markers where helpful
    - Show real-world mathematical applications
  `,

    "English": `
    - Show diverse characters
    - Illustrate story scenes clearly
    - Support vocabulary understanding
  `
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Generate a DALL-E prompt and AI tutor description for an image
 */
export function generateImagePrompts(params: ImagePromptParams): GeneratedImagePrompts {
    const { subject, grade, strand, substrand, topic, imageType, specificContent, caption } = params;

    const ageRange = getAgeRange(grade);
    const style = IMAGE_STYLES[imageType](grade);
    const subjectContext = SUBJECT_IMAGE_CONTEXTS[subject] || "";

    // Build DALL-E generation prompt
    const generationPrompt = buildGenerationPrompt({
        grade,
        ageRange,
        subject,
        imageType,
        specificContent,
        style,
        subjectContext
    });

    // Build AI tutor description
    const description = buildTutorDescription({
        imageType,
        topic,
        specificContent,
        caption
    });

    // Build educational context
    const educationalContext = buildEducationalContext({
        grade,
        subject,
        strand,
        substrand,
        topic
    });

    return {
        generationPrompt,
        description,
        educationalContext,
        caption
    };
}

/**
 * Build the DALL-E image generation prompt
 */
function buildGenerationPrompt(params: {
    grade: string;
    ageRange: string;
    subject: string;
    imageType: ImageType;
    specificContent: string;
    style: string;
    subjectContext: string;
}): string {
    return `
Create a ${params.imageType} for a Grade ${params.grade} ${params.subject} textbook.
Target audience: ${params.ageRange} students.

CONTENT:
${params.specificContent}

STYLE REQUIREMENTS:
${params.style}

ADDITIONAL REQUIREMENTS:
- NO text or labels in the image (labels will be added separately)
- Clean white or light neutral background
- High contrast for clarity
- Age-appropriate content only
- Educational and professional appearance
${params.subjectContext}

AVOID:
- Text, letters, or numbers in the image
- Violent or scary imagery
- Culturally insensitive content
- Overly complex details that would confuse students
  `.trim();
}

/**
 * Build detailed description for AI tutor
 * This is what the tutor uses to explain the image to students
 */
function buildTutorDescription(params: {
    imageType: ImageType;
    topic: string;
    specificContent: string;
    caption: string;
}): string {
    const typeDescriptions: Record<ImageType, string> = {
        diagram: "a labeled diagram",
        photograph: "a photograph",
        illustration: "an illustration",
        chart: "a chart or graph"
    };

    return `
This is ${typeDescriptions[params.imageType]} showing ${params.topic}.

VISUAL ELEMENTS:
${params.specificContent}

The image is captioned: "${params.caption}"

When explaining this image to a student:
1. First describe what they can see overall
2. Point out the key parts or elements
3. Explain how the parts relate to each other
4. Connect it to the lesson content
5. Ask the student what they notice or find interesting
  `.trim();
}

/**
 * Build educational context for the image
 */
function buildEducationalContext(params: {
    grade: string;
    subject: string;
    strand: string;
    substrand: string;
    topic: string;
}): string {
    return `
This image supports learning in Grade ${params.grade} ${params.subject}.
- Strand: ${params.strand}
- Sub-strand: ${params.substrand}
- Topic: ${params.topic}

The image helps students visualize and understand the concepts being taught. 
Use it to reinforce key learning points and check student understanding.
  `.trim();
}

// ============================================
// IMAGE PLACEHOLDER GENERATION
// ============================================

/**
 * Extract image placeholders from generated content
 * The LLM is instructed to use [IMAGE: description] placeholders
 */
export function extractImagePlaceholders(content: string): Array<{
    placeholder: string;
    description: string;
    position: number;
}> {
    const regex = /\[IMAGE:\s*([^\]]+)\]/g;
    const placeholders: Array<{
        placeholder: string;
        description: string;
        position: number;
    }> = [];

    let match;
    while ((match = regex.exec(content)) !== null) {
        placeholders.push({
            placeholder: match[0],
            description: match[1].trim(),
            position: match.index
        });
    }

    return placeholders;
}

/**
 * Generate a unique image ID
 */
export function generateImageId(params: {
    grade: string;
    subject: string;
    strand: string;
    index: number;
}): string {
    const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
    return `img_${params.grade}_${sanitize(params.subject)}_${sanitize(params.strand)}_${params.index}`;
}

/**
 * Create full ImageMetadata from placeholder
 */
export function createImageMetadata(
    placeholder: { description: string; position: number },
    params: ImagePromptParams,
    index: number
): Omit<ImageMetadata, "imageUrl" | "createdAt"> {
    const prompts = generateImagePrompts({
        ...params,
        specificContent: placeholder.description
    });

    const id = generateImageId({
        grade: params.grade,
        subject: params.subject,
        strand: params.strand,
        index
    });

    return {
        id,
        textbookRef: `${params.grade}_${params.subject}_${params.strand}`.replace(/\s+/g, "_"),
        type: params.imageType,
        position: "inline",
        caption: prompts.caption || `Figure ${index + 1}: ${placeholder.description}`,
        description: prompts.description,
        educationalContext: prompts.educationalContext,
        generationPrompt: prompts.generationPrompt,
        isGenerated: false,
        subject: params.subject,
        grade: params.grade,
        strand: params.strand,
        substrand: params.substrand
    };
}

// ============================================
// SUBJECT-SPECIFIC IMAGE SUGGESTIONS
// ============================================

/**
 * Get suggested images for a substrand based on subject
 */
export function getSuggestedImages(params: {
    subject: string;
    strand: string;
    substrand: string;
    outcomes: string[];
}): Array<{
    type: ImageType;
    suggestion: string;
}> {
    const suggestions: Array<{ type: ImageType; suggestion: string }> = [];

    // Science-specific suggestions
    if (params.subject === "Science & Technology") {
        if (params.strand.toLowerCase().includes("living")) {
            suggestions.push(
                { type: "diagram", suggestion: "Labeled diagram showing main parts/structures" },
                { type: "photograph", suggestion: "Real-world photograph of the organism/specimen" }
            );
        }
        if (params.outcomes.some(o => o.toLowerCase().includes("experiment") || o.toLowerCase().includes("investigate"))) {
            suggestions.push(
                { type: "diagram", suggestion: "Diagram showing experimental setup" }
            );
        }
    }

    // Home Science specific suggestions
    if (params.subject === "Home Science") {
        if (params.strand.toLowerCase().includes("food") || params.substrand.toLowerCase().includes("cooking")) {
            suggestions.push(
                { type: "photograph", suggestion: "Photograph of finished dish" },
                { type: "illustration", suggestion: "Step-by-step cooking technique illustration" }
            );
        }
    }

    // Default suggestions if none specific
    if (suggestions.length === 0) {
        suggestions.push(
            { type: "diagram", suggestion: "Diagram illustrating key concepts" },
            { type: "illustration", suggestion: "Illustration showing real-world application" }
        );
    }

    return suggestions;
}
