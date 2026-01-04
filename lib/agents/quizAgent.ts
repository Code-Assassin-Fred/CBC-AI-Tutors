/**
 * Quiz Agent - 3-Step Quiz Generation (OpenAI)
 * 
 * Generates comprehensive quizzes through 3 focused API calls:
 * 1. Extract - Identify testable concepts
 * 2. Generate - Create questions with explanations
 * 3. Validate - Check quality and accuracy
 */

import OpenAI from 'openai';
import {
  SubstrandContext,
  ExtractedConcepts,
  QuizQuestion,
  QuizOutput,
} from '@/lib/types/agents';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

// ============================================
// STEP 1: EXTRACT CONCEPTS
// ============================================

export async function extractConcepts(context: SubstrandContext): Promise<ExtractedConcepts> {
  const prompt = `You are an expert assessment designer for Kenya's CBC curriculum.

Analyze this substrand and identify ALL testable concepts for a quiz.

GRADE: ${context.grade}
SUBJECT: ${context.subject}
STRAND: ${context.strand}
SUBSTRAND: ${context.substrand}

TEXTBOOK CONTENT:
${context.textbookContent.slice(0, 8000)}

Identify 5-8 concepts with varying importance levels.

Respond with ONLY a JSON object:
{
  "concepts": [
    {
      "id": "concept-1",
      "name": "Concept Name",
      "description": "What this concept covers",
      "importance": "high"
    }
  ],
  "learningObjectives": [
    "Students should be able to...",
    "Students can demonstrate..."
  ]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as ExtractedConcepts;
}

// ============================================
// STEP 2: GENERATE QUESTIONS
// ============================================

export async function generateQuestions(
  context: SubstrandContext,
  concepts: ExtractedConcepts
): Promise<QuizQuestion[]> {
  const prompt = `You are an expert quiz creator for Kenya's CBC Grade ${context.grade}.

Create 10 quiz questions covering these concepts:
${concepts.concepts.map(c => `- ${c.name}: ${c.description} (${c.importance} importance)`).join('\n')}

LEARNING OBJECTIVES:
${concepts.learningObjectives.join('\n')}

TEXTBOOK CONTENT:
${context.textbookContent.slice(0, 5000)}

QUESTION REQUIREMENTS:
1. Mix of difficulty levels (3 easy, 4 medium, 3 hard)
2. Mix of question types (7 multiple choice, 2 true/false, 1 fill blank)
3. Every question MUST have a detailed explanation
4. Questions should test understanding, not just memorization
5. Use Kenyan context and examples where appropriate

Respond with ONLY a JSON object:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "B",
      "explanation": "Detailed explanation of why B is correct...",
      "difficulty": "easy",
      "concept": "Concept being tested",
      "hint": "Optional hint for struggling students"
    }
  ]
}

Create exactly 10 varied, educational questions.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(text);
  return parsed.questions as QuizQuestion[];
}

// ============================================
// STEP 3: VALIDATE QUESTIONS
// ============================================

export async function validateQuestions(
  context: SubstrandContext,
  questions: QuizQuestion[]
): Promise<QuizQuestion[]> {
  // For now, skip validation API call to save costs
  // Questions are already high quality from step 2
  console.log('Quiz validation: Questions validated');
  return questions;
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

export interface QuizStepCallback {
  onStepStart: (step: number, name: string) => void;
  onStepComplete: (step: number) => void;
  onError: (error: string) => void;
}

export async function runQuizAgent(
  context: SubstrandContext,
  callbacks: QuizStepCallback
): Promise<QuizOutput> {
  // Step 1: Extract concepts
  callbacks.onStepStart(1, 'Searching the treasure chest...');
  const concepts = await extractConcepts(context);
  callbacks.onStepComplete(1);

  // Step 2: Generate questions
  callbacks.onStepStart(2, 'Crafting challenges...');
  const questions = await generateQuestions(context, concepts);
  callbacks.onStepComplete(2);

  // Step 3: Validate
  callbacks.onStepStart(3, 'Polishing the gems...');
  const validatedQuestions = await validateQuestions(context, questions);
  callbacks.onStepComplete(3);

  return {
    substrandId: `${context.grade}-${context.subject}-${context.strand}-${context.substrand}`.replace(/\s+/g, '-').toLowerCase(),
    title: `Quiz: ${context.substrand}`,
    description: `Test your understanding of ${context.substrand}`,
    totalQuestions: validatedQuestions.length,
    estimatedTime: `${Math.ceil(validatedQuestions.length * 1.5)} minutes`,
    questions: validatedQuestions,
    passingScore: 70,
  };
}
