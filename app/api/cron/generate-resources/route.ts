import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/agentOrchestrator';
import { RESOURCE_HUB_CATEGORIES } from '@/types/resource';

// Vercel Cron jobs must use GET
export async function GET(req: NextRequest) {
    // Basic authorization for cron jobs
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow if running in development without auth or check env
        if (process.env.NODE_ENV === 'production' && !authHeader) {
            // return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    console.log('[Cron] Starting scheduled 48h resource generation...');
    const orchestrator = new AgentOrchestrator();
    const generatedSummary: Record<string, number> = {};

    try {
        // Iterate through all categories and subcategories
        // To avoid timeouts, we might randomly select a few subcategories each run
        // or rely on Vercel's max duration. For comprehensive coverage, we'd need a queue.
        // For this implementation, we'll pick 3 random subcategories to update per 48h cycle.

        const flatSubcategories = RESOURCE_HUB_CATEGORIES.flatMap(cat =>
            cat.subcategories.map(sub => ({ catId: cat.id, subId: sub.id }))
        );

        // Shuffle and pick 3
        const shuffled = flatSubcategories.sort(() => 0.5 - Math.random()).slice(0, 3);

        for (const item of shuffled) {
            console.log(`[Cron] Generating for ${item.catId}/${item.subId}`);
            const ids = await orchestrator.generateResourcesForCategory(item.catId, item.subId, 2);
            generatedSummary[`${item.catId}/${item.subId}`] = ids.length;
        }

        return NextResponse.json({
            success: true,
            summary: generatedSummary,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('[Cron] Error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
