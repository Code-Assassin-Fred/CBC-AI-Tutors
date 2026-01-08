"use client";

import { CommunityPost } from '@/types/community';
import { useCommunity } from '@/lib/context/CommunityContext';
import { useAuth } from '@/lib/context/AuthContext';

interface PostItemProps {
    post: CommunityPost;
    onClick: () => void;
}

export default function PostItem({ post, onClick }: PostItemProps) {
    const { user } = useAuth();
    const { likePost, savePost, deletePost } = useCommunity();

    const isAuthor = user?.uid === post.authorId;
    const isLiked = user && post.likedBy?.includes(user.uid);
    const isSaved = user && post.savedBy?.includes(user.uid);

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

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost(post.id);
        }
    };

    const badge = getTypeBadge();

    return (
        <article className="group p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#0b0f12] border border-white/8 ring-1 ring-white/5 hover:border-white/15 hover:bg-[#0d1318] transition-colors cursor-pointer">
            {/* Type Badge and Meta */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${badge.color} text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]`}>
                    {badge.label}
                </span>
                <span className="text-[10px] sm:text-xs text-[#9aa6b2]">{post.authorName}</span>
                <span className="text-[#9aa6b2]/50 hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-xs text-[#9aa6b2] hidden sm:inline">{formatTime(post.createdAt)}</span>

                {/* Delete button for author */}
                {isAuthor && (
                    <button
                        onClick={handleDelete}
                        className="ml-auto text-[10px] sm:text-xs text-[#9aa6b2] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Title */}
            <button
                onClick={onClick}
                className="text-left w-full"
            >
                <h3 className="text-xs sm:text-sm font-semibold text-white/95 group-hover:text-[#0ea5e9] mb-1 sm:mb-1.5 line-clamp-2 transition-colors">
                    {post.title}
                </h3>
            </button>

            {/* Preview content */}
            <p className="text-[11px] sm:text-sm text-[#9aa6b2] line-clamp-2 mb-2 sm:mb-3">
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
                        className={`transition-colors ${isLiked ? 'text-red-400' : 'hover:text-[#0ea5e9]'}`}
                    >
                        {isLiked ? '❤️' : '♥'} {post.likes}
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
                        className={`transition-colors ${isSaved ? 'text-[#0ea5e9]' : 'hover:text-[#0ea5e9]'}`}
                    >
                        {isSaved ? '✓ Saved' : '🔖'}
                    </button>
                </div>
            </div>
        </article>
    );
}
