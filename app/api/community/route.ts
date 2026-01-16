import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { CommunityPost, PostReply } from '@/types/community';

const POSTS_COLLECTION = 'communityPosts';

// GET - Fetch posts
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || 'all';
        const sort = searchParams.get('sort') || 'recent';
        const search = searchParams.get('q') || '';
        const role = searchParams.get('role'); // Filter by author role
        const postId = searchParams.get('postId'); // For fetching single post with replies

        // If postId is provided, fetch replies for that post
        if (postId) {
            const repliesSnapshot = await adminDb
                .collection(POSTS_COLLECTION)
                .doc(postId)
                .collection('replies')
                .orderBy('createdAt', 'asc')
                .get();

            const replies: PostReply[] = repliesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            })) as PostReply[];

            return NextResponse.json({ replies });
        }

        // Fetch all posts
        let query = adminDb.collection(POSTS_COLLECTION).orderBy('createdAt', 'desc');

        const snapshot = await query.get();
        let posts: CommunityPost[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || undefined,
        })) as CommunityPost[];

        // Apply role filter
        if (role) {
            posts = posts.filter(p => p.authorRole === role);
        }

        // Apply filter
        if (filter === 'questions') {
            posts = posts.filter(p => p.type === 'question');
        } else if (filter === 'discussions') {
            posts = posts.filter(p => p.type === 'discussion');
        }

        // Filter by savedBy (for viewing saved posts)
        const savedBy = searchParams.get('savedBy');
        if (savedBy) {
            posts = posts.filter(p => p.savedBy?.includes(savedBy));
        }

        // Apply search
        if (search) {
            const q = search.toLowerCase();
            posts = posts.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q)
            );
        }

        // Apply sort
        if (sort === 'popular') {
            posts.sort((a, b) => b.likes - a.likes);
        } else if (sort === 'unanswered') {
            posts = posts.filter(p => p.type === 'question' && !p.isAnswered);
        }

        return NextResponse.json({ posts });

    } catch (error) {
        console.error('Community GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST - Create post or reply
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type: actionType, data } = body;

        if (actionType === 'post') {
            const newPost = {
                authorId: data.authorId,
                authorName: data.authorName || 'Anonymous',
                authorAvatar: data.authorAvatar || null,
                authorRole: data.authorRole || 'student', // Default to student if not specified
                type: data.type,
                title: data.title,
                content: data.content,
                tags: data.tags || [],
                attachments: data.attachments || [],
                likes: 0,
                likedBy: [],
                replyCount: 0,
                views: 0,
                saves: 0,
                savedBy: [],
                isAnswered: false,
                createdAt: FieldValue.serverTimestamp(),
            };

            const docRef = await adminDb.collection(POSTS_COLLECTION).add(newPost);

            return NextResponse.json({
                success: true,
                post: { id: docRef.id, ...newPost, createdAt: new Date() }
            });

        } else if (actionType === 'reply') {
            const newReply = {
                postId: data.postId,
                authorId: data.authorId,
                authorName: data.authorName || 'Anonymous',
                authorAvatar: data.authorAvatar || null,
                content: data.content,
                parentReplyId: data.parentReplyId || null,
                likes: 0,
                likedBy: [],
                isAccepted: false,
                createdAt: FieldValue.serverTimestamp(),
            };

            const docRef = await adminDb
                .collection(POSTS_COLLECTION)
                .doc(data.postId)
                .collection('replies')
                .add(newReply);

            // Increment reply count on post
            await adminDb.collection(POSTS_COLLECTION).doc(data.postId).update({
                replyCount: FieldValue.increment(1),
            });

            return NextResponse.json({
                success: true,
                reply: { id: docRef.id, ...newReply, createdAt: new Date() }
            });
        }

        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });

    } catch (error) {
        console.error('Community POST error:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

// PUT - Update (like, save, accept)
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, postId, replyId, userId } = body;

        if (!postId) {
            return NextResponse.json({ error: 'postId required' }, { status: 400 });
        }

        const postRef = adminDb.collection(POSTS_COLLECTION).doc(postId);

        if (action === 'like') {
            if (replyId) {
                // Like a reply
                const replyRef = postRef.collection('replies').doc(replyId);
                await replyRef.update({
                    likes: FieldValue.increment(1),
                    likedBy: FieldValue.arrayUnion(userId),
                });
            } else {
                // Like a post
                await postRef.update({
                    likes: FieldValue.increment(1),
                    likedBy: FieldValue.arrayUnion(userId),
                });
            }
            return NextResponse.json({ success: true, action: 'like' });

        } else if (action === 'unlike') {
            if (replyId) {
                const replyRef = postRef.collection('replies').doc(replyId);
                await replyRef.update({
                    likes: FieldValue.increment(-1),
                    likedBy: FieldValue.arrayRemove(userId),
                });
            } else {
                await postRef.update({
                    likes: FieldValue.increment(-1),
                    likedBy: FieldValue.arrayRemove(userId),
                });
            }
            return NextResponse.json({ success: true, action: 'unlike' });

        } else if (action === 'save') {
            await postRef.update({
                saves: FieldValue.increment(1),
                savedBy: FieldValue.arrayUnion(userId),
            });
            return NextResponse.json({ success: true, action: 'save' });

        } else if (action === 'unsave') {
            await postRef.update({
                saves: FieldValue.increment(-1),
                savedBy: FieldValue.arrayRemove(userId),
            });
            return NextResponse.json({ success: true, action: 'unsave' });

        } else if (action === 'accept' && replyId) {
            // Mark reply as accepted and post as answered
            await postRef.update({
                isAnswered: true,
                acceptedReplyId: replyId,
            });
            await postRef.collection('replies').doc(replyId).update({
                isAccepted: true,
            });
            return NextResponse.json({ success: true, action: 'accept' });

        } else if (action === 'view') {
            await postRef.update({
                views: FieldValue.increment(1),
            });
            return NextResponse.json({ success: true, action: 'view' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Community PUT error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

// DELETE - Delete post or reply
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('postId');
        const replyId = searchParams.get('replyId');
        const userId = searchParams.get('userId');

        if (!postId) {
            return NextResponse.json({ error: 'postId required' }, { status: 400 });
        }

        const postRef = adminDb.collection(POSTS_COLLECTION).doc(postId);

        if (replyId) {
            // Delete a reply
            const replyRef = postRef.collection('replies').doc(replyId);
            const replyDoc = await replyRef.get();

            if (!replyDoc.exists) {
                return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
            }

            // Verify ownership
            if (replyDoc.data()?.authorId !== userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            await replyRef.delete();

            // Decrement reply count
            await postRef.update({
                replyCount: FieldValue.increment(-1),
            });

            return NextResponse.json({ success: true, deleted: 'reply' });

        } else {
            // Delete a post (and all its replies)
            const postDoc = await postRef.get();

            if (!postDoc.exists) {
                return NextResponse.json({ error: 'Post not found' }, { status: 404 });
            }

            // Verify ownership
            if (postDoc.data()?.authorId !== userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }

            // Delete all replies first
            const repliesSnapshot = await postRef.collection('replies').get();
            const batch = adminDb.batch();
            repliesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            // Delete the post
            await postRef.delete();

            return NextResponse.json({ success: true, deleted: 'post' });
        }

    } catch (error) {
        console.error('Community DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
