/**
 * Quiz Agent - 3-Step Quiz Generation
 * 
 * Generates comprehensive quizzes through 3 focused API calls:
 * 1. Extract - Identify testable concepts
 * 2. Generate - Create questions with explanations
 * 3. Validate - Check quality and accuracy
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    SubstrandContext,
    ExtractedConcepts,
    QuizQuestion,
    QuizOutput,
} from '@/lib/types/agents';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================
// STEP 1: EXTRACT CONCEPTS
// ============================================

export async function extractConcepts(context: SubstrandContext): Promise<ExtractedConcepts> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert assessment designer for Kenya's CBC curriculum.

Analyze this substrand and identify ALL testable concepts for a quiz.

GRADE: ${context.grade}
SUBJECT: ${context.subject}
STRAND: ${context.strand}
SUBSTRAND: ${context.substrand}

TEXTBOOK CONTENT:
${context.textbookContent.slice(0, 8000)}

Identify:
1. Core concepts students MUST understand
2. Supporting concepts that reinforce learning
3. Clear learning objectives

Respond with JSON (no markdown):
{
  "concepts": [
    {
      "id": "concept-1",
      "name": "Concept Name",
      "description": "What this concept covers",
      "importance": "high" | "medium" | "low"
    }
  ],
  "learningObjectives": [
    "Students should be able to...",
    "Students can demonstrate..."
  ]
}

Identify 5-8 concepts with varying importance levels.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse concepts response');

    return JSON.parse(jsonMatch[0]) as ExtractedConcepts;
}

// ============================================
// STEP 2: GENERATE QUESTIONS
// ============================================

export async function generateQuestions(
    context: SubstrandContext,
    concepts: ExtractedConcepts
): Promise<QuizQuestion[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

Respond with JSON (no markdown):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "B",
      "explanation": "Detailed explanation of why B is correct and others are wrong...",
      "difficulty": "easy",
      "concept": "Concept being tested",
      "hint": "Optional hint for struggling students"
    },
    {
      "id": "q2",
      "type": "true_false",
      "question": "Statement to evaluate",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Why this is true...",
      "difficulty": "medium",
      "concept": "Concept being tested"
    },
    {
      "id": "q3",
      "type": "fill_blank",
      "question": "Complete the sentence: The process of _____ involves...",
      "correctAnswer": "keyword",
      "explanation": "Explanation...",
      "difficulty": "hard",
      "concept": "Concept being tested"
    }
  ]
}

Create exactly 10 varied, educational questions.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse questions response');

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions as QuizQuestion[];
}

// ============================================
// STEP 3: VALIDATE QUESTIONS
// ============================================

export async function validateQuestions(
    context: SubstrandContext,
    questions: QuizQuestion[]
): Promise<QuizQuestion[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a quality assurance expert for educational assessments.

Review these quiz questions for Grade ${context.grade} students studying "${context.substrand}".

QUESTIONS TO REVIEW:
${JSON.stringify(questions, null, 2)}

CHECK FOR:
1. Accuracy - Are answers correct?
2. Clarity - Are questions clear and unambiguous?
3. Age-appropriateness - Suitable for Grade ${context.grade}?
4. Explanation quality - Are explanations helpful?
5. Difficulty balance - Good mix of easy/medium/hard?
6. Distractors - Are wrong options plausible but clearly wrong?

If a question has issues, fix it. If it's good, keep it unchanged.

Respond with JSON (no markdown):
{
  "validationNotes": ["Note about changes made if any"],
  "questions": [
    // The validated (and possibly fixed) questions array
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const validated = JSON.parse(jsonMatch[0]);
            return validated.questions || questions;
        }
    } catch (error) {
        console.log('Validation step skipped, using original questions');
    }

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
    callbacks.onStepStart(1, 'Identifying key concepts...');
    const concepts = await extractConcepts(context);
    callbacks.onStepComplete(1);

    // Step 2: Generate questions
    callbacks.onStepStart(2, 'Creating questions...');
    const questions = await generateQuestions(context, concepts);
    callbacks.onStepComplete(2);

    // Step 3: Validate
    callbacks.onStepStart(3, 'Validating quiz...');
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
