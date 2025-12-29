/**
 * Topic Suggestions API
 * 
 * GET /api/courses/suggestions
 * Returns shuffled topic suggestions for the courses home page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { TOPIC_SUGGESTIONS } from '@/lib/prompts/coursePrompts';
import { TopicSuggestion } from '@/types/course';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);
        const category = searchParams.get('category');
        const trendingOnly = searchParams.get('trending') === 'true';

        let suggestions: TopicSuggestion[] = [...TOPIC_SUGGESTIONS];

        // Filter by category if specified
        if (category) {
            suggestions = suggestions.filter(s =>
                s.category.toLowerCase() === category.toLowerCase()
            );
        }

        // Filter trending only if specified
        if (trendingOnly) {
            suggestions = suggestions.filter(s => s.trending);
        }

        // Shuffle and limit
        const shuffled = shuffleArray(suggestions);
        const result = shuffled.slice(0, limit);

        // Get unique categories for filtering UI
        const categories = [...new Set(TOPIC_SUGGESTIONS.map(s => s.category))].sort();

        return NextResponse.json({
            suggestions: result,
            categories,
            totalAvailable: TOPIC_SUGGESTIONS.length,
        });

    } catch (error) {
        console.error('Error getting suggestions:', error);
        return NextResponse.json(
            { error: 'Failed to get suggestions' },
            { status: 500 }
        );
    }
}
