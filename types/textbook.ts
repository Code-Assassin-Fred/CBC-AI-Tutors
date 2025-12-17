/**
 * Enhanced Textbook Types
 * 
 * These types support the enhanced textbook generation system with:
 * - Structured sections
 * - Image metadata for AI tutoring
 * - Subject-specific content types
 */

// ============================================
// SECTION TYPES
// ============================================

export type SectionType =
    | "introduction"
    | "learning_outcomes"
    | "key_concepts"
    | "detailed_explanation"
    | "examples"
    | "activity"
    | "safety_precautions"
    | "note_box"
    | "tip_box"
    | "warning_box"
    | "table"
    | "diagram"
    | "summary"
    | "real_world_connection"
    | "cross_curricular_link"
    | "hygiene_notes"           // Home Science specific
    | "practical_activity";     // Home Science specific

export type ImageType = "diagram" | "photograph" | "illustration" | "chart";
export type ImagePosition = "inline" | "full-width" | "float-right" | "float-left";

/**
 * Image category determines if image should have text labels
 * - labeled_diagram: Educational diagrams with text annotations (parts, labels)
 * - illustration: Concept visualizations without labels
 * - photograph: Realistic depictions without labels
 */
export type ImageCategory = "labeled_diagram" | "illustration" | "photograph";

// ============================================
// LABELED PARTS (for diagrams)
// ============================================

/**
 * Represents a labeled part in a diagram.
 * Used by AI tutor to explain image without seeing it.
 */
export interface LabeledPart {
    /** Name of the part (e.g., "Lever arm", "Fulcrum") */
    partName: string;
    /** Where in the image this part is located */
    location: string;
    /** What this part does / its function */
    function: string;
}

// ============================================
// IMAGE METADATA
// ============================================

/**
 * Image metadata stored in Firestore 'images' collection.
 * Rich metadata enables AI tutor to explain images without seeing them.
 */
export interface ImageMetadata {
    id: string;
    textbookRef: string;  // Reference to parent textbook document

    // Classification
    /** Category determines if image has labels */
    category: ImageCategory;
    /** Legacy type field for backward compatibility */
    type: ImageType;
    position: ImagePosition;
    caption: string;

    // AI Tutoring - CRITICAL (Rich context for tutor)
    /** What the image literally shows (visual description) */
    visualDescription: string;
    /** For labeled diagrams: array of parts with names, locations, functions */
    labeledParts?: LabeledPart[];
    /** How this image explains the educational concept */
    conceptExplanation: string;
    /** Pre-written script the AI tutor can use to explain the image */
    tutorScript: string;

    // Legacy fields (kept for backward compatibility)
    /** @deprecated Use visualDescription instead */
    description: string;
    /** @deprecated Use conceptExplanation instead */
    educationalContext: string;

    // Generation
    /** Prompt used to generate this image with Gemini */
    generationPrompt: string;
    /** URL of the generated image (populated after generation) */
    imageUrl?: string;
    /** Whether image has been generated */
    isGenerated: boolean;

    // Metadata
    subject: string;
    grade: string;
    strand: string;
    substrand: string;
    createdAt: Date;
}

// ============================================
// TEXTBOOK SECTIONS
// ============================================

/**
 * A single section within a textbook (e.g., "Key Concepts", "Activity")
 */
export interface TextbookSection {
    id: string;
    type: SectionType;
    title: string;
    html: string;

    /** Image IDs referenced in this section */
    images?: string[];

    // Activity-specific fields
    materials?: string[];
    procedure?: string[];
    safetyNotes?: string[];
    duration?: string;

    // Assessment-specific fields
    questions?: AssessmentQuestion[];
}

export interface AssessmentQuestion {
    id: string;
    type: "multiple_choice" | "fill_blank" | "short_answer" | "draw_label" | "matching";
    question: string;
    options?: string[];
    answer?: string;
    marks?: number;
}

// ============================================
// TEXTBOOK CONTENT
// ============================================

/**
 * Content for either student or teacher version
 */
export interface TextbookContent {
    /** Full rendered HTML (for backward compatibility) */
    html: string;

    /** Structured sections (new format) */
    sections: TextbookSection[];

    /** All image IDs used in this content, in order of appearance */
    imageIds: string[];
}

// ============================================
// COMPLETE TEXTBOOK
// ============================================

export interface TextbookMetadata {
    grade: string;
    subject: string;
    strand: string;
    substrand?: string;

    /** Estimated page count for print version */
    pageEstimate: number;

    /** Generation metadata */
    generatedAt: Date;
    generatedBy: string;
    version: string;
}

/**
 * Complete enhanced textbook document stored in Firestore
 */
export interface EnhancedTextbook {
    metadata: TextbookMetadata;
    studentContent: TextbookContent;
    teacherContent: TextbookContent;

    /** All images for this textbook (denormalized for convenience) */
    images?: ImageMetadata[];
}

// ============================================
// GENERATION TYPES
// ============================================

export interface GenerationParams {
    grade: string;
    subject: string;
    strand: string;
    substrand: string;
    outcomes: string[];
    generatedBy?: string;
}

export interface GenerationOutline {
    sections: OutlineSection[];
    suggestedImages: SuggestedImage[];
}

export interface OutlineSection {
    type: SectionType;
    title: string;
    keyPoints: string[];
    estimatedWordCount: number;
}

export interface SuggestedImage {
    id: string;
    type: ImageType;
    description: string;
    placement: string;  // Which section it belongs to
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface TextbookApiResponse {
    exists: boolean;
    grade?: string;
    subject?: string;
    strand?: string;
    student_content?: TextbookContent;
    teacher_content?: TextbookContent;
    images?: ImageMetadata[];

    // Legacy fields for backward compatibility
    student_html?: string;
    teacher_html?: string;
}

export interface GenerationApiResponse {
    success: boolean;
    message: string;
    grade: string;
    subject: string;
    strand: string;
    textbookId: string;
    imageCount: number;
}
