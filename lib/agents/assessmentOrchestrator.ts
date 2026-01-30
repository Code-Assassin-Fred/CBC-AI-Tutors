/**
 * Assessment Orchestrator
 * 
 * Coordinates the multi-agent workflow for assessment generation.
 * Handles SSE streaming for real-time progress updates.
 */

import { AssessmentConfig, Assessment, Question } from '@/types/assessment';
import { AssessmentAgentEvent, AssessmentAgentType } from '@/types/assessment-agent.types';
import {
    runAnalyzerAgent,
    runLibrarianAgent,
    runArchitectAgent,
    runCreatorAgent,
    runCriticAgent,
    runEditorAgent,
    runScorerAgent
} from './assessmentAgents';
import { adminDb } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export interface OrchestratorOptions {
    onEvent: (event: AssessmentAgentEvent) => void;
}

export interface OrchestratorInput {
    config: AssessmentConfig;
    teacherId: string;
    materialUrls: string[];
    materialNames: string[];
}

export async function runAssessmentOrchestrator(
    input: OrchestratorInput,
    options: OrchestratorOptions
): Promise<Assessment> {
    const { config, teacherId, materialUrls, materialNames } = input;
    const { onEvent } = options;
    const startTime = new Date().toISOString();
    const assessmentId = uuidv4();

    const sendStep = (agent: AssessmentAgentType, step: string, message: string, percentage: number) => {
        onEvent({
            type: 'agent_step',
            agent,
            step,
            message,
            timestamp: new Date().toISOString(),
            percentage
        });
    };

    const sendStart = (agent: AssessmentAgentType, message: string) => {
        onEvent({
            type: 'agent_start',
            agent,
            message,
            timestamp: new Date().toISOString()
        });
    };

    const sendComplete = (agent: AssessmentAgentType, message: string, data?: any) => {
        onEvent({
            type: 'agent_complete',
            agent,
            message,
            timestamp: new Date().toISOString(),
            data
        });
    };

    try {
        // 1. ANALYZER
        sendStart('analyzer', 'Processing uploaded materials...');
        const processedMaterials = await runAnalyzerAgent(
            materialUrls,
            materialNames
        );
        sendComplete('analyzer', `Analyzed ${processedMaterials.materialNames.length} documents.`);

        // 2. LIBRARIAN
        sendStart('librarian', 'Extracting core knowledge and facts...');
        const knowledge = await runLibrarianAgent(processedMaterials);
        sendComplete('librarian', `Extracted ${knowledge.concepts.length} concepts and ${knowledge.facts.length} facts.`);

        // 3. ARCHITECT
        sendStart('architect', 'Designing assessment blueprint...');
        const blueprint = await runArchitectAgent(knowledge, config);
        sendComplete('architect', `Blueprint designed: ${blueprint.title}`);

        // 4. CREATOR
        sendStart('creator', 'Generating draft questions...');
        let questions = await runCreatorAgent(blueprint, knowledge, config.questionTypes);
        sendComplete('creator', `Generated ${questions.length} draft questions.`);

        // 5. CRITIC & EDITOR (Audit Loop)
        sendStart('critic', 'Auditing questions for quality and accuracy...');
        let auditCycle = 1;
        const maxCycles = 2;
        let isHighQuality = false;

        while (auditCycle <= maxCycles && !isHighQuality) {
            const critique = await runCriticAgent(questions, knowledge);
            onEvent({
                type: 'audit_cycle',
                cycle: auditCycle,
                issuesFound: critique.issues.length,
                message: `Audit cycle ${auditCycle}: Found ${critique.issues.length} issues.`,
                timestamp: new Date().toISOString()
            });

            if (critique.isValid && critique.issues.length === 0) {
                isHighQuality = true;
                sendComplete('critic', 'Questions passed quality audit.');
            } else {
                sendStart('editor', `Refining ${critique.issues.length} questions...`);
                questions = await runEditorAgent(questions, critique);
                sendComplete('editor', 'Refinement complete.');
                auditCycle++;
            }
        }

        // 6. SCORER
        sendStart('scorer', 'Generating detailed grading rubrics...');
        const { questionsWithRubrics, overallRubric } = await runScorerAgent(questions, blueprint);
        sendComplete('scorer', 'Rubrics generated successfully.');

        // 7. FINAL ASSEMBLY & PERSISTENCE
        // Ensure all questions have unique IDs for React rendering
        const finalQuestions: Question[] = questionsWithRubrics.map((q, idx) => ({
            ...q,
            id: q.id || uuidv4(), // Ensure unique ID
        }));

        // Save rubric to separate subcollection
        const rubricId = uuidv4();
        const rubricRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('assessments')
            .doc(assessmentId)
            .collection('rubrics')
            .doc(rubricId);

        const rubricDoc = {
            id: rubricId,
            assessmentId,
            overallRubric,
            questionRubrics: finalQuestions.map(q => ({
                questionId: q.id,
                rubric: q.rubric || null,
            })),
            createdAt: new Date(),
        };

        await rubricRef.set(rubricDoc);

        // Build assessment (no longer embeds full rubric, stores reference)
        const assessment: Assessment = {
            id: assessmentId,
            teacherId,
            title: blueprint.title,
            description: `Generated assessment on ${blueprint.topicFocus.join(', ')}`,
            questions: finalQuestions,
            materials: materialUrls.map((url, i) => ({
                id: uuidv4(),
                name: materialNames[i] || `Material ${i + 1}`,
                url,
                type: 'other' as const,
                mimeType: 'application/octet-stream',
                size: 0,
                uploadedAt: new Date(),
            })),
            config: {
                ...config,
                title: blueprint.title,
            },
            rubricId, // Reference to the rubric doc
            rubric: overallRubric, // Keep for backward compat / quick display
            totalPoints: finalQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
            estimatedTimeMinutes: config.timeLimitMinutes || 30,
            createdAt: new Date(),
        };

        // Save assessment to Firestore
        const assessmentRef = adminDb
            .collection('teachers')
            .doc(teacherId)
            .collection('assessments')
            .doc(assessmentId);

        await assessmentRef.set(assessment);

        onEvent({
            type: 'done',
            message: 'Assessment generation complete!',
            data: assessment,
            timestamp: new Date().toISOString()
        });

        return assessment;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during orchestration';
        onEvent({
            type: 'error',
            message: 'Orchestration failed',
            error: errorMessage,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}
