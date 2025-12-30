"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import {
    CommunityPost,
    PostReply,
    StudyGroup,
    CommunityMember,
    FeedFilter,
    FeedSort,
    PostType,
} from '@/types/community';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

interface CommunityContextType {
    // Feed
    posts: CommunityPost[];
    filter: FeedFilter;
    setFilter: (filter: FeedFilter) => void;
    sort: FeedSort;
    setSort: (sort: FeedSort) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isLoadingFeed: boolean;
    loadPosts: () => Promise<void>;

    // Active post
    activePost: CommunityPost | null;
    setActivePost: (post: CommunityPost | null) => void;
    activeReplies: PostReply[];
    loadPostReplies: (postId: string) => Promise<void>;

    // Post actions
    createPost: (type: PostType, title: string, content: string, tags: string[]) => Promise<void>;
    likePost: (postId: string) => Promise<void>;
    savePost: (postId: string) => Promise<void>;

    // Reply actions
    createReply: (postId: string, content: string, parentReplyId?: string) => Promise<void>;
    likeReply: (replyId: string) => Promise<void>;
    acceptReply: (postId: string, replyId: string) => Promise<void>;

    // Groups
    groups: StudyGroup[];
    myGroups: StudyGroup[];
    joinGroup: (groupId: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;

    // Members
    activeMembers: CommunityMember[];
    topContributors: CommunityMember[];

    // UI
    showCreateModal: boolean;
    setShowCreateModal: (show: boolean) => void;
    isSubmitting: boolean;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

// ============================================
// SAMPLE DATA
// ============================================

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
    {
        id: '3',
        authorId: 'user3',
        authorName: 'James Wilson',
        type: 'question',
        title: 'How many hours per day should I study?',
        content: 'I work full-time and want to learn programming on the side. What\'s a realistic study schedule?',
        tags: ['study-tips', 'time-management'],
        likes: 18,
        likedBy: [],
        replyCount: 12,
        views: 89,
        saves: 8,
        savedBy: [],
        isAnswered: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
        id: '4',
        authorId: 'user4',
        authorName: 'Maria Garcia',
        type: 'resource',
        title: 'Free Machine Learning resources I found helpful',
        content: 'Here are some great free resources for learning ML: Fast.ai, Google ML Crash Course, and Andrew Ng\'s Coursera course.',
        tags: ['machine-learning', 'resources', 'free'],
        likes: 67,
        likedBy: [],
        replyCount: 15,
        views: 523,
        saves: 89,
        savedBy: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
];

const sampleGroups: StudyGroup[] = [
    { id: 'g1', name: 'Python Learners', description: 'For everyone learning Python', topic: 'Python', icon: '🐍', memberCount: 234, memberIds: [], creatorId: 'user1', isPublic: true, lastActivityAt: new Date(), postCount: 45, createdAt: new Date() },
    { id: 'g2', name: 'ML Study Group', description: 'Machine learning enthusiasts', topic: 'Machine Learning', icon: '🤖', memberCount: 156, memberIds: [], creatorId: 'user2', isPublic: true, lastActivityAt: new Date(), postCount: 32, createdAt: new Date() },
    { id: 'g3', name: 'Career Changers', description: 'Support for career transitions', topic: 'Careers', icon: '🚀', memberCount: 89, memberIds: [], creatorId: 'user3', isPublic: true, lastActivityAt: new Date(), postCount: 28, createdAt: new Date() },
];

const sampleMembers: CommunityMember[] = [
    { userId: 'user1', displayName: 'Alex Chen', postCount: 12, replyCount: 45, helpfulAnswers: 8, reputation: 234, isOnline: true, lastSeenAt: new Date(), groupIds: [] },
    { userId: 'user2', displayName: 'Sarah Miller', postCount: 8, replyCount: 67, helpfulAnswers: 15, reputation: 456, isOnline: true, lastSeenAt: new Date(), groupIds: [] },
    { userId: 'user4', displayName: 'Maria Garcia', postCount: 23, replyCount: 89, helpfulAnswers: 21, reputation: 678, isOnline: false, lastSeenAt: new Date(), groupIds: [] },
];

// ============================================
// PROVIDER
// ============================================

interface CommunityProviderProps {
    children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
    const { user } = useAuth();

    // Feed state
    const [posts, setPosts] = useState<CommunityPost[]>(samplePosts);
    const [filter, setFilter] = useState<FeedFilter>('all');
    const [sort, setSort] = useState<FeedSort>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingFeed, setIsLoadingFeed] = useState(false);

    // Active post
    const [activePost, setActivePost] = useState<CommunityPost | null>(null);
    const [activeReplies, setActiveReplies] = useState<PostReply[]>([]);

    // Groups
    const [groups] = useState<StudyGroup[]>(sampleGroups);
    const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);

