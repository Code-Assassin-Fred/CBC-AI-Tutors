import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/agentOrchestrator';
import { ResourceCategory } from '@/types/resource';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { category, subcategory, count = 1 } = body;

        if (!category || !subcategory) {
            return NextResponse.json({ error: 'Category and subcategory are required' }, { status: 400 });
        }

        const orchestrator = new AgentOrchestrator();

        // Run in background (don't await completion for the response)
        // In a real production serverless environment, this might timeout if tasks are long.
        // For Vercel Pro, functions can run longer, or we use Vercel Cron.
        // For manual triggers, we can just await for 1 resource or use a job queue in future.

        // For now, we will await it since the user wants "immediate generation" when empty.
        // But limits on Vercel Function execution time apply (10s on hobby, 60s on pro).
        // If it takes too long, we might need to return early.

        const ids = await orchestrator.generateResourcesForCategory(
            category as ResourceCategory,
            subcategory,
            count
        );

        return NextResponse.json({
            success: true,
            message: 'Generation completed',
            generatedCount: ids.length,
            ids
        });

    } catch (error) {
        console.error('Generation API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
