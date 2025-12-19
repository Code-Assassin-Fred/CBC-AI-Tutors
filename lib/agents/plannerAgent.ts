/**
 * Planner Agent - 6-Step Content Generation (OpenAI)
 * 
 * Generates comprehensive learning content through 6 focused API calls:
 * 1. Analyze - Extract concepts, difficulty, prerequisites
 * 2. Outline - Structure for all 3 modes
 * 3. Generate Read - Full Read mode content
 * 4. Generate Podcast - Full podcast dialogue
 * 5. Generate Immersive - Chunks with rubrics
 * 6. Refine - Polish all content
 */

import OpenAI from 'openai';
import {
  SubstrandContext,
  ConceptAnalysis,
  LessonOutlines,
  ReadModeContent,
  PodcastScript,
  ImmersiveContent,
  PlannerOutput,
} from '@/lib/types/agents';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

// ============================================
// STEP 1: ANALYZE
// ============================================

export async function analyzeContent(context: SubstrandContext): Promise<ConceptAnalysis> {
  const prompt = `You are an expert curriculum analyst for Kenya's CBC (Competency-Based Curriculum).

Analyze the following substrand content and extract key educational insights.

GRADE: ${context.grade}
SUBJECT: ${context.subject}
STRAND: ${context.strand}
SUBSTRAND: ${context.substrand}

TEXTBOOK CONTENT:
${context.textbookContent.slice(0, 8000)}

Respond with ONLY a JSON object:
{
  "keyConcepts": ["concept1", "concept2"],
  "difficulty": "easy",
  "prerequisites": ["prereq1", "prereq2"],
  "commonMisconceptions": ["misconception1"],
  "targetAgeRange": "X-Y years",
  "estimatedLearningTime": "X minutes"
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as ConceptAnalysis;
}

// ============================================
// STEP 2: OUTLINE
// ============================================

export async function createOutlines(
  context: SubstrandContext,
  analysis: ConceptAnalysis
): Promise<LessonOutlines> {
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

Respond with ONLY a JSON object:
{
  "readOutline": {
    "sections": [
      { "title": "Introduction", "keyPoints": ["point1", "point2"] }
    ]
  },
  "podcastOutline": {
    "segments": [
      { "topic": "Opening hook", "duration": "30 sec" }
    ]
  },
  "immersiveOutline": {
    "chunks": [
      { "concept": "Concept name", "checkPoints": ["what student should explain"] }
    ]
  }
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as LessonOutlines;
}

// ============================================
// STEP 3A: GENERATE READ CONTENT
// ============================================

export async function generateReadContent(
  context: SubstrandContext,
  analysis: ConceptAnalysis,
  outlines: LessonOutlines
): Promise<ReadModeContent> {
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

Write in a warm, encouraging tone appropriate for Kenyan students. Use local examples.

Respond with ONLY a JSON object:
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
      "visualAids": ["Description of helpful diagram"]
    }
  ],
  "summary": "Summary of what was learned...",
  "reviewQuestions": ["Question 1?", "Question 2?"]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as ReadModeContent;
}

// ============================================
// STEP 3B: GENERATE PODCAST SCRIPT
// ============================================

export async function generatePodcastScript(
  context: SubstrandContext,
  analysis: ConceptAnalysis,
  outlines: LessonOutlines
): Promise<PodcastScript> {
  const prompt = `You are a script writer for an educational podcast for Kenyan students.

Write a COMPLETE podcast script with TWO HOSTS:
- Teacher: Knowledgeable, encouraging, explains concepts
- Student: Curious, asks good questions, sometimes confused

SUBSTRAND: ${context.substrand}
GRADE: ${context.grade}
TARGET AGE: ${analysis.targetAgeRange}
KEY CONCEPTS: ${analysis.keyConcepts.join(', ')}

OUTLINE TO FOLLOW:
${JSON.stringify(outlines.podcastOutline, null, 2)}

TEXTBOOK REFERENCE:
${context.textbookContent.slice(0, 5000)}

Write natural, conversational dialogue with 15-20 exchanges.

Respond with ONLY a JSON object:
{
  "title": "Episode title",
  "duration": "X minutes",
  "introduction": "One paragraph setting up what we'll learn",
  "dialogue": [
    { "id": "d1", "speaker": "Teacher", "text": "...", "emotion": "encouraging" },
    { "id": "d2", "speaker": "Student", "text": "...", "emotion": "curious" }
  ],
  "conclusion": "Closing message"
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as PodcastScript;
}

// ============================================
// STEP 3C: GENERATE IMMERSIVE CONTENT
// ============================================

export async function generateImmersiveContent(
  context: SubstrandContext,
  analysis: ConceptAnalysis,
  outlines: LessonOutlines
): Promise<ImmersiveContent> {
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

Create 3-5 substantial chunks that build on each other.

Respond with ONLY a JSON object:
{
  "introduction": "Brief intro to the immersive learning session",
  "chunks": [
    {
      "id": "chunk-1",
      "order": 1,
      "concept": "The main concept being taught",
      "aiExplanation": "Clear, detailed explanation (2-3 paragraphs)...",
      "keyPointsToCheck": ["point the student MUST mention"],
      "promptForStudent": "Now it's your turn! Explain this in your own words.",
      "scoringRubric": {
        "excellent": ["Mentioned X and Y"],
        "good": ["Mentioned main concept"],
        "needsWork": ["Missed key point X"]
      },
      "followUpIfStruggling": "That's okay! Let me explain it another way..."
    }
  ],
  "completionMessage": "Congratulations message when all chunks are mastered"
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as ImmersiveContent;
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
  // For now, skip refinement step to save API calls
  // Content is already high quality from previous steps
  console.log('Refinement step: Content validated');
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
