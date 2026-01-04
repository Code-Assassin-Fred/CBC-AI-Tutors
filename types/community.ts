/**
 * Community Types
 * 
 * Types for discussion posts, replies, study groups, and member interactions
 */

// ============================================
// POST TYPES
// ============================================

export type PostType = 'question' | 'discussion' | 'announcement' | 'resource';

export type AttachmentType = 'image' | 'video' | 'document' | 'link';

export interface Attachment {
    id: string;
    type: AttachmentType;
    url: string;
    name: string;
    mimeType?: string;
    size?: number; // bytes
    thumbnailUrl?: string; // for videos/images
}

export interface CommunityPost {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;

    // Content
    type: PostType;
    title: string;
    content: string;
    tags: string[];
    attachments?: Attachment[]; // For resource sharing

    // For questions
    isAnswered?: boolean;
    acceptedReplyId?: string;

    // Engagement
    likes: number;
    likedBy: string[];
    replyCount: number;
    views: number;
    saves: number;
    savedBy: string[];

    // Grouping
    groupId?: string;
    careerId?: string;      // Link to career path

    // Metadata
    createdAt: Date;
    updatedAt?: Date;
    isPinned?: boolean;
}

// ============================================
// REPLY TYPES
// ============================================

export interface PostReply {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;

    // Content
    content: string;

    // For nested replies
    parentReplyId?: string;

    // Engagement
    likes: number;
    likedBy: string[];

    // Status
    isAccepted?: boolean;   // For question answers

    // Metadata
    createdAt: Date;
    updatedAt?: Date;
}

// ============================================
// STUDY GROUP TYPES
// ============================================

export interface StudyGroup {
    id: string;
    name: string;
    description: string;
    topic: string;          // e.g., "Python", "Machine Learning"
    icon?: string;          // Emoji or icon

    // Members
    memberCount: number;
    memberIds: string[];
    creatorId: string;

    // Settings
    isPublic: boolean;

    // Activity
    lastActivityAt: Date;
    postCount: number;

    // Metadata
    createdAt: Date;
}

// ============================================
// MEMBER TYPES
// ============================================

export interface CommunityMember {
    userId: string;
    displayName: string;
    avatar?: string;

    // Stats
    postCount: number;
    replyCount: number;
    helpfulAnswers: number;
    reputation: number;

    // Status
    isOnline: boolean;
    lastSeenAt: Date;

    // Groups
    groupIds: string[];
}

// ============================================
// FEED TYPES
// ============================================

export type FeedFilter = 'all' | 'questions' | 'discussions' | 'my-posts' | 'saved';
export type FeedSort = 'recent' | 'popular' | 'unanswered';

export interface FeedState {
    filter: FeedFilter;
    sort: FeedSort;
    searchQuery: string;
    activeGroupId: string | null;
}

// ============================================
// CONTEXT STATE
// ============================================

export interface CommunityState {
    // Feed
    posts: CommunityPost[];
    feedState: FeedState;
    isLoadingFeed: boolean;
    hasMorePosts: boolean;

    // Active post
    activePost: CommunityPost | null;
    activePostReplies: PostReply[];
    isLoadingPost: boolean;

    // Groups
    groups: StudyGroup[];
    myGroups: StudyGroup[];

    // Members
    activeMembers: CommunityMember[];
    topContributors: CommunityMember[];

    // UI state
    showCreateModal: boolean;
    isSubmitting: boolean;
}

// ============================================
// API TYPES
// ============================================

export interface CreatePostRequest {
    authorId: string;
    type: PostType;
    title: string;
    content: string;
    tags: string[];
    groupId?: string;
}

export interface CreateReplyRequest {
    postId: string;
    authorId: string;
    content: string;
    parentReplyId?: string;
}

export interface FeedRequest {
    filter?: FeedFilter;
    sort?: FeedSort;
    groupId?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
}
