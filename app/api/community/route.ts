import { NextRequest, NextResponse } from 'next/server';
import { CommunityPost, PostReply } from '@/types/community';

// Sample data (in production, this would come from Firestore)
const samplePosts: CommunityPost[] = [
    {
        id: '1',
        authorId: 'user1',
        authorName: 'Alex Chen',
        type: 'question',
        title: 'Best way to learn Python for data science?',
        content: 'I want to transition into data science. Should I start with Python basics first or jump straight into pandas and numpy?',
        tags: ['python', 'data-science', 'beginner'],
        likes: 24,
        likedBy: [],
        replyCount: 8,
        views: 156,
        saves: 12,
        savedBy: [],
        isAnswered: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: '2',
        authorId: 'user2',
        authorName: 'Sarah Miller',
        type: 'discussion',
        title: 'How is AI changing the job market in 2025?',
        content: 'Let\'s discuss which careers are being most affected and how we can prepare ourselves.',
        tags: ['ai', 'careers', 'future'],
        likes: 45,
        likedBy: [],
        replyCount: 23,
        views: 412,
        saves: 34,
        savedBy: [],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || 'all';
        const sort = searchParams.get('sort') || 'recent';
        const search = searchParams.get('q') || '';

        let posts = [...samplePosts];

        // Apply filter
        if (filter === 'questions') {
            posts = posts.filter(p => p.type === 'question');
        } else if (filter === 'discussions') {
            posts = posts.filter(p => p.type === 'discussion');
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type: actionType, data } = body;

        if (actionType === 'post') {
            const newPost: CommunityPost = {
                id: `post-${Date.now()}`,
                authorId: data.authorId,
                authorName: data.authorName || 'Anonymous',
                type: data.type,
                title: data.title,
                content: data.content,
                tags: data.tags || [],
                likes: 0,
                likedBy: [],
                replyCount: 0,
                views: 0,
                saves: 0,
                savedBy: [],
                createdAt: new Date(),
            };
            // TODO: Save to Firestore
            return NextResponse.json({ success: true, post: newPost });

        } else if (actionType === 'reply') {
            const newReply: PostReply = {
                id: `reply-${Date.now()}`,
                postId: data.postId,
                authorId: data.authorId,
                authorName: data.authorName || 'Anonymous',
                content: data.content,
                likes: 0,
                likedBy: [],
                createdAt: new Date(),
            };
            // TODO: Save to Firestore
            return NextResponse.json({ success: true, reply: newReply });
        }

        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });

    } catch (error) {
        console.error('Community POST error:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, postId, replyId } = body;

        // Handle like, save, accept actions
        // TODO: Update in Firestore

        return NextResponse.json({ success: true, action, postId, replyId });

    } catch (error) {
        console.error('Community PUT error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
