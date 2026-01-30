/**
 * Assessment Generation API
 * 
 * POST /api/teacher/assessments/generate
 * Generates an AI-powered assessment based on uploaded materials.
 * Uses a multi-agent orchestration workflow with real-time SSE streaming.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAssessmentOrchestrator } from '@/lib/agents/assessmentOrchestrator';
import { AssessmentGenerationRequest } from '@/types/assessment';
import { AssessmentAgentEvent } from '@/types/assessment-agent.types';

export const runtime = 'nodejs';
export const maxDuration = 180;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teacherId, materialUrls, materialNames, config } = body as AssessmentGenerationRequest;

        if (!teacherId || !config) {
            return NextResponse.json(
                { error: 'Missing required fields: teacherId, config' },
                { status: 400 }
            );
        }

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const send = (event: AssessmentAgentEvent) => {
                    const data = JSON.stringify(event);
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                };

                try {
                    console.log(`[API] Starting multi-agent assessment generation for teacher: ${teacherId}`);

                    await runAssessmentOrchestrator(
                        {
                            config,
                            teacherId,
                            materialUrls: materialUrls || [],
                            materialNames: materialNames || [],
                        },
                        {
                            onEvent: (event) => {
                                send(event);
                            }
                        }
                    );

                    console.log(`[API] Assessment generation complete for teacher: ${teacherId}`);
                } catch (error) {
                    console.error('[API] Orchestration error:', error);
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    send({
                        type: 'error',
                        message: 'Generation failed',
                        error: errorMessage,
                        timestamp: new Date().toISOString()
                    });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('[API] Assessment generation error:', error);
        return NextResponse.json({ error: 'Failed to generate assessment' }, { status: 500 });
    }
}