    // Members
    const [activeMembers] = useState<CommunityMember[]>(sampleMembers.filter(m => m.isOnline));
    const [topContributors] = useState<CommunityMember[]>(sampleMembers.sort((a, b) => b.reputation - a.reputation).slice(0, 5));

    // UI
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load posts
    const loadPosts = useCallback(async () => {
        setIsLoadingFeed(true);
        try {
            // TODO: Fetch from API
            await new Promise(r => setTimeout(r, 300));
        } finally {
            setIsLoadingFeed(false);
        }
    }, []);

    // Load replies for a post
    const loadPostReplies = useCallback(async (postId: string) => {
        // Sample replies
        setActiveReplies([
            {
                id: 'r1',
                postId,
                authorId: 'user2',
                authorName: 'Sarah Miller',
                content: 'I recommend starting with Python basics first. Understanding fundamentals will make the data science libraries much easier to learn.',
                likes: 12,
                likedBy: [],
                isAccepted: true,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
            {
                id: 'r2',
                postId,
                authorId: 'user3',
                authorName: 'James Wilson',
                content: 'Agree with Sarah. Also check out the Python for Data Science course on our platform!',
                likes: 5,
                likedBy: [],
                createdAt: new Date(Date.now() - 30 * 60 * 1000),
            },
        ]);
    }, []);

    // Create post
    const createPost = useCallback(async (type: PostType, title: string, content: string, tags: string[]) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const newPost: CommunityPost = {
                id: `post-${Date.now()}`,
                authorId: user.uid,
                authorName: user.displayName || 'Anonymous',
                type,
                title,
                content,
                tags,
                likes: 0,
                likedBy: [],
                replyCount: 0,
                views: 0,
                saves: 0,
                savedBy: [],
                createdAt: new Date(),
            };
            setPosts(prev => [newPost, ...prev]);
            setShowCreateModal(false);
        } finally {
            setIsSubmitting(false);
        }
    }, [user]);

    // Like post
    const likePost = useCallback(async (postId: string) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, likes: p.likes + 1 } : p
        ));
    }, []);

    // Save post
    const savePost = useCallback(async (postId: string) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, saves: p.saves + 1 } : p
        ));
    }, []);

    // Create reply
    const createReply = useCallback(async (postId: string, content: string, parentReplyId?: string) => {
        if (!user) return;
        const newReply: PostReply = {
            id: `reply-${Date.now()}`,
            postId,
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            content,
            parentReplyId,
            likes: 0,
            likedBy: [],
            createdAt: new Date(),
        };
        setActiveReplies(prev => [...prev, newReply]);
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p
        ));
    }, [user]);

    // Like reply
    const likeReply = useCallback(async (replyId: string) => {
        setActiveReplies(prev => prev.map(r =>
            r.id === replyId ? { ...r, likes: r.likes + 1 } : r
        ));
    }, []);

    // Accept reply (mark as answer)
    const acceptReply = useCallback(async (postId: string, replyId: string) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, isAnswered: true, acceptedReplyId: replyId } : p
        ));
        setActiveReplies(prev => prev.map(r =>
            r.id === replyId ? { ...r, isAccepted: true } : { ...r, isAccepted: false }
        ));
    }, []);

    // Join group
    const joinGroup = useCallback(async (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (group && !myGroups.some(g => g.id === groupId)) {
            setMyGroups(prev => [...prev, group]);
        }
    }, [groups, myGroups]);

    // Leave group
    const leaveGroup = useCallback(async (groupId: string) => {
        setMyGroups(prev => prev.filter(g => g.id !== groupId));
    }, []);

    // Filtered posts
    const filteredPosts = useMemo(() => {
        let result = [...posts];

        // Apply filter
        if (filter === 'questions') {
            result = result.filter(p => p.type === 'question');
        } else if (filter === 'discussions') {
            result = result.filter(p => p.type === 'discussion');
        }

        // Apply search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        // Apply sort
        if (sort === 'popular') {
            result.sort((a, b) => b.likes - a.likes);
        } else if (sort === 'unanswered') {
            result = result.filter(p => p.type === 'question' && !p.isAnswered);
        }

        return result;
    }, [posts, filter, sort, searchQuery]);

    const value: CommunityContextType = {
        posts: filteredPosts,
        filter,
        setFilter,
        sort,
        setSort,
        searchQuery,
        setSearchQuery,
        isLoadingFeed,
        loadPosts,
        activePost,
        setActivePost,
        activeReplies,
        loadPostReplies,
        createPost,
        likePost,
        savePost,
        createReply,
        likeReply,
        acceptReply,
        groups,
        myGroups,
        joinGroup,
        leaveGroup,
        activeMembers,
        topContributors,
        showCreateModal,
        setShowCreateModal,
        isSubmitting,
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useCommunity() {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error('useCommunity must be used within CommunityProvider');
    }
    return context;
}
