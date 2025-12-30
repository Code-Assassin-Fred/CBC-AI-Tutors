"use client";

import { CommunityPost } from '@/types/community';
import { useCommunity } from '@/lib/context/CommunityContext';

interface PostItemProps {
    post: CommunityPost;
    onClick: () => void;
}

export default function PostItem({ post, onClick }: PostItemProps) {
    const { likePost, savePost } = useCommunity();

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    const getTypeStyles = () => {
        switch (post.type) {
            case 'question':
                return post.isAnswered
                    ? 'text-[#10b981]'
                    : 'text-[#f59e0b]';
            case 'discussion':
                return 'text-[#0ea5e9]';
            case 'resource':
                return 'text-[#8b5cf6]';
            default:
                return 'text-white/50';
        }
    };

    const getTypeLabel = () => {
        switch (post.type) {
            case 'question':
                return post.isAnswered ? 'Answered' : 'Question';
            case 'discussion':
                return 'Discussion';
            case 'resource':
                return 'Resource';
            default:
                return '';
        }
    };

    return (
        <article className="py-4 group">
            {/* Type indicator and meta */}
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium ${getTypeStyles()}`}>
                    {getTypeLabel()}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/40">{post.authorName}</span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/40">{formatTime(post.createdAt)}</span>
            </div>

            {/* Title */}
            <button
                onClick={onClick}
                className="text-left w-full group-hover:text-[#0ea5e9] transition-colors"
            >
                <h3 className="text-base font-medium text-white group-hover:text-[#0ea5e9] mb-1 line-clamp-2">
                    {post.title}
                </h3>
            </button>

            {/* Preview content */}
            <p className="text-sm text-white/50 line-clamp-2 mb-3">
                {post.content}
            </p>

            {/* Tags and actions */}
            <div className="flex items-center justify-between">
                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-white/40 bg-white/5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Stats and actions */}
                <div className="flex items-center gap-4 text-xs text-white/40">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            likePost(post.id);
                        }}
                        className="flex items-center gap-1 hover:text-[#0ea5e9] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likes}
                    </button>
                    <button
                        onClick={onClick}
                        className="flex items-center gap-1 hover:text-[#0ea5e9] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.replyCount}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            savePost(post.id);
                        }}
                        className="flex items-center gap-1 hover:text-[#0ea5e9] transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {post.saves}
                    </button>
                </div>
            </div>
        </article>
    );
}
