/**
 * Subject-Specific Prompt Templates
 * 
 * Each CBC subject has unique pedagogical requirements:
 * - Science needs safety precautions
 * - Home Science needs ingredient lists and procedures
 * - Mathematics needs worked examples
 * - English needs reading passages
 * 
 * These templates ensure generated content matches real textbook standards.
 */

import { SectionType, ImageType } from "@/types/textbook";

// ============================================
// TYPES
// ============================================

export interface ActivityFormat {
  includesMaterials?: boolean;
  includesProcedure?: boolean;
  includesSafetyNotes?: boolean;
  includesObservations?: boolean;
  includesConclusion?: boolean;
  includesIngredients?: boolean;     // Home Science
  includesEquipment?: boolean;       // Home Science
  includesServingSuggestions?: boolean; // Home Science
  includesWorkedExamples?: boolean;  // Mathematics
  includesReadingPassage?: boolean;  // English
}

export interface ImageRequirements {
  /** Typical number of images per substrand */
  typicalCount: number;
  /** Types of images commonly used */
  types: ImageType[];
  /** Suggested placements in content */
  suggestedPlacements: string[];
}

export interface SubjectTemplate {
  name: string;
  /** Required sections that must appear in every substrand */
  requiredSections: SectionType[];
  /** Optional sections that can be included */
  optionalSections: SectionType[];
  /** Activity format requirements */
  activityFormat: ActivityFormat;
  /** Image requirements */
  imageRequirements: ImageRequirements;
  /** Additional prompt instructions for this subject */
  promptAdditions: string;
  /** HTML structure hints for the LLM */
  htmlStructureHints: string;
}

// ============================================
// SUBJECT TEMPLATES
// ============================================

