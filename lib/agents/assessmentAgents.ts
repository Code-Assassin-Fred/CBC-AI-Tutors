/**
 * Specialized Assessment Agents
 * 
 * Logic for individual agents in the multi-agent assessment generation workflow.
 */

import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
import {
    ExtractedKnowledge,
    AssessmentBlueprint,
    ProcessedMaterials,
    AssessmentCritique
} from '@/types/assessment-agent.types';
import { AssessmentConfig, Question, DifficultyLevel, QuestionTypeConfig } from '@/types/assessment';

const MODEL = MODELS.flash;

// ============================================
// ANALYZER AGENT
// ============================================

/**
 * Analyzer Agent: Prepares content from multiple sources.
 * In a real-world scenario, this would handle PDF parsing, OCR, etc.
 * For now, we assume simple text extraction or direct PDF analysis via Gemini.
 */
export async function runAnalyzerAgent(
    materialUrls: string[],
    materialNames: string[]
): Promise<ProcessedMaterials> {
    // Note: To be truly "state of the art", we would fetch the PDFs and send them to Gemini
    // For this implementation, we will fetch and provide a summary or extracted text.

    // Placeholder for fetching content logic
    const fetchContent = async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) return `[Error fetching ${url}]`;
            // If it's a PDF, we'd need a parser. For now, let's assume text/markdown or basic extraction.
            return await response.text();
        } catch (e) {
            return `[Error fetching ${url}: ${e instanceof Error ? e.message : 'Unknown error'}]`;
        }
    };

    const contents = await Promise.all(materialUrls.map(fetchContent));
    const fullText = contents.join('\n\n---\n\n');

    return {
        fullText,
        materialNames
    };
}

// ============================================
// LIBRARIAN AGENT
// ============================================

/**
 * Librarian Agent: Extracts core knowledge from processed materials.
 */
export async function runLibrarianAgent(
    processedData: ProcessedMaterials
): Promise<ExtractedKnowledge> {
    const prompt = `You are a Librarian Agent. Your goal is to extract structured knowledge from the provided educational materials.
    
MATERIALS:
${processedData.fullText.slice(0, 30000)} // Limiting for context window if necessary

TASK:
1. Identify 5-10 core concepts with names and descriptions.
2. List 10-15 key facts or specific data points.
3. Define 3-5 learning objectives based on the content.

Respond with ONLY a JSON object:
{
    "concepts": [
        { "name": "Concept name", "description": "1-2 sentence description", "importance": "high" }
    ],
    "facts": ["Fact 1", "Fact 2"],
    "learningObjectives": ["Objective 1", "Objective 2"]
}`;

    return await generateGeminiJSON<ExtractedKnowledge>(prompt, MODEL);
}

// ============================================
// ARCHITECT AGENT
// ============================================

/**
 * Architect Agent: Designs the assessment blueprint.
 */
export async function runArchitectAgent(
    knowledge: ExtractedKnowledge,
    config: AssessmentConfig
): Promise<AssessmentBlueprint> {
    const prompt = `You are an Architect Agent. Your goal is to design a blueprint for an assessment.
    
KNOWLEDGE SOURCE:
Concepts: ${knowledge.concepts.map(c => c.name).join(', ')}
Learning Objectives: ${knowledge.learningObjectives.join(', ')}

USER CONFIGURATION:
Title: ${config.title}
Difficulty: ${config.difficulty}
Topic Focus: ${config.topicFocus || 'General'}
Specifications: ${config.specifications || 'None'}

TASK:
1. Refine the title if needed.
2. Map concepts to the required difficulty distribution.
3. Define the focus topics based on the configuration.

Respond with ONLY a JSON object:
{
    "title": "Refined Title",
    "difficultyDistribution": { "easy": number, "medium": number, "hard": number },
    "typeDistribution": { "multiple-choice": number, "short-answer": number, "true-false": number, "fill-blank": number, "open-ended": number },
    "topicFocus": ["Topic 1", "Topic 2"],
    "targetGrade": "Standardized grade level inferred"
}

Ensure the typeDistribution matches the user's requested counts for enabled types:
${config.questionTypes.filter(qt => qt.enabled).map(qt => `- ${qt.type}: ${qt.count}`).join('\n')}`;

    return await generateGeminiJSON<AssessmentBlueprint>(prompt, MODEL);
}

// ============================================
// CREATOR AGENT
// ============================================

/**
 * Creator Agent: Generates questions based on the blueprint.
 */
