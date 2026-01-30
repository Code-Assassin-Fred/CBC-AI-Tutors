/**
 * Custom Textbook Generation API v2 - Multi-Agent Workflow
 * 
 * POST /api/teacher/textbooks/generate-v2
 * 
 * Uses SSE (Server-Sent Events) to stream real-time progress updates
 * as specialized agents work through the textbook generation pipeline:
 * 
 * Research Agent → Outline Agent → Content Agent → Illustration Agent → Assembly Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
    TextbookAgentEvent,
    TextbookAgentType,
    TopicResearch,
    TextbookOutline,
    GeneratedChapter,
    TextbookImage,
} from '@/types/textbook-agent.types';
import {
    runResearchAgent,
    runOutlineAgent,
    generateChapterContent,
    generateSummaryAndGlossary,
    generateChapterImage,
    generateCoverImage,
    assembleTextbook,
} from '@/lib/services/textbookAgentService';

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

    const send = (event: TextbookAgentEvent) => {
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
        const textbookId = uuidv4();
        let progress = 0;

        const timestamp = () => new Date().toISOString();

        const updateProgress = (increment: number) => {
            progress = Math.min(100, progress + increment);
            return progress;
        };

        try {
            // Parse request
            const body = await request.json();
            const { topic, audienceAge, specifications, teacherId } = body;

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
            // RESEARCH AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'research',
                message: 'Researching topic and analyzing audience...',
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            send({
                type: 'agent_step',
                agent: 'research',
                step: 'analyzing',
                message: `Analyzing topic: ${topic}`,
                timestamp: timestamp(),
                percentage: updateProgress(3),
            });

            const research: TopicResearch = await runResearchAgent(topic, audienceAge, specifications);

            send({
                type: 'agent_step',
                agent: 'research',
                step: 'concepts',
                message: `Identified ${research.keyConcepts.length} key concepts`,
                timestamp: timestamp(),
                percentage: updateProgress(2),
            });

            send({
                type: 'agent_complete',
                agent: 'research',
                message: `Research complete: ${research.suggestedChapterCount} chapters recommended`,
                timestamp: timestamp(),
                percentage: updateProgress(5),
                data: research,
            });

            // ========================================
            // OUTLINE AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'outline',
                message: 'Creating textbook structure...',
                timestamp: timestamp(),
                percentage: updateProgress(3),
            });

            const outline: TextbookOutline = await runOutlineAgent(research, specifications);

            send({
                type: 'agent_complete',
                agent: 'outline',
                message: `Outline ready: "${outline.title}" with ${outline.chapters.length} chapters`,
                timestamp: timestamp(),
                percentage: updateProgress(7),
                data: {
                    title: outline.title,
                    chapterCount: outline.chapters.length,
                    chapters: outline.chapters.map(ch => ({ title: ch.title, index: ch.index })),
                },
            });

            // ========================================
            // CONTENT AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'content',
                message: 'Writing chapters...',
                timestamp: timestamp(),
                percentage: updateProgress(2),
            });

            const chapters: GeneratedChapter[] = [];
            const totalChapters = outline.chapters.length;
            const progressPerChapter = 35 / totalChapters; // 35% for all chapters

            for (let i = 0; i < outline.chapters.length; i++) {
                const chapterOutline = outline.chapters[i];

                send({
                    type: 'chapter_start',
                    agent: 'content',
                    chapter: i + 1,
                    totalChapters,
                    title: chapterOutline.title,
                    timestamp: timestamp(),
                    percentage: progress,
                });

                const chapter = await generateChapterContent(outline, chapterOutline, research);
                chapters.push(chapter);

                send({
                    type: 'chapter_complete',
                    agent: 'content',
                    chapter: i + 1,
                    totalChapters,
                    charCount: chapter.content.length,
                    timestamp: timestamp(),
                    percentage: updateProgress(progressPerChapter),
                });
            }

            // Generate summary and glossary
            send({
                type: 'agent_step',
                agent: 'content',
                step: 'summary',
                message: 'Creating summary and glossary...',
                timestamp: timestamp(),
            });

            const summaryData = await generateSummaryAndGlossary(outline, chapters, research);

            send({
                type: 'agent_complete',
                agent: 'content',
                message: `All ${totalChapters} chapters written`,
                timestamp: timestamp(),
                percentage: updateProgress(5),
            });

            // ========================================
            // ILLUSTRATION AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'illustration',
                message: 'Generating illustrations...',
                timestamp: timestamp(),
                percentage: updateProgress(2),
            });

            const images: TextbookImage[] = [];
            const totalImages = chapters.length + 1; // chapters + cover
            const progressPerImage = 20 / totalImages; // 20% for all images

            // Generate cover image first
            send({
                type: 'image_start',
                agent: 'illustration',
                imageIndex: 1,
                totalImages,
                description: 'Cover illustration',
                timestamp: timestamp(),
            });

            const coverImage = await generateCoverImage(textbookId, outline, research);
            if (coverImage) {
                images.push(coverImage);
            }

            send({
                type: 'image_complete',
                agent: 'illustration',
                imageIndex: 1,
                totalImages,
                imageUrl: coverImage?.imageUrl || '',
                timestamp: timestamp(),
                percentage: updateProgress(progressPerImage),
            });

            // Generate chapter images
            for (let i = 0; i < chapters.length; i++) {
                const chapter = chapters[i];

                send({
                    type: 'image_start',
                    agent: 'illustration',
                    imageIndex: i + 2,
                    totalImages,
                    description: `Chapter ${i + 1}: ${chapter.title}`,
                    timestamp: timestamp(),
                });

                const chapterImage = await generateChapterImage(textbookId, chapter, research);
                if (chapterImage) {
                    images.push(chapterImage);
                }

                send({
                    type: 'image_complete',
                    agent: 'illustration',
                    imageIndex: i + 2,
                    totalImages,
                    imageUrl: chapterImage?.imageUrl || '',
                    timestamp: timestamp(),
                    percentage: updateProgress(progressPerImage),
                });
            }

            send({
                type: 'agent_complete',
                agent: 'illustration',
                message: `Generated ${images.length} illustrations`,
                timestamp: timestamp(),
                percentage: updateProgress(2),
            });

            // ========================================
            // ASSEMBLY AGENT
            // ========================================

            send({
                type: 'agent_start',
                agent: 'assembly',
                message: 'Compiling textbook...',
                timestamp: timestamp(),
                percentage: updateProgress(2),
            });

            const textbook = await assembleTextbook(
                textbookId,
                teacherId,
                topic,
                audienceAge,
                specifications,
                research,
                outline,
                chapters,
                summaryData,
                images
            );

            send({
                type: 'agent_complete',
                agent: 'assembly',
                message: 'Textbook saved successfully!',
                timestamp: timestamp(),
                percentage: updateProgress(3),
            });

            // ========================================
            // COMPLETE
            // ========================================

            send({
                type: 'done',
                message: `✨ Your textbook "${outline.title}" is ready!`,
                timestamp: timestamp(),
                percentage: 100,
                data: textbook,
            });

        } catch (error: any) {
            console.error('[Generate V2] Error:', error);
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
