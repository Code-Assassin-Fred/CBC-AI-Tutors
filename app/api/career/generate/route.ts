import { NextRequest, NextResponse } from 'next/server';
import { CareerOrchestrator } from '@/lib/agents/careerOrchestrator';
import { CareerGenerationEvent } from '@/types/careerAgents';

export async function POST(req: NextRequest) {
    try {
        const { title, userId } = await req.json();

        if (!title || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log(`[CareerGen] Starting multi-agent generation for: ${title}`);

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const sendEvent = (event: CareerGenerationEvent) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                };

                try {
                    const orchestrator = new CareerOrchestrator();

                    const result = await orchestrator.generateCareerPath(title, userId, {
                        onProgress: (event) => {
                            sendEvent(event);
                        }
                    });

                    // Send final complete event with full data
                    sendEvent({
                        type: 'complete',
                        phase: 'complete',
                        message: 'Career path ready!',
                        progress: 100,
                        data: result.careerPath
                    });

                } catch (error) {
                    console.error('[CareerGen] Orchestrator error:', error);
                    sendEvent({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }

                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Career generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate career path' },
            { status: 500 }
        );
    }
}