export const SUBJECT_TEMPLATES: Record<string, SubjectTemplate> = {
  "Science & Technology": {
    name: "Science & Technology",
    requiredSections: [
      "learning_outcomes",
      "key_concepts",
      "detailed_explanation",
      "examples",
      "activity"
    ],
    optionalSections: [
      "safety_precautions",
      "note_box",
      "tip_box",
      "real_world_connection",
      "cross_curricular_link",
      "summary"
    ],
    activityFormat: {
      includesMaterials: true,
      includesProcedure: true,
      includesSafetyNotes: true,
      includesObservations: true,
      includesConclusion: true
    },
    imageRequirements: {
      typicalCount: 4,
      types: ["diagram", "photograph", "illustration"],
      suggestedPlacements: [
        "after introducing key concepts",
        "during detailed explanation of structures/processes",
        "within activity instructions"
      ]
    },
    promptAdditions: `
SUBJECT-SPECIFIC REQUIREMENTS FOR SCIENCE & TECHNOLOGY:

1. SAFETY FIRST:
   - Include safety precautions section whenever handling materials, chemicals, or living things
   - Use warning boxes for dangerous activities
   - Always mention handwashing after handling specimens

2. SCIENTIFIC METHOD:
   - Activities should follow: Aim → Materials → Procedure → Observations → Conclusion
   - Encourage hypothesis formation before investigations
   - Include "What do you observe?" and "What can you conclude?" questions

3. CLASSIFICATION & CHARACTERISTICS:
   - For living things: always include characteristics, classification, and examples
   - For materials: include properties, uses, and changes
   - Use comparison tables where appropriate

4. REAL-WORLD CONNECTIONS:
   - Always explain why the concept matters in everyday life
   - Include Kenyan/African examples where possible
   - Connect to environmental conservation

5. IMAGE REQUIREMENTS:
   - Include labeled diagrams for anatomical structures
   - Include photographs of real specimens where helpful
   - Include process diagrams for cycles and changes
    `,
    htmlStructureHints: `
Use these HTML patterns:

<section class="safety-precautions">
  <h4>Safety Precautions</h4>
  <ul>
    <li>Wear protective gloves when...</li>
    <li>Wash hands after handling...</li>
  </ul>
</section>

<section class="activity">
  <h3>Activity: [Title]</h3>
  <div class="activity-aim"><strong>Aim:</strong> To investigate...</div>
  <div class="activity-materials">
    <strong>Materials:</strong>
    <ul><li>Item 1</li><li>Item 2</li></ul>
  </div>
  <div class="activity-procedure">
    <strong>Procedure:</strong>
    <ol><li>Step 1</li><li>Step 2</li></ol>
  </div>
  <div class="activity-observations">
    <strong>Observations:</strong>
    <p>Record what you observe...</p>
  </div>
  <div class="activity-conclusion">
    <strong>Conclusion:</strong>
    <p>From this activity, we learn that...</p>
  </div>
</section>

<div class="note-box">
  <strong>Note:</strong> Important information...
</div>

<figure class="image-figure">
  <img src="[IMAGE_PLACEHOLDER]" alt="Description for AI tutor" />
  <figcaption>Figure X: Caption text</figcaption>
</figure>
    `
  },

  "Social Studies": {
    name: "Social Studies",
    requiredSections: [
      "learning_outcomes",
      "key_concepts",
      "detailed_explanation",
      "examples",
      "activity"
    ],
    optionalSections: [
      "note_box",
      "real_world_connection",
      "cross_curricular_link",
      "summary"
    ],
    activityFormat: {
      includesMaterials: false,
      includesProcedure: true,
      includesSafetyNotes: false,
      includesObservations: true
    },
    imageRequirements: {
      typicalCount: 3,
      types: ["photograph", "illustration", "chart"],
      suggestedPlacements: [
        "showing geographical features",
        "depicting cultural practices",
        "maps and diagrams"
      ]
    },
    promptAdditions: `
SUBJECT-SPECIFIC REQUIREMENTS FOR SOCIAL STUDIES:

1. KENYAN CONTEXT:
   - Always use Kenyan examples and contexts
   - Reference Kenyan geography, history, and culture
   - Include diverse ethnic communities and regions

2. CITIZENSHIP & VALUES:
   - Emphasize national unity, patriotism, and social responsibility
   - Include discussions on rights and responsibilities
   - Promote respect for diversity

3. ENVIRONMENTAL FOCUS:
   - Connect to environmental conservation
   - Discuss sustainable resource use
   - Include community service aspects

4. MAPS & GEOGRAPHY:
   - Include map reading activities where relevant
   - Reference Kenyan counties and regions
   - Include physical and political geography

5. HISTORICAL CONNECTIONS:
   - Connect present to past where relevant
   - Include respectful discussion of cultural heritage
    `,
    htmlStructureHints: `
<section class="case-study">
  <h4>Case Study: [Location/Community]</h4>
  <p>Description of real-world example...</p>
</section>

<section class="discussion">
  <h4>Discussion Questions</h4>
  <ol>
    <li>What do you think about...?</li>
    <li>How does this affect your community?</li>
  </ol>
</section>
    `
  },

  "Home Science": {
    name: "Home Science",
    requiredSections: [
      "learning_outcomes",
      "key_concepts",
      "detailed_explanation",
      "practical_activity",
      "hygiene_notes"
    ],
    optionalSections: [
      "safety_precautions",
      "tip_box",
      "real_world_connection",
      "summary"
    ],
    activityFormat: {
      includesIngredients: true,
      includesEquipment: true,
      includesProcedure: true,
      includesSafetyNotes: true,
      includesServingSuggestions: true
    },
    imageRequirements: {
      typicalCount: 5,
      types: ["photograph", "illustration", "diagram"],
      suggestedPlacements: [
        "showing cooking techniques",
        "demonstrating proper hygiene",
        "showing finished dishes",
        "illustrating sewing/craft techniques"
      ]
    },
    promptAdditions: `
SUBJECT-SPECIFIC REQUIREMENTS FOR HOME SCIENCE:

1. HYGIENE EMPHASIS:
   - Always include hygiene notes section
   - Emphasize handwashing before and after food handling
   - Include food safety and storage guidelines

2. PRACTICAL ACTIVITIES:
   - Include detailed step-by-step procedures
   - List all ingredients/materials with quantities
   - Include equipment needed
   - Add serving suggestions where applicable

3. NUTRITION:
   - Connect to nutritional value of foods
   - Discuss balanced diets and food groups
   - Include local/affordable food options

4. LIFE SKILLS:
   - Emphasize skills for daily living
   - Include budgeting and resource management
   - Connect to family and community responsibilities

5. SAFETY IN THE HOME:
   - Include kitchen safety guidelines
   - Discuss proper handling of equipment
   - Include first aid basics where relevant
    `,
    htmlStructureHints: `
<section class="practical-activity">
  <h3>Practical Activity: [Recipe/Project Name]</h3>
  
  <div class="ingredients">
    <strong>Ingredients:</strong>
    <ul>
      <li>1 cup flour</li>
      <li>2 eggs</li>
    </ul>
  </div>
  
  <div class="equipment">
    <strong>Equipment:</strong>
    <ul>
      <li>Mixing bowl</li>
      <li>Wooden spoon</li>
    </ul>
  </div>
  
  <div class="procedure">
    <strong>Procedure:</strong>
    <ol>
      <li>Wash your hands thoroughly</li>
      <li>Gather all ingredients</li>
    </ol>
  </div>
  
  <div class="serving-suggestion">
    <strong>Serving Suggestions:</strong>
    <p>Serve warm with...</p>
  </div>
</section>

<section class="hygiene-notes">
  <h4>Hygiene Notes</h4>
  <ul>
    <li>Always wash hands before cooking</li>
    <li>Clean all surfaces after use</li>
  </ul>
</section>
    `
  },

  "English": {
    name: "English",
    requiredSections: [
      "learning_outcomes",
      "key_concepts",
      "detailed_explanation",
      "examples",
      "activity"
    ],
    optionalSections: [
      "note_box",
      "tip_box",
      "summary"
    ],
    activityFormat: {
      includesReadingPassage: true,
      includesProcedure: true
    },
    imageRequirements: {
      typicalCount: 2,
      types: ["illustration"],
      suggestedPlacements: [
        "accompanying reading passages",
        "illustrating vocabulary"
      ]
    },
    promptAdditions: `
SUBJECT-SPECIFIC REQUIREMENTS FOR ENGLISH:

1. READING PASSAGES:
   - Include age-appropriate reading passages
   - Use Kenyan contexts and names
   - Include comprehension questions after passages

2. VOCABULARY:
   - Introduce new words with definitions and usage examples
   - Include pronunciation guides for difficult words
   - Use words in context

3. GRAMMAR:
   - Clear explanations with examples
   - Include practice exercises
   - Progress from simple to complex

4. LISTENING & SPEAKING:
   - Include dialogue examples
   - Add pronunciation tips
   - Include role-play activities

5. WRITING:
   - Include writing prompts
   - Provide model answers where helpful
   - Include peer editing activities
    `,
    htmlStructureHints: `
<section class="reading-passage">
  <h4>Reading Passage</h4>
  <div class="passage-text">
    <p>The story text goes here...</p>
  </div>
  <div class="comprehension-questions">
    <h5>Comprehension Questions</h5>
    <ol>
      <li>What happened in the story?</li>
    </ol>
  </div>
</section>

<section class="vocabulary">
  <h4>New Vocabulary</h4>
  <dl>
    <dt><strong>Word</strong></dt>
    <dd>Definition: meaning of the word</dd>
    <dd>Example: The word used in a sentence.</dd>
  </dl>
</section>
    `
  },

  "Mathematics": {
    name: "Mathematics",
    requiredSections: [
      "learning_outcomes",
      "key_concepts",
      "detailed_explanation",
      "examples",
      "activity"
    ],
    optionalSections: [
      "note_box",
      "tip_box",
      "summary"
    ],
    activityFormat: {
      includesWorkedExamples: true,
      includesProcedure: true,
      includesMaterials: true
    },
    imageRequirements: {
      typicalCount: 3,
      types: ["diagram", "chart", "illustration"],
      suggestedPlacements: [
        "geometric shapes and figures",
        "graphs and charts",
        "real-world problem illustrations"
      ]
    },
    promptAdditions: `
SUBJECT-SPECIFIC REQUIREMENTS FOR MATHEMATICS:

1. WORKED EXAMPLES:
   - Include step-by-step worked examples
   - Show all working clearly
   - Explain the reasoning at each step

2. PROGRESSIVE DIFFICULTY:
   - Start with simple examples
   - Progress to more complex problems
   - Include challenge problems for extension

3. REAL-WORLD APPLICATIONS:
   - Use Kenyan contexts (currency in KSh, local measurements)
   - Include practical applications
   - Connect to everyday situations

4. VISUAL REPRESENTATIONS:
   - Include diagrams for geometry
   - Use number lines and charts
   - Include tables for data

5. PRACTICE EXERCISES:
   - Include plenty of practice questions
   - Vary difficulty levels
   - Include word problems
    `,
    htmlStructureHints: `
<section class="worked-example">
  <h4>Worked Example</h4>
  <div class="problem">
    <strong>Problem:</strong> Calculate 234 + 567
  </div>
  <div class="solution">
    <strong>Solution:</strong>
    <pre>
      234
    + 567
    -----
      801
    </pre>
    <p>Step 1: Add the ones: 4 + 7 = 11. Write 1, carry 1.</p>
    <p>Step 2: Add the tens: 3 + 6 + 1 = 10. Write 0, carry 1.</p>
    <p>Step 3: Add the hundreds: 2 + 5 + 1 = 8.</p>
    <p><strong>Answer: 801</strong></p>
  </div>
</section>

<section class="practice-exercises">
  <h4>Practice Exercises</h4>
  <ol>
    <li>Calculate: 456 + 789 = ___</li>
    <li>Calculate: 321 + 654 = ___</li>
  </ol>
</section>
    `
  },

  // Kiswahili follows similar pattern to English
  "Kiswahili": {
    name: "Kiswahili",
    requiredSections: [
      "learning_outcomes",
      "key_concepts",
      "detailed_explanation",
      "examples",
      "activity"
    ],
    optionalSections: ["note_box", "tip_box", "summary"],
    activityFormat: {
      includesReadingPassage: true,
      includesProcedure: true
    },
    imageRequirements: {
      typicalCount: 2,
      types: ["illustration"],
      suggestedPlacements: ["accompanying reading passages", "illustrating vocabulary"]
    },
    promptAdditions: `
SUBJECT-SPECIFIC REQUIREMENTS FOR KISWAHILI:

1. Use proper Kiswahili grammar and vocabulary
2. Include reading passages (habari/hadithi)
3. Include vocabulary with definitions (msamiati)
4. Include comprehension questions (maswali ya ufahamu)
5. Include grammar exercises (sarufi)
6. Use Kenyan cultural contexts
    `,
    htmlStructureHints: `
<section class="kusoma">
  <h4>Kifungu cha Kusoma</h4>
  <div class="hadithi">
    <p>Hadithi inaanza hapa...</p>
  </div>
  <div class="maswali">
    <h5>Maswali ya Ufahamu</h5>
    <ol>
      <li>Nini kilitokea katika hadithi?</li>
    </ol>
  </div>
</section>
    `
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the template for a specific subject
 */
export function getSubjectTemplate(subject: string): SubjectTemplate {
  const template = SUBJECT_TEMPLATES[subject];
  if (!template) {
    console.warn(`Subject "${subject}" not found, using Science & Technology as default`);
    return SUBJECT_TEMPLATES["Science & Technology"];
  }
  return template;
}

/**
 * Get all required sections for a subject
 */
export function getRequiredSections(subject: string): SectionType[] {
  return getSubjectTemplate(subject).requiredSections;
}

/**
 * Build subject-specific prompt instructions
 */
export function buildSubjectInstructions(subject: string): string {
  const template = getSubjectTemplate(subject);

  return `
SUBJECT: ${template.name}

REQUIRED SECTIONS (must include all):
${template.requiredSections.map((s, i) => `${i + 1}. ${s.replace(/_/g, " ").toUpperCase()}`).join("\n")}

OPTIONAL SECTIONS (include where appropriate):
${template.optionalSections.map(s => `- ${s.replace(/_/g, " ")}`).join("\n")}

ACTIVITY FORMAT:
${Object.entries(template.activityFormat)
      .filter(([_, v]) => v)
      .map(([k, _]) => `- Include ${k.replace(/includes/, "").replace(/([A-Z])/g, " $1").toLowerCase().trim()}`)
      .join("\n")}

IMAGE REQUIREMENTS:
- Typically include ${template.imageRequirements.typicalCount} images per substrand
- Image types: ${template.imageRequirements.types.join(", ")}
- Place images: ${template.imageRequirements.suggestedPlacements.join("; ")}

${template.promptAdditions}

HTML STRUCTURE HINTS:
${template.htmlStructureHints}
  `.trim();
}

/**
 * Get all available subjects
 */
export function getAvailableSubjects(): string[] {
  return Object.keys(SUBJECT_TEMPLATES);
}
