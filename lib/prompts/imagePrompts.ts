/**
 * Enhanced Image Prompt Generation
 * 
 * Generates rich metadata for educational images including:
 * - Image classification (labeled_diagram vs illustration)
 * - Labeled parts for diagrams
 * - AI tutor scripts for explaining images without seeing them
 * - Gemini-optimized generation prompts
 */

import {
    ImageType,
    ImageMetadata,
    ImageCategory,
    LabeledPart
} from "@/types/textbook";
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
    /** Category: labeled_diagram, illustration, or photograph */
    category: ImageCategory;
    /** Prompt for Gemini image generation */
    generationPrompt: string;
    /** What the image literally shows */
    visualDescription: string;
    /** For labeled diagrams: parts with names, locations, functions */
    labeledParts?: LabeledPart[];
    /** How this image explains the concept */
    conceptExplanation: string;
    /** Pre-written script for AI tutor */
    tutorScript: string;
    /** Caption for the figure */
    caption: string;
    /** Legacy fields for backward compatibility */
    description: string;
    educationalContext: string;
}

// ============================================
// IMAGE CLASSIFICATION
// ============================================

/**
 * Keywords that indicate an image should be a labeled diagram
 */
const LABELED_DIAGRAM_KEYWORDS = [
    "parts of",
    "labeled",
    "diagram showing",
    "anatomy",
    "structure of",
    "components of",
    "cross-section",
    "cross section",
    "internal structure",
    "external structure",
    "body parts",
    "labeled diagram",
    "parts labeled",
    "showing the parts",
    "with labels",
    "mechanism",
    "how it works",
    "simple machine",
    "lever",
    "pulley",
    "wheel and axle",
    "inclined plane",
    "wedge",
    "screw",
    "fulcrum",
    "effort",
    "load",
    "digestive system",
    "respiratory system",
    "circulatory system",
    "plant parts",
    "flower parts",
    "cell structure",
    "lifecycle",
    "life cycle",
    "stages of",
    "process diagram"
];

/**
 * Classify an image as labeled_diagram, illustration, or photograph
 */
export function classifyImageType(description: string): ImageCategory {
    const lower = description.toLowerCase();

    // Check for labeled diagram keywords
    for (const keyword of LABELED_DIAGRAM_KEYWORDS) {
        if (lower.includes(keyword)) {
            return "labeled_diagram";
        }
    }

    // Check for photograph indicators
    if (lower.includes("photo") ||
        lower.includes("photograph") ||
        lower.includes("real image") ||
        lower.includes("picture of")) {
        return "photograph";
    }

    // Default to illustration
    return "illustration";
}

// ============================================
// LABELED PARTS GENERATION
// ============================================

/**
 * Generate labeled parts based on the image description and topic
 */
export function generateLabeledParts(
    description: string,
    topic: string,
    subject: string
): LabeledPart[] {
    const lower = description.toLowerCase();
    const parts: LabeledPart[] = [];

    // Simple machines - wheelbarrow
    if (lower.includes("wheelbarrow")) {
        parts.push(
            {
                partName: "Wheel (Fulcrum)",
                location: "At the front of the wheelbarrow",
                function: "Acts as the pivot point. The wheel reduces friction when moving the load."
            },
            {
                partName: "Handles (Effort)",
                location: "Two long bars extending from the back",
                function: "Where you apply force to lift and push the wheelbarrow."
            },
            {
                partName: "Tray/Bucket (Load)",
                location: "The container between the wheel and handles",
                function: "Holds the materials being transported."
            }
        );
    }
    // Simple machines - lever
    else if (lower.includes("lever") || lower.includes("see-saw") || lower.includes("seesaw")) {
        parts.push(
            {
                partName: "Fulcrum",
                location: "The fixed pivot point in the middle or side",
                function: "The point around which the lever rotates."
            },
            {
                partName: "Effort Arm",
                location: "The side where force is applied",
                function: "Where you push or pull to move the load."
            },
            {
                partName: "Load Arm",
                location: "The side with the object being moved",
                function: "Carries the weight or resistance."
            }
        );
    }
    // Plant parts
    else if (lower.includes("plant") && (lower.includes("parts") || lower.includes("structure"))) {
        parts.push(
            {
                partName: "Roots",
                location: "Below the soil line",
                function: "Absorb water and nutrients from the soil. Anchor the plant."
            },
            {
                partName: "Stem",
                location: "Main upright part above the soil",
                function: "Supports the plant and carries water and food between roots and leaves."
            },
            {
                partName: "Leaves",
                location: "Growing from the stem",
                function: "Make food for the plant through photosynthesis."
            },
            {
                partName: "Flower",
                location: "At the top or sides of the plant",
                function: "Produces seeds for reproduction."
            }
        );
    }
    // Flower parts
    else if (lower.includes("flower") && lower.includes("parts")) {
        parts.push(
            {
                partName: "Petals",
                location: "Colorful outer parts of the flower",
                function: "Attract insects and birds for pollination."
            },
            {
                partName: "Stamen",
                location: "Inside the flower, thin stalks with tops",
                function: "Male part that produces pollen."
            },
            {
                partName: "Pistil",
                location: "Center of the flower",
                function: "Female part that receives pollen and develops seeds."
            },
            {
                partName: "Sepals",
                location: "Green leaf-like parts below the petals",
                function: "Protect the flower bud before it opens."
            }
        );
    }
    // Digestive system
    else if (lower.includes("digestive")) {
        parts.push(
            {
                partName: "Mouth",
                location: "At the top/start of the system",
                function: "Where food enters and chewing begins."
            },
            {
                partName: "Esophagus",
                location: "Tube connecting mouth to stomach",
                function: "Carries food from the mouth to the stomach."
            },
            {
                partName: "Stomach",
                location: "In the upper belly area",
                function: "Breaks down food using acids and churning."
            },
            {
                partName: "Small Intestine",
                location: "Long coiled tube below the stomach",
                function: "Absorbs nutrients from digested food."
            },
            {
                partName: "Large Intestine",
                location: "Surrounds the small intestine",
                function: "Absorbs water and forms waste."
            }
        );
    }
    // Generic parts if we can't identify specific ones
    else if (parts.length === 0 && description.includes("parts")) {
        // Try to extract parts from the description
        const partsMatch = description.match(/showing\s+(?:the\s+)?(.+?)(?:\.|,|$)/i);
        if (partsMatch) {
            parts.push({
                partName: "Main Component",
                location: "Central area of the diagram",
                function: "The primary element being studied."
            });
        }
    }

    return parts;
}

