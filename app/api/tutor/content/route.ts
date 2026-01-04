import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Tutor Content Cache API
 * 
 * GET: Check if cached content exists for a substrand
 * POST: Save generated content to cache
 */

// Helper to create a consistent cache key from substrand info
function createCacheKey(grade: string, subject: string, strand: string, substrand: string): string {
    // Sanitize by replacing non-alphanumeric characters (except hyphens) with underscores to ensure valid doc ID
    return `${grade}-${subject}-${strand}-${substrand}`.toLowerCase().replace(/[^a-z0-9-]/g, '_');
}

// GET - Check for cached content
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const grade = searchParams.get('grade');
        const subject = searchParams.get('subject');
        const strand = searchParams.get('strand');
        const substrand = searchParams.get('substrand');

        if (!grade || !subject || !strand || !substrand) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const cacheKey = createCacheKey(grade, subject, strand, substrand);
        const docRef = adminDb.collection('tutorContent').doc(cacheKey);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            return NextResponse.json({
                cached: true,
                content: data?.content,
                createdAt: data?.createdAt?.toDate?.() || data?.createdAt,
                createdBy: data?.createdBy,
            });
        }

        return NextResponse.json({ cached: false });
    } catch (error: any) {
        console.error('[Tutor Content Cache] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to check cache', details: error.message },
            { status: 500 }
        );
    }
}

// POST - Save content to cache
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { grade, subject, strand, substrand, content, userId } = body;

        if (!grade || !subject || !strand || !substrand || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const cacheKey = createCacheKey(grade, subject, strand, substrand);
        const docRef = adminDb.collection('tutorContent').doc(cacheKey);

        // Check if it exists already
        const existing = await docRef.get();
        if (existing.exists) {
            // Already cached, don't overwrite
            return NextResponse.json({
                success: true,
                message: 'Content already cached',
                cached: true
            });
        }

        // Save new content
        await docRef.set({
            grade,
            subject,
            strand,
            substrand,
            content,
            createdAt: Timestamp.now(),
            createdBy: userId || 'anonymous',
        });

        return NextResponse.json({
            success: true,
            message: 'Content cached successfully',
            cached: false
        });
    } catch (error: any) {
        console.error('[Tutor Content Cache] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to cache content', details: error.message },
            { status: 500 }
        );
    }
}
