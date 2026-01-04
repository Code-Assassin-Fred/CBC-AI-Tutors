import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Resource, ResourceFilter } from '@/types/resource';
import { AgentOrchestrator } from '@/lib/agents/agentOrchestrator';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const filter: ResourceFilter = {
            category: searchParams.get('category') as ResourceFilter['category'] || undefined,
            subcategory: searchParams.get('subcategory') || undefined,
            searchQuery: searchParams.get('q') || undefined,
            relatedCareer: searchParams.get('career') || undefined,
        };

        let query = adminDb.collection('resources');

        // Apply filters to Firestore query
        // Note: Firestore requires composite indexes for multiple where clauses
        if (filter.category) {
            query = query.where('category', '==', filter.category) as any;
        }

        if (filter.subcategory) {
            query = query.where('subcategory', '==', filter.subcategory) as any;
        }

        const snapshot = await query.get();
        let resources = snapshot.docs.map(doc => doc.data() as Resource);

        // Client-side search for flexible matching (since Firestore full-text search is limited)
        if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase();
            resources = resources.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                r.tags?.some(t => t.toLowerCase().includes(q))
            );
        }

        // Logic: If empty results and specific category/subcategory is requested, trigger generation
        const isEmpty = resources.length === 0;
        const isSpecificRequest = filter.category && filter.subcategory;

        if (isEmpty && isSpecificRequest) {
            console.log(`[API] No resources found for ${filter.category}/${filter.subcategory}. Triggering generation...`);

            // Trigger generation
            // Trigger background generation (Fire and Forget)
            (async () => {
                try {
                    const orchestrator = new AgentOrchestrator();
                    await orchestrator.generateResourcesForCategory(filter.category!, filter.subcategory!, 2);
                    console.log(`[API] Background generation completed for ${filter.category}/${filter.subcategory}`);
                } catch (err) {
                    console.error('[API] Background generation failed:', err);
                }
            })();
        }

        // Sort by helpfulness/saves
        resources.sort((a, b) => b.saves - a.saves);

        return NextResponse.json({
            resources,
            total: resources.length,
            hasMore: false,
        });

    } catch (error) {
        console.error('Resources list error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resources' },
            { status: 500 }
        );
    }
}