// ============================================
// TUTOR SCRIPT GENERATION
// ============================================

/**
 * Generate a script the AI tutor can use to explain the image
 */
export function buildTutorScript(
    category: ImageCategory,
    description: string,
    labeledParts: LabeledPart[],
    grade: string,
    topic: string
): string {
    const gradeNum = parseInt(grade);

    // Adjust language complexity based on grade
    const intro = gradeNum <= 5
        ? "Let's look at this picture together!"
        : "Let's examine this diagram carefully.";

    if (category === "labeled_diagram" && labeledParts.length > 0) {
        const partsExplanation = labeledParts
            .map((p, i) => {
                if (gradeNum <= 5) {
                    return `${i + 1}. Can you see the ${p.partName}? It's ${p.location.toLowerCase()}. ${p.function}`;
                } else {
                    return `${i + 1}. The ${p.partName} is located ${p.location.toLowerCase()}. Its function is: ${p.function}`;
                }
            })
            .join("\n");

        return `${intro}

This diagram shows ${topic.toLowerCase()}. I've labeled the important parts for you.

${partsExplanation}

${gradeNum <= 5
                ? "Can you point to each part as I name them? Let's try it!"
                : "Understanding how these parts work together is key to mastering this concept."}`;
    }

    // For illustrations without labels
    return `${intro}

This picture shows ${description.toLowerCase()}.

${gradeNum <= 5
            ? "What do you notice about this picture? Tell me what you see!"
            : "Observe the details in this image. How does it relate to what we're learning about " + topic.toLowerCase() + "?"}`;
}

// ============================================
// MAIN GENERATION FUNCTIONS
// ============================================

/**
 * Generate complete image prompts and AI tutor metadata
 */
export function generateImagePrompts(params: ImagePromptParams): GeneratedImagePrompts {
    const { subject, grade, strand, substrand, topic, imageType, specificContent, caption } = params;

    // Classify the image
    const category = classifyImageType(specificContent);

    // Generate labeled parts for diagrams
    const labeledParts = category === "labeled_diagram"
        ? generateLabeledParts(specificContent, topic, subject)
        : undefined;

    // Build the generation prompt for Gemini
    const generationPrompt = buildGenerationPrompt({
        category,
        grade,
        subject,
        topic,
        specificContent,
        labeledParts
    });

    // Visual description for AI tutor
    const visualDescription = buildVisualDescription(category, specificContent, labeledParts);

    // Concept explanation
    const conceptExplanation = buildConceptExplanation(grade, subject, strand, substrand, topic);

    // Tutor script
    const tutorScript = buildTutorScript(category, specificContent, labeledParts || [], grade, topic);

    // Legacy fields for backward compatibility
    const description = visualDescription;
    const educationalContext = conceptExplanation;

    return {
        category,
        generationPrompt,
        visualDescription,
        labeledParts,
        conceptExplanation,
        tutorScript,
        caption,
        description,
        educationalContext
    };
}

/**
 * Build the Gemini generation prompt
 */
