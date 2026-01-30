/**
 * Custom Lesson Generation API v2 - Multi-Agent Workflow
 * 
 * POST /api/teacher/lessons/generate-v2
 * 
 * Uses SSE (Server-Sent Events) to stream real-time progress updates
 * as specialized agents work through the lesson generation pipeline:
 * 
 * Analyst → Planner → Instructional → Creative → Assembly
 */

import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
    LessonAgentEvent,
    LessonResearch,
    LessonOutline,
} from '@/types/lesson-agent.types';
import {
    runAnalystAgent,
    runPlannerAgent,
    generateSectionContent,
    generateEngagementContent,
    assembleLesson,
} from '@/lib/services/lessonAgentService';
import { CustomLessonSection } from '@/types/customLesson';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for multi-agent workflow

// ============================================
// SSE HELPER
// ============================================

function createSSEStream() {
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream({
        start(c) {
            controller = c;
        },
    });

    const send = (event: LessonAgentEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
    };

    const close = () => {
        controller.close();
    };

    return { stream, send, close };
}

// ============================================
// MAIN HANDLER
// ============================================

export async function POST(request: NextRequest) {
    const { stream, send, close } = createSSEStream();

    // Start processing in background
    (async () => {
        const lessonId = uuidv4();
        let progress = 0;

        const timestamp = () => new Date().toISOString();

        const updateProgress = (increment: number) => {
            progress = Math.min(100, progress + increment);
            return progress;
        };

        try {
            // Parse request
            const body = await request.json();
            const { topic, audienceAge, specifications, lessonTime, teacherId } = body;

            if (!topic || !audienceAge || !teacherId) {
                send({
                    type: 'error',
                    message: 'Missing required fields',
                    error: 'topic, audienceAge, and teacherId are required',
                    timestamp: timestamp(),
                });
                close();
                return;
            }

            // ========================================
            // ANALYST AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'analyst',
                message: 'Analyzing topic and identifying learning outcomes...',
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            const research: LessonResearch = await runAnalystAgent(topic, audienceAge, lessonTime, specifications);

            send({
                type: 'agent_complete',
                agent: 'analyst',
                message: `Analysis complete. Target: ${research.difficultyLevel} level.`,
                timestamp: timestamp(),
                percentage: updateProgress(10),
                data: research,
            });

            // ========================================
            // PLANNER AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'planner',
                message: 'Structuring the lesson timeline...',
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            const outline: LessonOutline = await runPlannerAgent(research, specifications);

            send({
                type: 'agent_complete',
                agent: 'planner',
                message: `Outline ready: "${outline.title}" with ${outline.sections.length} sections`,
                timestamp: timestamp(),
                percentage: updateProgress(10),
                data: {
                    title: outline.title,
                    sectionCount: outline.sections.length,
                    sections: outline.sections.map(s => ({ title: s.title, index: s.index })),
                },
            });

            // ========================================
            // INSTRUCTIONAL AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'instructional',
                message: 'Writing educational content...',
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            const sections: CustomLessonSection[] = [];
            const totalSections = outline.sections.length;
            const progressPerSection = 40 / totalSections; // 40% for all sections

            for (let i = 0; i < outline.sections.length; i++) {
                const sectionOutline = outline.sections[i];

                send({
                    type: 'section_start',
                    agent: 'instructional',
                    sectionIndex: i,
                    totalSections,
                    title: sectionOutline.title,
                    timestamp: timestamp(),
                    percentage: progress,
                });

                const section = await generateSectionContent(outline, sectionOutline, research);
                sections.push(section);

                send({
                    type: 'section_complete',
                    agent: 'instructional',
                    sectionIndex: i,
                    totalSections,
                    charCount: section.content.length,
                    timestamp: timestamp(),
                    percentage: updateProgress(progressPerSection),
                });
            }

            send({
                type: 'agent_complete',
                agent: 'instructional',
                message: `All ${totalSections} core sections written`,
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            // ========================================
            // CREATIVE AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'creative',
                message: 'Designing activities and examples...',
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            const engagement = await generateEngagementContent(outline, research);

            send({
                type: 'agent_complete',
                agent: 'creative',
                message: `Designed ${engagement.activities.length} activities and ${engagement.examples.length} examples`,
                timestamp: timestamp(),
                percentage: updateProgress(10),
            });

            // ========================================
            // ASSEMBLY AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'assembly',
                message: 'Assembling and saving your lesson...',
                timestamp: timestamp(),
                percentage: updateProgress(2),
            });

            const lesson = await assembleLesson(
                lessonId,
                teacherId,
                topic,
                audienceAge,
                specifications,
                lessonTime,
                research,
                outline,
                sections,
                engagement
            );

            send({
                type: 'agent_complete',
                agent: 'assembly',
                message: 'Lesson finalized and saved!',
                timestamp: timestamp(),
                percentage: updateProgress(3),
            });

            // ========================================
            // COMPLETE
            // ========================================

            send({
                type: 'done',
                message: `✨ Your lesson "${outline.title}" is ready!`,
                timestamp: timestamp(),
                percentage: 100,
                data: lesson,
            });

        } catch (error: any) {
            console.error('[Lesson Generate V2] Error:', error);
            send({
                type: 'error',
                message: 'Generation failed',
                error: error.message || 'Unknown error occurred',
                timestamp: timestamp(),
            });
        } finally {
            close();
        }
    })();

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
