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
    Attachment,
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
    loadPosts: (filterRole?: 'student' | 'teacher') => Promise<void>;

    // Active post
    activePost: CommunityPost | null;
    setActivePost: (post: CommunityPost | null) => void;
    activeReplies: PostReply[];
    loadPostReplies: (postId: string) => Promise<void>;

    // Post actions
    createPost: (type: PostType, title: string, content: string, tags: string[], attachments?: Attachment[], authorRole?: 'student' | 'teacher') => Promise<void>;
    likePost: (postId: string) => Promise<void>;
    savePost: (postId: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;

    // Reply actions
    createReply: (postId: string, content: string, parentReplyId?: string) => Promise<void>;
    likeReply: (replyId: string) => Promise<void>;
    acceptReply: (postId: string, replyId: string) => Promise<void>;
    deleteReply: (postId: string, replyId: string) => Promise<void>;

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
    showingSaved: boolean;
    setShowingSaved: (show: boolean) => void;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

// ============================================
// SAMPLE DATA (for groups/members - not persisted yet)
// ============================================

const sampleGroups: StudyGroup[] = [
    { id: 'g1', name: 'Grade 8 Study Squad', description: 'Help each other prepare for KCPE', topic: 'KCPE Prep', icon: '📚', memberCount: 234, memberIds: [], creatorId: 'user1', isPublic: true, lastActivityAt: new Date(), postCount: 45, createdAt: new Date() },
    { id: 'g2', name: 'Math Helpers', description: 'Stuck on a math problem? Ask here!', topic: 'Mathematics', icon: '🔢', memberCount: 156, memberIds: [], creatorId: 'user2', isPublic: true, lastActivityAt: new Date(), postCount: 32, createdAt: new Date() },
    { id: 'g3', name: 'Science Explorers', description: 'Discuss experiments and discoveries', topic: 'Science', icon: '🔬', memberCount: 89, memberIds: [], creatorId: 'user3', isPublic: true, lastActivityAt: new Date(), postCount: 28, createdAt: new Date() },
    { id: 'g4', name: 'English Practice', description: 'Improve your English together', topic: 'English', icon: '📖', memberCount: 112, memberIds: [], creatorId: 'user4', isPublic: true, lastActivityAt: new Date(), postCount: 35, createdAt: new Date() },
];

const sampleMembers: CommunityMember[] = [
    { userId: 'user1', displayName: 'Kevin M.', postCount: 12, replyCount: 45, helpfulAnswers: 8, reputation: 234, isOnline: true, lastSeenAt: new Date(), groupIds: [] },
    { userId: 'user2', displayName: 'Amina W.', postCount: 8, replyCount: 67, helpfulAnswers: 15, reputation: 456, isOnline: true, lastSeenAt: new Date(), groupIds: [] },
    { userId: 'user4', displayName: 'Faith N.', postCount: 23, replyCount: 89, helpfulAnswers: 21, reputation: 678, isOnline: false, lastSeenAt: new Date(), groupIds: [] },
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
    const [posts, setPosts] = useState<CommunityPost[]>([]);
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
    const [showingSaved, setShowingSaved] = useState(false);

    // Load posts from API
    const loadPosts = useCallback(async (filterRole?: 'student' | 'teacher') => {
        if (!user && showingSaved) {
            setPosts([]);
            return;
        }
        setIsLoadingFeed(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('filter', filter);
            if (sort !== 'recent') params.set('sort', sort);
            if (searchQuery) params.set('q', searchQuery);
            if (filterRole) params.set('role', filterRole);
            if (showingSaved && user) params.set('savedBy', user.uid);

            const response = await fetch(`/api/community?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setIsLoadingFeed(false);
        }
    }, [filter, sort, searchQuery, showingSaved, user]);

    // Load replies for a post
    const loadPostReplies = useCallback(async (postId: string) => {
        try {
            const response = await fetch(`/api/community?postId=${postId}`);
            if (response.ok) {
                const data = await response.json();
                setActiveReplies(data.replies || []);
            }
        } catch (error) {
            console.error('Error loading replies:', error);
        }
    }, []);

    // Create post
    const createPost = useCallback(async (type: PostType, title: string, content: string, tags: string[], attachments?: Attachment[], authorRole: 'student' | 'teacher' = 'student') => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'post',
                    data: {
                        authorId: user.uid,
                        authorName: user.displayName || 'Anonymous',
                        authorRole,
                        type,
                        title,
                        content,
                        tags,
                        attachments: attachments || [],
                    },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(prev => [data.post, ...prev]);
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [user]);

    // Like/Unlike post
    const likePost = useCallback(async (postId: string) => {
        if (!user) return;

        // Find the post to check if already liked
        const post = posts.find(p => p.id === postId) || activePost;
        const isLiked = post?.likedBy?.includes(user.uid);
        const action = isLiked ? 'unlike' : 'like';

        try {
            const response = await fetch('/api/community', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    postId,
                    userId: user.uid,
                }),
            });

            if (response.ok) {
                const delta = isLiked ? -1 : 1;
                const updateLikedBy = isLiked
                    ? (arr: string[]) => arr.filter(id => id !== user.uid)
                    : (arr: string[]) => [...arr, user.uid];

                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, likes: p.likes + delta, likedBy: updateLikedBy(p.likedBy || []) } : p
                ));
                if (activePost?.id === postId) {
                    setActivePost(prev => prev ? { ...prev, likes: prev.likes + delta, likedBy: updateLikedBy(prev.likedBy || []) } : null);
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    }, [user, activePost, posts]);

    // Save/Unsave post
    const savePost = useCallback(async (postId: string) => {
        if (!user) return;

        // Find the post to check if already saved
        const post = posts.find(p => p.id === postId) || activePost;
        const isSaved = post?.savedBy?.includes(user.uid);
        const action = isSaved ? 'unsave' : 'save';

        try {
            const response = await fetch('/api/community', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    postId,
                    userId: user.uid,
                }),
            });

            if (response.ok) {
                const delta = isSaved ? -1 : 1;
                const updateSavedBy = isSaved
                    ? (arr: string[]) => arr.filter(id => id !== user.uid)
                    : (arr: string[]) => [...arr, user.uid];

                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, saves: p.saves + delta, savedBy: updateSavedBy(p.savedBy || []) } : p
                ));
                if (activePost?.id === postId) {
                    setActivePost(prev => prev ? { ...prev, saves: prev.saves + delta, savedBy: updateSavedBy(prev.savedBy || []) } : null);
                }
            }
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    }, [user, activePost, posts]);

    // Delete post
    const deletePost = useCallback(async (postId: string) => {
        if (!user) return;
        try {
            const response = await fetch(`/api/community?postId=${postId}&userId=${user.uid}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                if (activePost?.id === postId) {
                    setActivePost(null);
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }, [user, activePost]);

    // Create reply
    const createReply = useCallback(async (postId: string, content: string, parentReplyId?: string) => {
        if (!user) return;
        try {
            const response = await fetch('/api/community', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'reply',
                    data: {
                        postId,
                        authorId: user.uid,
                        authorName: user.displayName || 'Anonymous',
                        content,
                        parentReplyId,
                    },
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setActiveReplies(prev => [...prev, data.reply]);
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p
                ));
            }
        } catch (error) {
            console.error('Error creating reply:', error);
        }
    }, [user]);

    // Like reply
    const likeReply = useCallback(async (replyId: string) => {
        if (!user || !activePost) return;
        try {
            const response = await fetch('/api/community', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'like',
                    postId: activePost.id,
                    replyId,
                    userId: user.uid,
                }),
            });

            if (response.ok) {
                setActiveReplies(prev => prev.map(r =>
                    r.id === replyId ? { ...r, likes: r.likes + 1 } : r
                ));
            }
        } catch (error) {
            console.error('Error liking reply:', error);
        }
    }, [user, activePost]);

    // Accept reply (mark as answer)
    const acceptReply = useCallback(async (postId: string, replyId: string) => {
        if (!user) return;
        try {
            const response = await fetch('/api/community', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'accept',
                    postId,
                    replyId,
                    userId: user.uid,
                }),
            });

            if (response.ok) {
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, isAnswered: true, acceptedReplyId: replyId } : p
                ));
                setActiveReplies(prev => prev.map(r =>
                    r.id === replyId ? { ...r, isAccepted: true } : { ...r, isAccepted: false }
                ));
                if (activePost?.id === postId) {
                    setActivePost(prev => prev ? { ...prev, isAnswered: true, acceptedReplyId: replyId } : null);
                }
            }
        } catch (error) {
            console.error('Error accepting reply:', error);
        }
    }, [user, activePost]);

    // Delete reply
    const deleteReply = useCallback(async (postId: string, replyId: string) => {
        if (!user) return;
        try {
            const response = await fetch(`/api/community?postId=${postId}&replyId=${replyId}&userId=${user.uid}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setActiveReplies(prev => prev.filter(r => r.id !== replyId));
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, replyCount: Math.max(0, p.replyCount - 1) } : p
                ));
            }
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
    }, [user]);

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

    // Filtered posts (already filtered by API, but apply local search for instant feedback)
    const filteredPosts = useMemo(() => {
        return posts;
    }, [posts]);

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
        deletePost,
        createReply,
        likeReply,
        acceptReply,
        deleteReply,
        groups,
        myGroups,
        joinGroup,
        leaveGroup,
        activeMembers,
        topContributors,
        showCreateModal,
        setShowCreateModal,
        isSubmitting,
        showingSaved,
        setShowingSaved,
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
