import { adminDb } from '@/lib/firebaseAdmin';
import { RESOURCE_HUB_CATEGORIES, ResourceCategory } from '@/types/resource';

/**
 * Resource Generation Service
 * 
 * Handles background resource generation logic:
 * - Tracks resource counts per subcategory
 * - Determines which subcategories need generation
 * - Manages generation timestamps for 48h refresh cycles
 */

interface SubcategoryInfo {
    categoryId: ResourceCategory;
    subcategoryId: string;
    resourceCount: number;
    lastGeneratedAt: Date | null;
}

interface GenerationTask {
    categoryId: ResourceCategory;
    subcategoryId: string;
    reason: 'gap' | 'refresh';
}

const MINIMUM_RESOURCES_PER_SUBCATEGORY = 2;
const REFRESH_INTERVAL_MS = 48 * 60 * 60 * 1000; // 48 hours

export class ResourceGenerationService {

    /**
     * Get all subcategories with their current resource counts
     */
    async getSubcategoryStats(): Promise<SubcategoryInfo[]> {
        const stats: SubcategoryInfo[] = [];

        for (const category of RESOURCE_HUB_CATEGORIES) {
            for (const subcategory of category.subcategories) {
                const count = await this.getResourceCount(category.id, subcategory.id);
                const lastGen = await this.getLastGeneratedAt(category.id, subcategory.id);

                stats.push({
                    categoryId: category.id,
                    subcategoryId: subcategory.id,
                    resourceCount: count,
                    lastGeneratedAt: lastGen
                });
            }
        }

        return stats;
    }

    /**
     * Get count of resources for a specific category/subcategory
     */
    async getResourceCount(category: ResourceCategory, subcategory: string): Promise<number> {
        const snapshot = await adminDb
            .collection('resources')
            .where('category', '==', category)
            .where('subcategory', '==', subcategory)
            .count()
            .get();

        return snapshot.data().count;
    }

    /**
     * Get last generation timestamp for a subcategory
     */
    async getLastGeneratedAt(category: ResourceCategory, subcategory: string): Promise<Date | null> {
        const docId = `${category}_${subcategory}`;
        const doc = await adminDb.collection('_system').doc('resourceGeneration').collection('subcategories').doc(docId).get();

        if (doc.exists) {
            const data = doc.data();
            return data?.lastGeneratedAt?.toDate() || null;
        }
        return null;
    }

    /**
     * Update the last generation timestamp for a subcategory
     */
    async updateLastGeneratedAt(category: ResourceCategory, subcategory: string): Promise<void> {
        const docId = `${category}_${subcategory}`;
        await adminDb
            .collection('_system')
            .doc('resourceGeneration')
            .collection('subcategories')
            .doc(docId)
            .set({
                categoryId: category,
                subcategoryId: subcategory,
                lastGeneratedAt: new Date(),
                updatedAt: new Date()
            }, { merge: true });
    }

    /**
     * Determine which subcategories need generation based on batch number
     * 
     * Strategy:
     * 1. Priority 1: Any subcategory with < 2 resources (gaps)
     * 2. Priority 2: Subcategories due for 48h refresh
     * 
     * @param batchNumber - Which batch to process (1-4)
     * @param batchSize - How many subcategories per batch (default 4)
     */
    async getGenerationTasks(batchNumber: number = 1, batchSize: number = 4): Promise<GenerationTask[]> {
        const stats = await this.getSubcategoryStats();
        const tasks: GenerationTask[] = [];
        const now = new Date();

        // First pass: Find gaps (subcategories with < minimum resources)
        const gaps = stats.filter(s => s.resourceCount < MINIMUM_RESOURCES_PER_SUBCATEGORY);
        for (const gap of gaps) {
            tasks.push({
                categoryId: gap.categoryId,
                subcategoryId: gap.subcategoryId,
                reason: 'gap'
            });
        }

        // Second pass: Find subcategories due for refresh
        const dueForRefresh = stats.filter(s => {
            // Skip if already in gaps
            if (s.resourceCount < MINIMUM_RESOURCES_PER_SUBCATEGORY) return false;

            // Check if 48 hours have passed since last generation
            if (!s.lastGeneratedAt) return true; // Never generated
            const timeSinceLastGen = now.getTime() - s.lastGeneratedAt.getTime();
            return timeSinceLastGen >= REFRESH_INTERVAL_MS;
        });

        for (const item of dueForRefresh) {
            tasks.push({
                categoryId: item.categoryId,
                subcategoryId: item.subcategoryId,
                reason: 'refresh'
            });
        }

        // Calculate which portion of tasks this batch should handle
        // Gaps always get priority regardless of batch
        const gapTasks = tasks.filter(t => t.reason === 'gap');
        const refreshTasks = tasks.filter(t => t.reason === 'refresh');

        // Distribute refresh tasks across batches
        const refreshStartIndex = (batchNumber - 1) * batchSize;
        const refreshEndIndex = refreshStartIndex + batchSize;
        const batchRefreshTasks = refreshTasks.slice(refreshStartIndex, refreshEndIndex);

        // Combine: all gaps + batch's refresh tasks (capped at batchSize total)
        const combined = [...gapTasks, ...batchRefreshTasks];
        return combined.slice(0, batchSize);
    }

    /**
     * Get a summary of the current state for logging
     */
    async getStatusSummary(): Promise<{
        totalSubcategories: number;
        withGaps: number;
        dueForRefresh: number;
        healthy: number;
    }> {
        const stats = await this.getSubcategoryStats();
        const now = new Date();

        const withGaps = stats.filter(s => s.resourceCount < MINIMUM_RESOURCES_PER_SUBCATEGORY).length;
        const dueForRefresh = stats.filter(s => {
            if (s.resourceCount < MINIMUM_RESOURCES_PER_SUBCATEGORY) return false;
            if (!s.lastGeneratedAt) return true;
            return (now.getTime() - s.lastGeneratedAt.getTime()) >= REFRESH_INTERVAL_MS;
        }).length;

        return {
            totalSubcategories: stats.length,
            withGaps,
            dueForRefresh,
            healthy: stats.length - withGaps - dueForRefresh
        };
    }
}

// Export singleton instance
export const resourceGenerationService = new ResourceGenerationService();
