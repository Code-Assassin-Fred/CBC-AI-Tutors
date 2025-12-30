/**
 * Topic Suggestions API
 * 
 * GET /api/courses/suggestions
 * Returns topic suggestions from:
 * 1. Static curated suggestions
 * 2. Recently generated courses from Firebase (for infinite suggestions)
 */

import { NextRequest, NextResponse } from 'next/server';
import { TOPIC_SUGGESTIONS } from '@/lib/prompts/coursePrompts';
import { TopicSuggestion } from '@/types/course';
import { adminDb } from '@/lib/firebaseAdmin';

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
        const includeGenerated = searchParams.get('includeGenerated') !== 'false';

        let suggestions: TopicSuggestion[] = [...TOPIC_SUGGESTIONS];

        // Fetch recently generated courses from Firebase
        if (includeGenerated) {
            try {
                const coursesSnapshot = await adminDb
                    .collection('courses')
                    .orderBy('createdAt', 'desc')
                    .limit(50)
                    .get();

                const generatedSuggestions: TopicSuggestion[] = coursesSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: `generated-${doc.id}`,
                        topic: data.title || data.topic || 'Unknown Topic',
                        displayName: data.title || data.topic || 'Unknown Topic',
                        category: data.category || 'General',
                        icon: '📚',
                        trending: data.saveCount > 5, // Mark popular courses as trending
                    };
                });

                // Add generated courses to suggestions
                suggestions = [...suggestions, ...generatedSuggestions];
            } catch (firebaseError) {
                console.error('Error fetching generated courses:', firebaseError);
                // Continue with static suggestions if Firebase fails
            }
        }

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

        // Remove duplicates by topic
        const seenTopics = new Set<string>();
        suggestions = suggestions.filter(s => {
            const normalized = s.topic.toLowerCase().trim();
            if (seenTopics.has(normalized)) return false;
            seenTopics.add(normalized);
            return true;
        });

        // Shuffle and limit
        const shuffled = shuffleArray(suggestions);
        const result = shuffled.slice(0, limit);

        // Get unique categories for filtering UI
        const categories = [...new Set(suggestions.map(s => s.category))].sort();

        return NextResponse.json({
            suggestions: result,
            categories,
            totalAvailable: suggestions.length,
        });

    } catch (error) {
        console.error('Error getting suggestions:', error);
        return NextResponse.json(
            { error: 'Failed to get suggestions' },
            { status: 500 }
        );
    }
}
