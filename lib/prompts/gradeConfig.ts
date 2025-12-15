/**
 * Grade Complexity Configuration
 * 
 * Defines age-appropriate language, content depth, and formatting
 * guidelines for each CBC grade level (4-12).
 */

// ============================================
// TYPES
// ============================================

export interface LanguageLevel {
    /** Vocabulary complexity description */
    vocabulary: string;
    /** Average sentence length guidance */
    sentenceLength: string;
    /** Maximum sentences per paragraph */
    paragraphLength: number;
    /** Terms to avoid at this level */
    avoidTerms: string[];
    /** Preferred terms for this level */
    useTerms: string[];
}

export interface ContentDepth {
    /** How complex concepts should be */
    conceptComplexity: string;
    /** Number of examples to include per concept */
    examplesCount: number;
    /** Typical activity duration */
    activityDuration: string;
    /** Types of assessments appropriate */
    assessmentTypes: string[];
}

export interface ImageGuidelines {
    /** Visual style for images */
    style: string;
    /** How complex labels should be */
    labelComplexity: string;
    /** Level of detail in diagrams */
    detailLevel: string;
}

export interface GradeSettings {
    grade: string;
    ageRange: string;
    languageLevel: LanguageLevel;
    contentDepth: ContentDepth;
    imageGuidelines: ImageGuidelines;
    /** Additional prompt instructions specific to this grade */
    promptAdditions: string;
}

// ============================================
// GRADE CONFIGURATIONS
// ============================================

