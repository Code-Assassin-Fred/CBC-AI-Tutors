/**
 * Prompts Module Index
 * 
 * Central export for all prompt-related utilities.
 */

// Grade complexity configuration
export {
    GRADE_CONFIG,
    getGradeConfig,
    getAgeRange,
    buildLanguageInstructions,
    type GradeSettings,
    type LanguageLevel,
    type ContentDepth,
    type ImageGuidelines
} from "./gradeConfig";

// Subject-specific templates
export {
    SUBJECT_TEMPLATES,
    getSubjectTemplate,
    getRequiredSections,
    buildSubjectInstructions,
    getAvailableSubjects,
    type SubjectTemplate,
    type ActivityFormat,
    type ImageRequirements
} from "./subjectTemplates";

// Image prompt generation
export {
    generateImagePrompts,
    extractImagePlaceholders,
    generateImageId,
    createImageMetadata,
    getSuggestedImages,
    type ImagePromptParams,
    type GeneratedImagePrompts
} from "./imagePrompts";