function buildGenerationPrompt(params: {
    category: ImageCategory;
    grade: string;
    subject: string;
    topic: string;
    specificContent: string;
    labeledParts?: LabeledPart[];
}): string {
    const { category, grade, subject, topic, specificContent, labeledParts } = params;
    const ageRange = getAgeRange(grade);
    const gradeNum = parseInt(grade);

    // Style based on grade
    let style: string;
    if (gradeNum <= 3) {
        style = "Colorful, cartoon-like, friendly style with thick outlines. Like a children's picture book.";
    } else if (gradeNum <= 5) {
        style = "Colorful, semi-cartoon educational style. Clear shapes, bold colors.";
    } else if (gradeNum <= 8) {
        style = "Semi-realistic educational illustration. Professional textbook quality.";
    } else {
        style = "Realistic, detailed educational illustration. Publication quality.";
    }

    if (category === "labeled_diagram") {
        const partsToLabel = labeledParts && labeledParts.length > 0
            ? labeledParts.map(p => `- ${p.partName}`).join("\n")
            : "Label all key visible parts";

        return `
Create an educational diagram for a Grade ${grade} ${subject} textbook.
Topic: ${topic}
Content: ${specificContent}
Target age: ${ageRange}

THIS IS A LABELED DIAGRAM - INCLUDE TEXT LABELS:
${partsToLabel}

STYLE: ${style}

REQUIREMENTS:
- Include clear, readable text labels in English
- Use arrows or lines connecting labels to parts
- White or light background
- Clean, educational appearance
- Labels should be large enough to read easily
- Good contrast between elements
        `.trim();
    }

    // Illustration or photograph style
    return `
Create an educational illustration for a Grade ${grade} ${subject} textbook.
Topic: ${topic}
Content: ${specificContent}
Target age: ${ageRange}

STYLE: ${style}

REQUIREMENTS:
- NO text or labels in the image
- Clean, white or light background
- Educational and age-appropriate
- Colorful and engaging
- Clear composition
    `.trim();
}

/**
 * Build visual description for AI tutor
 */
function buildVisualDescription(
    category: ImageCategory,
    specificContent: string,
    labeledParts?: LabeledPart[]
): string {
    if (category === "labeled_diagram" && labeledParts && labeledParts.length > 0) {
        const partsDesc = labeledParts
            .map(p => `"${p.partName}" pointing to ${p.location.toLowerCase()}`)
            .join(", ");

        return `A labeled educational diagram showing ${specificContent}. Labels include: ${partsDesc}.`;
    }

    return `An educational illustration showing ${specificContent}.`;
}

/**
 * Build concept explanation
 */
function buildConceptExplanation(
    grade: string,
    subject: string,
    strand: string,
    substrand: string,
    topic: string
): string {
    return `This image supports learning in Grade ${grade} ${subject}, specifically the ${strand} strand and ${substrand} sub-strand. It helps students visualize and understand ${topic.toLowerCase()}.`;
}

// ============================================
// PLACEHOLDER EXTRACTION
// ============================================

/**
 * Extract [IMAGE: description] placeholders from content
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
    const timestamp = Date.now().toString(36);
    return `img_${params.grade}_${sanitize(params.subject)}_${sanitize(params.strand)}_${params.index}_${timestamp}`;
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
        category: prompts.category,
        type: params.imageType,
        position: "inline",
        caption: prompts.caption || `Figure ${index + 1}: ${placeholder.description.substring(0, 50)}`,
        visualDescription: prompts.visualDescription,
        labeledParts: prompts.labeledParts,
        conceptExplanation: prompts.conceptExplanation,
        tutorScript: prompts.tutorScript,
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
 * Get suggested images for a substrand
 */
export function getSuggestedImages(params: {
    subject: string;
    strand: string;
    substrand: string;
    outcomes: string[];
}): Array<{
    type: ImageType;
    suggestion: string;
    category: ImageCategory;
}> {
    const suggestions: Array<{ type: ImageType; suggestion: string; category: ImageCategory }> = [];

    // Science suggestions
    if (params.subject === "Science & Technology") {
        if (params.strand.toLowerCase().includes("living")) {
            suggestions.push(
                { type: "diagram", suggestion: "Labeled diagram showing main parts/structures", category: "labeled_diagram" },
                { type: "photograph", suggestion: "Real-world photograph of the organism", category: "photograph" }
            );
        }
        if (params.outcomes.some(o => o.toLowerCase().includes("experiment"))) {
            suggestions.push(
                { type: "diagram", suggestion: "Diagram showing experimental setup", category: "labeled_diagram" }
            );
        }
    }

    // Home Science suggestions
    if (params.subject === "Home Science") {
        if (params.strand.toLowerCase().includes("food")) {
            suggestions.push(
                { type: "photograph", suggestion: "Photograph of finished dish", category: "photograph" },
                { type: "illustration", suggestion: "Step-by-step cooking illustration", category: "illustration" }
            );
        }
    }

    // Default suggestions
    if (suggestions.length === 0) {
        suggestions.push(
            { type: "diagram", suggestion: "Diagram illustrating key concepts", category: "labeled_diagram" },
            { type: "illustration", suggestion: "Illustration showing real-world application", category: "illustration" }
        );
    }

    return suggestions;
}