export const GRADE_CONFIG: Record<string, GradeSettings> = {
    "4": {
        grade: "4",
        ageRange: "9-10 years",
        languageLevel: {
            vocabulary: "simple, concrete, everyday words that children use at home",
            sentenceLength: "8-12 words average",
            paragraphLength: 3,
            avoidTerms: [
                "abstract", "theoretical", "hypothesis", "furthermore",
                "consequently", "nevertheless", "complex scientific names"
            ],
            useTerms: [
                "simple", "easy", "fun", "look", "see", "touch", "try",
                "let's", "we can", "you will", "notice", "observe"
            ]
        },
        contentDepth: {
            conceptComplexity: "introductory, based on direct observation and everyday experiences",
            examplesCount: 3,
            activityDuration: "15-20 minutes",
            assessmentTypes: ["matching", "fill-in-blanks", "draw and label", "true/false", "circle the correct answer"]
        },
        imageGuidelines: {
            style: "colorful, friendly, cartoon-like with clear outlines",
            labelComplexity: "single words or very short phrases",
            detailLevel: "basic shapes and clear, simple details"
        },
        promptAdditions: `
      - Use very short sentences (8-12 words)
      - Start explanations with "Let's learn about..." or "Have you ever seen..."
      - Use lots of "we", "you", and "let's" to be inclusive
      - Include at least one fun fact per topic
      - Activities should be hands-on with common household items
      - Always explain why something is important in terms children understand
    `
    },

    "5": {
        grade: "5",
        ageRange: "10-11 years",
        languageLevel: {
            vocabulary: "simple to intermediate, introduce basic subject-specific terms with immediate definitions",
            sentenceLength: "10-15 words average",
            paragraphLength: 4,
            avoidTerms: [
                "abstract concepts without examples", "complex scientific terminology",
                "multisyllabic words without context"
            ],
            useTerms: [
                "discover", "explore", "investigate", "notice", "compare",
                "think about", "imagine", "remember"
            ]
        },
        contentDepth: {
            conceptComplexity: "foundational, connecting observations to simple explanations",
            examplesCount: 4,
            activityDuration: "20-25 minutes",
            assessmentTypes: ["matching", "fill-in-blanks", "short answer (1-2 sentences)", "draw and label", "simple comparisons"]
        },
        imageGuidelines: {
            style: "colorful, clear, with realistic elements but simplified",
            labelComplexity: "short phrases with key terms",
            detailLevel: "moderate detail with key parts clearly shown"
        },
        promptAdditions: `
      - Define new terms immediately when introduced
      - Use "For example..." frequently to illustrate points
      - Connect new concepts to things students already know
      - Include comparison activities (e.g., "How are X and Y different?")
      - Activities can involve simple measurements and recording
    `
    },

    "6": {
        grade: "6",
        ageRange: "11-12 years",
        languageLevel: {
            vocabulary: "intermediate, use subject-specific terminology with definitions in context",
            sentenceLength: "12-18 words average",
            paragraphLength: 5,
            avoidTerms: [
                "overly technical jargon without explanation",
                "abstract philosophical concepts"
            ],
            useTerms: [
                "investigate", "analyze", "compare", "contrast", "explain",
                "describe", "identify", "classify", "demonstrate"
            ]
        },
        contentDepth: {
            conceptComplexity: "explanatory, introducing cause-effect relationships and classifications",
            examplesCount: 5,
            activityDuration: "25-30 minutes",
            assessmentTypes: [
                "short answer", "fill-in-blanks", "matching",
                "compare and contrast", "diagram labeling", "simple explanations"
            ]
        },
        imageGuidelines: {
            style: "realistic educational diagrams with clear labels",
            labelComplexity: "phrases with terminology",
            detailLevel: "detailed diagrams showing internal structures and parts"
        },
        promptAdditions: `
      - Introduce technical terms with clear definitions
      - Explain the "why" behind facts (cause and effect)
      - Include classification tables and comparison charts
      - Activities should include proper scientific methods (hypothesis, observation, conclusion)
      - Include real-world applications of concepts
      - Safety precautions should be clearly stated for any hands-on activities
    `
    },

    "7": {
        grade: "7",
        ageRange: "12-13 years",
        languageLevel: {
            vocabulary: "intermediate to advanced, consistent use of subject terminology",
            sentenceLength: "15-20 words average",
            paragraphLength: 6,
            avoidTerms: ["unexplained jargon", "overly complex sentence structures"],
            useTerms: [
                "analyze", "evaluate", "synthesize", "hypothesize",
                "investigate", "determine", "assess", "conclude"
            ]
        },
        contentDepth: {
            conceptComplexity: "analytical, exploring relationships between concepts and systems",
            examplesCount: 5,
            activityDuration: "30-40 minutes",
            assessmentTypes: [
                "short answer", "extended response", "data analysis",
                "diagram interpretation", "problem-solving"
            ]
        },
        imageGuidelines: {
            style: "detailed educational diagrams, charts, and graphs",
            labelComplexity: "full terminology with brief explanations",
            detailLevel: "comprehensive diagrams showing processes and systems"
        },
        promptAdditions: `
      - Build on prior knowledge from earlier grades
      - Include data interpretation exercises
      - Connect concepts across different topics
      - Include case studies and real-world problem scenarios
      - Encourage critical thinking with "Why do you think..." questions
    `
    },

    "8": {
        grade: "8",
        ageRange: "13-14 years",
        languageLevel: {
            vocabulary: "advanced intermediate, fluent use of subject-specific terminology",
            sentenceLength: "18-22 words average",
            paragraphLength: 6,
            avoidTerms: ["unnecessarily complex language", "jargon without context"],
            useTerms: [
                "analyze", "evaluate", "deduce", "infer", "justify",
                "critique", "formulate", "propose", "validate"
            ]
        },
        contentDepth: {
            conceptComplexity: "multi-step reasoning, connecting multiple concepts",
            examplesCount: 5,
            activityDuration: "35-45 minutes",
            assessmentTypes: [
                "extended response", "data analysis", "experimental design",
                "problem-solving", "research projects"
            ]
        },
        imageGuidelines: {
            style: "detailed scientific diagrams, flowcharts, and data visualizations",
            labelComplexity: "full technical labels",
            detailLevel: "complex systems and processes with multiple components"
        },
        promptAdditions: `
      - Include multi-step problem solving
      - Reference real scientific research where appropriate
      - Include experimental design activities
      - Connect to current events and real-world applications
      - Include critical analysis of information
    `
    },

    "9": {
        grade: "9",
        ageRange: "14-15 years",
        languageLevel: {
            vocabulary: "advanced, precise academic and technical terminology",
            sentenceLength: "20-25 words average",
            paragraphLength: 7,
            avoidTerms: ["imprecise language", "colloquialisms in formal explanations"],
            useTerms: [
                "analyze", "synthesize", "evaluate", "hypothesize", "extrapolate",
                "correlate", "differentiate", "substantiate"
            ]
        },
        contentDepth: {
            conceptComplexity: "abstract reasoning, theoretical frameworks with practical applications",
            examplesCount: 6,
            activityDuration: "40-50 minutes",
            assessmentTypes: [
                "essay", "experimental design", "data analysis",
                "research paper", "presentation", "problem-solving"
            ]
        },
        imageGuidelines: {
            style: "professional scientific diagrams and technical illustrations",
            labelComplexity: "comprehensive technical annotations",
            detailLevel: "highly detailed, showing microscopic or system-level views"
        },
        promptAdditions: `
      - Use precise scientific language throughout
      - Include references to scientific principles and laws
      - Challenge students with higher-order thinking questions
      - Include interdisciplinary connections
      - Prepare students for examination-style questions
    `
    }
};

