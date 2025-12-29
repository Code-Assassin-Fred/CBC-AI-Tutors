/**
 * Course Discovery API
 * 
 * GET /api/courses/discover
 * Search and discover public courses from all users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Course, CourseSearchResult } from '@/types/course';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.toLowerCase();
        const tags = searchParams.get('tags')?.split(',').filter(Boolean);
        const difficulty = searchParams.get('difficulty');
        const creatorId = searchParams.get('creatorId');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let coursesQuery = adminDb
            .collection('courses')
            .where('isPublic', '==', true)
            .orderBy('createdAt', 'desc');

        // Apply filters
        if (creatorId) {
            coursesQuery = adminDb
                .collection('courses')
                .where('creatorId', '==', creatorId)
                .orderBy('createdAt', 'desc');
        }

        if (difficulty) {
            coursesQuery = coursesQuery.where('difficulty', '==', difficulty);
        }

        // Execute query with pagination
        const snapshot = await coursesQuery
            .limit(limit + 1) // Get one extra to check if there's more
            .offset(offset)
            .get();

        let courses: Course[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        } as Course));

        // Client-side filtering for text search and tags
        // (Firestore doesn't support full-text search natively)
        if (query) {
            courses = courses.filter(course =>
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.topic.toLowerCase().includes(query) ||
                course.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        if (tags && tags.length > 0) {
            courses = courses.filter(course =>
                tags.some(tag => course.tags.includes(tag))
            );
        }

        // Check if there are more results
        const hasMore = courses.length > limit;
        if (hasMore) {
            courses = courses.slice(0, limit);
        }

        const result: CourseSearchResult = {
            courses,
            total: courses.length, // This is approximate without a count query
            hasMore,
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error discovering courses:', error);
        return NextResponse.json(
            { error: 'Failed to discover courses' },
            { status: 500 }
        );
    }
}