export async function runCreatorAgent(
    blueprint: AssessmentBlueprint,
    knowledge: ExtractedKnowledge,
    questionTypes: QuestionTypeConfig[]
): Promise<Question[]> {
    const enabledTypes = questionTypes.filter(qt => qt.enabled);
    const questionsToGenerate = enabledTypes.reduce((sum, qt) => sum + qt.count, 0);
    // To handle large numbers of questions, we could call this in batches
    const prompt = `You are a Creator Agent. Your goal is to draft high-quality assessment questions.
    
BLUEPRINT:
${JSON.stringify(blueprint, null, 2)}

FACTS & CONCEPTS:
${knowledge.facts.join('\n')}
${knowledge.concepts.map(c => `${c.name}: ${c.description}`).join('\n')}

TASK:
Generate EXACTLY ${questionsToGenerate} questions based on this specific distribution:
${enabledTypes.map(qt => `- ${qt.type}: ${qt.count} questions`).join('\n')}

Each question MUST include:
- Appropriate options (for MCQ)
- Correct answer
- Detailed explanation
- Pedagogically sound phrasing
- DO NOT mention points, "1 pt", or any scoring information in the question text.

Respond with ONLY a JSON object:
{
    "questions": [
        {
            "type": "multiple-choice",
            "question": "Question text",
            "options": [
                { "id": "a", "text": "Option A", "isCorrect": false },
                { "id": "b", "text": "Option B", "isCorrect": true }
            ],
            "correctAnswer": "b",
            "explanation": "Why B is correct",
            "points": number,
            "difficulty": "medium"
        }
    ]
}`;

    const result = await generateGeminiJSON<{ questions: Question[] }>(prompt, MODEL);
    return result.questions;
}

// ============================================
// CRITIC AGENT
// ============================================

/**
 * Critic Agent: Audits questions for quality and accuracy.
 */
export async function runCriticAgent(
    questions: Question[],
    knowledge: ExtractedKnowledge
): Promise<AssessmentCritique> {
    const prompt = `You are a Critic Agent. Your goal is to audit educational questions for accuracy and clarity.
    
QUESTIONS TO AUDIT:
${JSON.stringify(questions, null, 2)}

KNOWLEDGE SOURCE:
${knowledge.facts.join('\n')}

TASK:
Identify any factual errors, ambiguous phrasing, or distractor issues.
Provide a quality score (0-100).

Respond with ONLY a JSON object:
{
    "isValid": boolean,
    "issues": [
        { "questionIndex": number, "issueType": "accuracy", "description": "error description", "suggestion": "fix" }
    ],
    "qualityScore": number
}`;

    return await generateGeminiJSON<AssessmentCritique>(prompt, MODEL);
}

// ============================================
// EDITOR AGENT
// ============================================

/**
 * Editor Agent: Refines and fixes questions based on critique.
 */
export async function runEditorAgent(
    questions: Question[],
    critique: AssessmentCritique
): Promise<Question[]> {
    if (critique.isValid && critique.issues.length === 0) return questions;

    const prompt = `You are an Editor Agent. Your goal is to fix issues in assessment questions.
    
ORIGINAL QUESTIONS:
${JSON.stringify(questions, null, 2)}

CRITIQUE:
${JSON.stringify(critique.issues, null, 2)}

TASK:
Apply the suggested fixes to the questions. Return the full list of questions with corrections.

Respond with ONLY a JSON object:
{
    "questions": [ ...updated questions... ]
}`;

    const result = await generateGeminiJSON<{ questions: Question[] }>(prompt, MODEL);
    return result.questions;
}

// ============================================
// SCORER AGENT
// ============================================

/**
 * Scorer Agent: Generates rubrics for the assessment.
 */
export async function runScorerAgent(
    questions: Question[],
    blueprint: AssessmentBlueprint
): Promise<{ questionsWithRubrics: Question[], overallRubric: string }> {
    const prompt = `You are a Scorer Agent. Your goal is to design scoring rubrics for an assessment.
    
ASSESSMENT:
Title: ${blueprint.title}
Questions: ${questions.map(q => q.question).join('\n---\n')}

TASK:
1. Generate a detailed rubric for EVERY question (especially open-ended or short-answer).
2. Create an overall assessment rubric summarizing the grading philosophy.
3. DO NOT mention specific point values in the rubrics; focus on criteria and quality of response.

Respond with ONLY a JSON object:
{
    "questions": [
        { "questionIndex": number, "rubric": "detailed rubric text" }
    ],
    "overallRubric": "Full grading philosophy..."
}`;

    const result = await generateGeminiJSON<{ questions: Array<{ questionIndex: number, rubric: string }>, overallRubric: string }>(prompt, MODEL);

    const questionsWithRubrics = questions.map((q, i) => {
        const rubricMatch = result.questions.find(r => r.questionIndex === i);
        return {
            ...q,
            rubric: rubricMatch?.rubric || 'Standard credit awarded for correct answer.'
        };
    });

    return {
        questionsWithRubrics,
        overallRubric: result.overallRubric
    };
}