// Grades 10-12 follow similar pattern with increasing complexity
// Adding abbreviated versions for completeness

GRADE_CONFIG["10"] = {
    ...GRADE_CONFIG["9"],
    grade: "10",
    ageRange: "15-16 years",
    languageLevel: {
        ...GRADE_CONFIG["9"].languageLevel,
        vocabulary: "advanced academic, discipline-specific terminology used fluently",
        sentenceLength: "22-28 words average"
    },
    promptAdditions: `
    - Full academic language expected
    - Include exam preparation content
    - Reference to syllabi and examination requirements
    - Higher-order analysis and evaluation
  `
};

GRADE_CONFIG["11"] = {
    ...GRADE_CONFIG["10"],
    grade: "11",
    ageRange: "16-17 years",
    languageLevel: {
        ...GRADE_CONFIG["10"].languageLevel,
        sentenceLength: "25-30 words average",
        paragraphLength: 8
    }
};

GRADE_CONFIG["12"] = {
    ...GRADE_CONFIG["11"],
    grade: "12",
    ageRange: "17-18 years",
    contentDepth: {
        ...GRADE_CONFIG["11"].contentDepth,
        conceptComplexity: "university-preparatory, sophisticated analysis and synthesis"
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the grade configuration for a specific grade
 */
export function getGradeConfig(grade: string): GradeSettings {
    const config = GRADE_CONFIG[grade];
    if (!config) {
        console.warn(`Grade ${grade} not found, defaulting to Grade 6`);
        return GRADE_CONFIG["6"];
    }
    return config;
}

/**
 * Get the age range for a grade
 */
export function getAgeRange(grade: string): string {
    return getGradeConfig(grade).ageRange;
}

/**
 * Build language instructions for a prompt based on grade
 */
export function buildLanguageInstructions(grade: string): string {
    const config = getGradeConfig(grade);
    return `
LANGUAGE REQUIREMENTS FOR GRADE ${grade} (${config.ageRange}):
- Vocabulary: ${config.languageLevel.vocabulary}
- Sentence length: ${config.languageLevel.sentenceLength}
- Maximum ${config.languageLevel.paragraphLength} sentences per paragraph
- AVOID these terms/styles: ${config.languageLevel.avoidTerms.join(", ")}
- USE these terms/styles: ${config.languageLevel.useTerms.join(", ")}

CONTENT DEPTH:
- Complexity level: ${config.contentDepth.conceptComplexity}
- Include ${config.contentDepth.examplesCount} examples per major concept
- Activities should take approximately ${config.contentDepth.activityDuration}
- Assessment types: ${config.contentDepth.assessmentTypes.join(", ")}

${config.promptAdditions}
  `.trim();
}
