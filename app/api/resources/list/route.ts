import { NextRequest, NextResponse } from 'next/server';
import { Resource, ResourceFilter } from '@/types/resource';

// Sample resources data (in production, this would come from Firestore)
const sampleResources: Resource[] = [
    {
        id: '1',
        type: 'ai-article',
        title: 'The Science of Active Recall',
        description: 'Learn how retrieval practice can dramatically improve your learning outcomes and long-term retention.',
        category: 'meta-learning',
        subcategory: 'active-recall',
        tags: ['learning', 'memory', 'study-techniques'],
        difficulty: 'beginner',
        duration: '8 min read',
        free: true,
        saves: 234,
        helpfulVotes: 89,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '2',
        type: 'ai-article',
        title: 'Spaced Repetition: Never Forget What You Learn',
        description: 'Master the technique that helps you remember anything for years, not just days.',
        category: 'meta-learning',
        subcategory: 'spaced-repetition',
        tags: ['learning', 'memory', 'anki'],
        difficulty: 'beginner',
        duration: '10 min read',
        free: true,
        saves: 456,
        helpfulVotes: 167,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '3',
        type: 'tool',
        title: 'Anki - Spaced Repetition Software',
        description: 'Free flashcard app that uses spaced repetition to help you remember anything.',
        externalUrl: 'https://apps.ankiweb.net/',
        category: 'tools',
        subcategory: 'study-tools',
        tags: ['flashcards', 'memory', 'free'],
        free: true,
        saves: 892,
        helpfulVotes: 445,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '4',
        type: 'ai-article',
        title: 'Deep Work: Rules for Focused Success',
        description: 'Learn how to achieve uninterrupted focus in a world full of distractions.',
        category: 'meta-learning',
        subcategory: 'focus',
        tags: ['productivity', 'focus', 'deep-work'],
        difficulty: 'intermediate',
        duration: '12 min read',
        free: true,
        saves: 567,
        helpfulVotes: 234,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '5',
        type: 'ai-article',
        title: 'Which Jobs Are Safe from AI?',
        description: 'A data-driven analysis of careers that will thrive alongside artificial intelligence.',
        category: 'ai-future',
        subcategory: 'ai-safe-careers',
        tags: ['ai', 'careers', 'future'],
        difficulty: 'beginner',
        duration: '15 min read',
        free: true,
        saves: 1234,
        helpfulVotes: 567,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '6',
        type: 'tool',
        title: 'Notion - All-in-one Workspace',
        description: 'Notes, docs, project management, and wikis in one tool. Perfect for students.',
        externalUrl: 'https://notion.so/',
        category: 'tools',
        subcategory: 'productivity',
        tags: ['productivity', 'notes', 'organization'],
        free: true,
        saves: 2341,
        helpfulVotes: 890,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '7',
        type: 'ai-article',
        title: 'How to Work Alongside AI',
        description: 'Practical strategies for leveraging AI tools to enhance your productivity and creativity.',
        category: 'ai-future',
        subcategory: 'working-with-ai',
        tags: ['ai', 'productivity', 'tools'],
        difficulty: 'intermediate',
        duration: '10 min read',
        free: true,
        saves: 789,
        helpfulVotes: 312,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
    {
        id: '8',
        type: 'ai-article',
        title: 'Memory Palace: Ancient Technique, Modern Use',
        description: 'Learn the memory technique used by world memory champions to remember anything.',
        category: 'meta-learning',
        subcategory: 'memory',
        tags: ['memory', 'techniques', 'learning'],
        difficulty: 'intermediate',
        duration: '12 min read',
        free: true,
        saves: 432,
        helpfulVotes: 198,
        relatedCareers: [],
        relatedSkills: [],
        createdAt: new Date(),
    },
];

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const filter: ResourceFilter = {
            category: searchParams.get('category') as ResourceFilter['category'] || undefined,
            subcategory: searchParams.get('subcategory') || undefined,
            searchQuery: searchParams.get('q') || undefined,
            relatedCareer: searchParams.get('career') || undefined,
        };

        let resources = [...sampleResources];

        // Apply filters
        if (filter.category) {
            resources = resources.filter(r => r.category === filter.category);
        }

        if (filter.subcategory) {
            resources = resources.filter(r => r.subcategory === filter.subcategory);
        }

        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            resources = resources.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.tags.some(t => t.toLowerCase().includes(query))
            );
        }

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
