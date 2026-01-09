import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/agentOrchestrator';
import { resourceGenerationService } from '@/lib/services/resourceGenerationService';

/**
 * Background Resource Generation Cron Job
 * 
 * Runs daily (staggered in 2 batches) to ensure:
 * 1. Every subcategory has at least 2 resources
 * 2. Fresh content is generated regularly
 * 
 * Vercel Cron Schedule: 2 batches staggered 12 hours apart
 * - Batch 1: 0 0 * * * (midnight every day)
 * - Batch 2: 0 12 * * * (noon every day)
 */

const BATCH_SIZE = 1; // Process only 1 subcategory per run to ensure maximum quality and focus

export async function GET(req: NextRequest) {
    const startTime = Date.now();

    // Basic authorization for cron jobs
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.warn('[Cron] Unauthorized request attempt');
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    // Get batch number from query params (default to 1)
    const { searchParams } = new URL(req.url);
    const batchNumber = parseInt(searchParams.get('batch') || '1', 10);

    console.log(`[Cron] ========================================`);
    console.log(`[Cron] Resource Generation - Batch ${batchNumber}`);
    console.log(`[Cron] Started at: ${new Date().toISOString()}`);
    console.log(`[Cron] ========================================`);

    const orchestrator = new AgentOrchestrator();
    const results: {
        subcategory: string;
        reason: string;
        success: boolean;
        resourcesGenerated: number;
        error?: string;
    }[] = [];

    try {
        // Get current status summary
        const status = await resourceGenerationService.getStatusSummary();
        console.log(`[Cron] Status: ${status.totalSubcategories} subcategories total`);
        console.log(`[Cron]   - With gaps (<2 resources): ${status.withGaps}`);
        console.log(`[Cron]   - Due for refresh: ${status.dueForRefresh}`);
        console.log(`[Cron]   - Healthy: ${status.healthy}`);

        // Get tasks for this batch
        const tasks = await resourceGenerationService.getGenerationTasks(batchNumber, BATCH_SIZE);

        if (tasks.length === 0) {
            console.log(`[Cron] No generation tasks required for batch ${batchNumber}.`);
            return NextResponse.json({
                success: true,
                batch: batchNumber,
                message: 'No generation tasks required',
                status,
                executionTimeMs: Date.now() - startTime
            });
        }

        console.log(`[Cron] Processing ${tasks.length} subcategories:`);
        tasks.forEach(t => console.log(`[Cron]   - ${t.categoryId}/${t.subcategoryId} (${t.reason})`));

        // Process each task
        for (const task of tasks) {
            const taskKey = `${task.categoryId}/${task.subcategoryId}`;
            console.log(`[Cron] Generating resources for: ${taskKey}`);

            try {
                const ids = await orchestrator.generateResourcesForCategory(
                    task.categoryId,
                    task.subcategoryId,
                    1 // Generate 1 high-quality resource per subcategory
                );

                // Update the last generated timestamp
                await resourceGenerationService.updateLastGeneratedAt(
                    task.categoryId,
                    task.subcategoryId
                );

                results.push({
                    subcategory: taskKey,
                    reason: task.reason,
                    success: true,
                    resourcesGenerated: ids.length
                });

                console.log(`[Cron] ✓ ${taskKey}: Generated ${ids.length} resources`);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({
                    subcategory: taskKey,
                    reason: task.reason,
                    success: false,
                    resourcesGenerated: 0,
                    error: errorMessage
                });

                console.error(`[Cron] ✗ ${taskKey}: Failed - ${errorMessage}`);
            }
        }

        const successCount = results.filter(r => r.success).length;
        const totalGenerated = results.reduce((sum, r) => sum + r.resourcesGenerated, 0);
        const executionTimeMs = Date.now() - startTime;

        console.log(`[Cron] ========================================`);
        console.log(`[Cron] Batch ${batchNumber} Complete`);
        console.log(`[Cron] Success: ${successCount}/${results.length} subcategories`);
        console.log(`[Cron] Total resources generated: ${totalGenerated}`);
        console.log(`[Cron] Execution time: ${executionTimeMs}ms`);
        console.log(`[Cron] ========================================`);

        return NextResponse.json({
            success: true,
            batch: batchNumber,
            results,
            summary: {
                tasksProcessed: results.length,
                successCount,
                failedCount: results.length - successCount,
                totalResourcesGenerated: totalGenerated
            },
            executionTimeMs
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Cron] Batch ${batchNumber} failed:`, error);

        return NextResponse.json({
            success: false,
            batch: batchNumber,
            error: errorMessage,
            results,
            executionTimeMs: Date.now() - startTime
        }, { status: 500 });
    }
}
