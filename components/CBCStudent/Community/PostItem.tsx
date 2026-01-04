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

    const getTypeBadge = () => {
        switch (post.type) {
            case 'question':
                return post.isAnswered
                    ? { label: 'Answered', color: 'bg-emerald-500' }
                    : { label: 'Question', color: 'bg-amber-500' };
            case 'discussion':
                return { label: 'Discussion', color: 'bg-sky-500' };
            case 'resource':
                return { label: 'Resource', color: 'bg-violet-500' };
            default:
                return { label: '', color: 'bg-white/20' };
        }
    };

    const badge = getTypeBadge();

    return (
        <article className="group p-4 rounded-xl bg-[#0b0f12] border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-colors cursor-pointer">
            {/* Type Badge and Meta */}
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color} text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]`}>
                    {badge.label}
                </span>
                <span className="text-xs text-[#9aa6b2]">{post.authorName}</span>
                <span className="text-[#9aa6b2]/50">•</span>
                <span className="text-xs text-[#9aa6b2]">{formatTime(post.createdAt)}</span>
            </div>

            {/* Title */}
            <button
                onClick={onClick}
                className="text-left w-full"
            >
                <h3 className="text-sm font-semibold text-white/95 group-hover:text-[#0ea5e9] mb-1.5 line-clamp-2 transition-colors">
                    {post.title}
                </h3>
            </button>

            {/* Preview content */}
            <p className="text-sm text-[#9aa6b2] line-clamp-2 mb-3">
                {post.content}
            </p>

            {/* Tags and actions */}
            <div className="flex items-center justify-between">
                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap">
                    {post.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-[#9aa6b2] bg-white/5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Stats and actions */}
                <div className="flex items-center gap-4 text-xs text-[#9aa6b2]">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            likePost(post.id);
                        }}
                        className="hover:text-[#0ea5e9] transition-colors"
                    >
                        ♥ {post.likes}
                    </button>
                    <button
                        onClick={onClick}
                        className="hover:text-[#0ea5e9] transition-colors"
                    >
                        💬 {post.replyCount}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            savePost(post.id);
                        }}
                        className="hover:text-[#0ea5e9] transition-colors"
                    >
                        🔖 {post.saves}
                    </button>
                </div>
            </div>
        </article>
    );
}
