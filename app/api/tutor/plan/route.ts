/**
 * Planner Agent API Route
 * 
 * Streams 6-step content generation progress to client
 */

import { NextRequest } from 'next/server';
import { runPlannerAgent } from '@/lib/agents/plannerAgent';
import { SubstrandContext, StreamEvent } from '@/lib/types/agents';

export async function POST(request: NextRequest) {
    try {
        const context: SubstrandContext = await request.json();

        // Validate required fields
        if (!context.grade || !context.subject || !context.strand || !context.substrand) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: StreamEvent) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                };

                try {
                    const result = await runPlannerAgent(context, {
                        onStepStart: (step, message) => {
                            sendEvent({
                                type: 'step-start',
                                stepNumber: step,
                                message,
                            });
                        },
                        onStepComplete: (step) => {
                            sendEvent({
                                type: 'step-complete',
                                stepNumber: step,
                            });
                        },
                        onError: (error) => {
                            sendEvent({
                                type: 'error',
                                error,
                            });
                        },
                    });

                    // Send final result
                    sendEvent({
                        type: 'done',
                        data: result,
                    });
                } catch (error) {
                    console.error('Planner Agent error:', error);
                    sendEvent({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error',
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
        console.error('Planner API error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
