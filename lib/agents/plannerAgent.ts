/**
 * Planner Agent - 6-Step Content Generation
 * 
 * Generates comprehensive learning content through 6 focused API calls:
 * 1. Analyze - Extract concepts, difficulty, prerequisites
 * 2. Outline - Structure for all 3 modes
 * 3. Generate Read - Full Read mode content
 * 4. Generate Podcast - Full podcast dialogue
 * 5. Generate Immersive - Chunks with rubrics
 * 6. Refine - Polish all content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    SubstrandContext,
    ConceptAnalysis,
    LessonOutlines,
    ReadModeContent,
    PodcastScript,
    ImmersiveContent,
    PlannerOutput,
} from '@/lib/types/agents';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================
// STEP 1: ANALYZE
// ============================================

export async function analyzeContent(context: SubstrandContext): Promise<ConceptAnalysis> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert curriculum analyst for Kenya's CBC (Competency-Based Curriculum).

Analyze the following substrand content and extract key educational insights.

GRADE: ${context.grade}
SUBJECT: ${context.subject}
STRAND: ${context.strand}
SUBSTRAND: ${context.substrand}

TEXTBOOK CONTENT:
${context.textbookContent.slice(0, 8000)}

Respond with a JSON object (no markdown, just pure JSON):
{
  "keyConcepts": ["concept1", "concept2", ...], // 4-6 core concepts students must understand
  "difficulty": "easy" | "medium" | "hard", // based on grade level
  "prerequisites": ["prereq1", "prereq2"], // what students should know before this
  "commonMisconceptions": ["misconception1", ...], // typical mistakes students make
  "targetAgeRange": "X-Y years", // based on grade
  "estimatedLearningTime": "X minutes" // realistic time to cover material
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse analysis response');

    return JSON.parse(jsonMatch[0]) as ConceptAnalysis;
}

// ============================================
// STEP 2: OUTLINE
// ============================================

export async function createOutlines(
    context: SubstrandContext,
    analysis: ConceptAnalysis
): Promise<LessonOutlines> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert lesson planner for Kenya's CBC curriculum.

Based on the analysis, create detailed outlines for THREE learning modes.

SUBSTRAND: ${context.substrand}
GRADE: ${context.grade}
KEY CONCEPTS: ${analysis.keyConcepts.join(', ')}
DIFFICULTY: ${analysis.difficulty}
LEARNING TIME: ${analysis.estimatedLearningTime}

Create comprehensive outlines for:

1. READ MODE - Interactive text-based learning (5-7 sections)
2. PODCAST MODE - Two-person conversational audio (10-15 segments)
3. IMMERSIVE MODE - Teach-back chunks with assessment (3-5 chunks)

Respond with a JSON object (no markdown):
{
  "readOutline": {
    "sections": [
      { "title": "Introduction", "keyPoints": ["point1", "point2"] },
      { "title": "Section Name", "keyPoints": ["..."] }
    ]
  },
  "podcastOutline": {
    "segments": [
      { "topic": "Opening hook", "duration": "30 sec" },
      { "topic": "Topic name", "duration": "2 min" }
    ]
  },
  "immersiveOutline": {
    "chunks": [
      { "concept": "Concept name", "checkPoints": ["what student should explain"] }
    ]
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse outlines response');

    return JSON.parse(jsonMatch[0]) as LessonOutlines;
}

// ============================================
// STEP 3A: GENERATE READ CONTENT
// ============================================

export async function generateReadContent(
    context: SubstrandContext,
    analysis: ConceptAnalysis,
    outlines: LessonOutlines
): Promise<ReadModeContent> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert educational content writer for Kenya's CBC Grade ${context.grade}.

Write COMPLETE, DETAILED content for READ MODE learning based on the outline.

SUBSTRAND: ${context.substrand}
TARGET AGE: ${analysis.targetAgeRange}
DIFFICULTY: ${analysis.difficulty}
KEY CONCEPTS: ${analysis.keyConcepts.join(', ')}

OUTLINE TO FOLLOW:
${JSON.stringify(outlines.readOutline, null, 2)}

TEXTBOOK REFERENCE:
${context.textbookContent.slice(0, 6000)}

Write in a warm, encouraging tone appropriate for Kenyan students. Use local examples (Kenya, East Africa). Make content engaging and easy to understand.

Respond with a JSON object (no markdown):
{
  "introduction": "Welcome paragraph that hooks the student...",
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "content": "Full, detailed explanation paragraph(s)...",
      "keyPoints": ["Key point 1", "Key point 2"],
      "examples": [
        { "title": "Example Name", "description": "Detailed example..." }
      ],
      "visualAids": ["Description of helpful diagram or image"]
    }
  ],
  "summary": "Summary of what was learned...",
  "reviewQuestions": ["Question 1?", "Question 2?"]
}

Make each section SUBSTANTIAL with real educational content, not placeholders.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse read content response');

    return JSON.parse(jsonMatch[0]) as ReadModeContent;
}

// ============================================
// STEP 3B: GENERATE PODCAST SCRIPT
// ============================================

export async function generatePodcastScript(
    context: SubstrandContext,
    analysis: ConceptAnalysis,
    outlines: LessonOutlines
): Promise<PodcastScript> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a script writer for an educational podcast for Kenyan students.

Write a COMPLETE podcast script with TWO HOSTS:
- Mwalimu (Teacher): Knowledgeable, encouraging, explains concepts
- Mwanafunzi (Student): Curious, asks good questions, sometimes confused

SUBSTRAND: ${context.substrand}
GRADE: ${context.grade}
TARGET AGE: ${analysis.targetAgeRange}
KEY CONCEPTS: ${analysis.keyConcepts.join(', ')}

OUTLINE TO FOLLOW:
${JSON.stringify(outlines.podcastOutline, null, 2)}

TEXTBOOK REFERENCE:
${context.textbookContent.slice(0, 5000)}

Write natural, conversational dialogue. Include:
- Curious questions from Mwanafunzi
- Clear explanations from Mwalimu
- Real-world Kenyan examples
- Moments of understanding ("Ohh, I get it now!")
- Recap and summary

Respond with a JSON object (no markdown):
{
  "title": "Episode title",
  "duration": "X minutes",
  "introduction": "One paragraph setting up what we'll learn",
  "dialogue": [
    { "id": "d1", "speaker": "Mwalimu", "text": "...", "emotion": "encouraging" },
    { "id": "d2", "speaker": "Mwanafunzi", "text": "...", "emotion": "curious" }
  ],
  "conclusion": "Closing message"
}

Emotions can be: curious, excited, thoughtful, encouraging, surprised

Write 15-20 dialogue exchanges for a complete episode.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse podcast script response');

    return JSON.parse(jsonMatch[0]) as PodcastScript;
}

// ============================================
// STEP 3C: GENERATE IMMERSIVE CONTENT
// ============================================

export async function generateImmersiveContent(
    context: SubstrandContext,
    analysis: ConceptAnalysis,
    outlines: LessonOutlines
): Promise<ImmersiveContent> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert in active learning pedagogy for Kenya's CBC curriculum.

Create IMMERSIVE LEARNING CHUNKS where the AI teaches, then the student explains back.

SUBSTRAND: ${context.substrand}
GRADE: ${context.grade}
TARGET AGE: ${analysis.targetAgeRange}
KEY CONCEPTS: ${analysis.keyConcepts.join(', ')}
COMMON MISCONCEPTIONS: ${analysis.commonMisconceptions.join(', ')}

OUTLINE TO FOLLOW:
${JSON.stringify(outlines.immersiveOutline, null, 2)}

TEXTBOOK REFERENCE:
${context.textbookContent.slice(0, 5000)}

For each chunk:
1. AI gives a clear explanation
2. Student must explain the concept back in their own words
3. AI evaluates using a rubric

Respond with a JSON object (no markdown):
{
  "introduction": "Brief intro to the immersive learning session",
  "chunks": [
    {
      "id": "chunk-1",
      "order": 1,
      "concept": "The main concept being taught",
      "aiExplanation": "Clear, detailed explanation from the AI tutor (2-3 paragraphs)...",
      "keyPointsToCheck": ["point the student MUST mention", "another key point"],
      "promptForStudent": "Now it's your turn! Explain [concept] in your own words. What do you think [question]?",
      "scoringRubric": {
        "excellent": ["Mentioned X and Y", "Used own example", "Showed deep understanding"],
        "good": ["Mentioned main concept", "Basic understanding shown"],
        "needsWork": ["Missed key point X", "Confused about Y"]
      },
      "followUpIfStruggling": "That's okay! Let me explain it another way..."
    }
  ],
  "completionMessage": "Congratulations message when all chunks are mastered"
}

Create 3-5 substantial chunks that build on each other.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse immersive content response');

    return JSON.parse(jsonMatch[0]) as ImmersiveContent;
}

// ============================================
// STEP 4: REFINE
// ============================================

export async function refineContent(
    context: SubstrandContext,
    analysis: ConceptAnalysis,
    readContent: ReadModeContent,
    podcastScript: PodcastScript,
    immersiveContent: ImmersiveContent
): Promise<{
    readContent: ReadModeContent;
    podcastScript: PodcastScript;
    immersiveContent: ImmersiveContent;
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a quality assurance expert for educational content.

Review and improve the following content for Grade ${context.grade} students learning "${context.substrand}".

CHECK FOR:
1. Age-appropriateness (${analysis.targetAgeRange})
2. Accuracy of information
3. Clarity of explanations
4. Engagement and interest
5. Kenyan context and examples
6. Missing key concepts: ${analysis.keyConcepts.join(', ')}
7. Address misconceptions: ${analysis.commonMisconceptions.join(', ')}

CURRENT CONTENT:

READ MODE:
${JSON.stringify(readContent, null, 2).slice(0, 3000)}

PODCAST:
${JSON.stringify(podcastScript, null, 2).slice(0, 3000)}

IMMERSIVE:
${JSON.stringify(immersiveContent, null, 2).slice(0, 3000)}

If the content is already good, return it unchanged.
If improvements are needed, return the improved versions.

Respond with JSON (no markdown):
{
  "improvements": ["List of improvements made"],
  "readContent": { ... the content, improved if needed ... },
  "podcastScript": { ... },
  "immersiveContent": { ... }
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const refined = JSON.parse(jsonMatch[0]);
            return {
                readContent: refined.readContent || readContent,
                podcastScript: refined.podcastScript || podcastScript,
                immersiveContent: refined.immersiveContent || immersiveContent,
            };
        }
    } catch (error) {
        console.log('Refinement step skipped, using original content');
    }

    // Return original if refinement fails
    return { readContent, podcastScript, immersiveContent };
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

export interface PlannerStepCallback {
    onStepStart: (step: number, name: string) => void;
    onStepComplete: (step: number) => void;
    onError: (error: string) => void;
}

export async function runPlannerAgent(
    context: SubstrandContext,
    callbacks: PlannerStepCallback
): Promise<PlannerOutput> {
    // Step 1: Analyze
    callbacks.onStepStart(1, 'Analyzing content...');
    const analysis = await analyzeContent(context);
    callbacks.onStepComplete(1);

    // Step 2: Outline
    callbacks.onStepStart(2, 'Creating lesson outline...');
    const outlines = await createOutlines(context, analysis);
    callbacks.onStepComplete(2);

    // Step 3a: Generate Read
    callbacks.onStepStart(3, 'Writing Read mode content...');
    const readContent = await generateReadContent(context, analysis, outlines);
    callbacks.onStepComplete(3);

    // Step 3b: Generate Podcast
    callbacks.onStepStart(4, 'Writing Podcast script...');
    const podcastScript = await generatePodcastScript(context, analysis, outlines);
    callbacks.onStepComplete(4);

    // Step 3c: Generate Immersive
    callbacks.onStepStart(5, 'Creating Immersive chunks...');
    const immersiveContent = await generateImmersiveContent(context, analysis, outlines);
    callbacks.onStepComplete(5);

    // Step 4: Refine
    callbacks.onStepStart(6, 'Polishing content...');
    const refined = await refineContent(context, analysis, readContent, podcastScript, immersiveContent);
    callbacks.onStepComplete(6);

    return {
        analysis,
        outlines,
        readContent: refined.readContent,
        podcastScript: refined.podcastScript,
        immersiveContent: refined.immersiveContent,
        generatedAt: new Date().toISOString(),
    };
}
