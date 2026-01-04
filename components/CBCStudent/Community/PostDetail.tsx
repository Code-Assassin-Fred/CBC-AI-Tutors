"use client";

import { useEffect, useState } from 'react';
import { useCommunity } from '@/lib/context/CommunityContext';

export default function PostDetail() {
    const {
        activePost,
        setActivePost,
        activeReplies,
        loadPostReplies,
        createReply,
        likeReply,
        acceptReply,
        likePost,
        savePost,
    } = useCommunity();

    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string; content: string } | null>(null);

    useEffect(() => {
        if (activePost) {
            loadPostReplies(activePost.id);
        }
    }, [activePost, loadPostReplies]);

    if (!activePost) return null;

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

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        setIsSubmitting(true);
        await createReply(activePost.id, replyContent.trim(), replyingTo?.id);
        setReplyContent('');
        setReplyingTo(null);
        setIsSubmitting(false);
    };

    const getTypeBadge = () => {
        switch (activePost.type) {
            case 'question':
                return activePost.isAnswered
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
        <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-6">
            {/* Back button */}
            <button
                onClick={() => setActivePost(null)}
                className="flex items-center gap-2 text-[#9aa6b2] hover:text-white mb-6 transition-colors text-sm"
            >
                ← Back to Feed
            </button>

            {/* Post header */}
            <div className="mb-6 pb-6 border-b border-white/6">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color} text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]`}>
                        {badge.label}
                    </span>
                    <span className="text-xs text-[#9aa6b2]">{activePost.authorName}</span>
                    <span className="text-[#9aa6b2]/50">•</span>
                    <span className="text-xs text-[#9aa6b2]">{formatTime(activePost.createdAt)}</span>
                </div>

                <h1 className="text-xl font-semibold text-white mb-4">
                    {activePost.title}
                </h1>

                <p className="text-[#9aa6b2] leading-relaxed mb-4">
                    {activePost.content}
                </p>

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                    {activePost.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-[#9aa6b2] bg-white/5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 text-sm text-[#9aa6b2]">
                    <button
                        onClick={() => likePost(activePost.id)}
                        className="hover:text-[#0ea5e9] transition-colors"
                    >
                        ♥ {activePost.likes} likes
                    </button>
                    <button
                        onClick={() => savePost(activePost.id)}
                        className="hover:text-[#0ea5e9] transition-colors"
                    >
                        🔖 Save
                    </button>
                    <span>👁 {activePost.views} views</span>
                    <button
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                        className="hover:text-[#0ea5e9] transition-colors ml-auto"
                    >
                        🔗 Share
                    </button>
                </div>
            </div>

            {/* Replies */}
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-white/95 mb-4">
                    {activeReplies.length} Replies
                </h2>

                <div className="space-y-4">
                    {activeReplies.map((reply) => (
                        <div
                            key={reply.id}
                            id={`reply-${reply.id}`}
                            className={`p-4 rounded-xl border-l-2 ${reply.isAccepted
                                    ? 'border-emerald-500 bg-emerald-500/5'
                                    : 'border-white/10 bg-white/[0.02]'
                                }`}
                        >
                            {reply.isAccepted && (
                                <div className="flex items-center gap-1 text-xs text-emerald-500 mb-2 font-medium">
                                    ✓ Accepted Answer
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-white/90">{reply.authorName}</span>
                                <span className="text-[#9aa6b2]/50">•</span>
                                <span className="text-xs text-[#9aa6b2]">{formatTime(reply.createdAt)}</span>
                            </div>

                            <p className="text-[#9aa6b2] text-sm mb-3">{reply.content}</p>

                            <div className="flex items-center gap-4 text-xs text-[#9aa6b2]">
                                <button
                                    onClick={() => likeReply(reply.id)}
                                    className="hover:text-[#0ea5e9] transition-colors"
                                >
                                    ♥ {reply.likes}
                                </button>
                                <button
                                    onClick={() => setReplyingTo({ id: reply.id, authorName: reply.authorName, content: reply.content })}
                                    className="hover:text-[#0ea5e9] transition-colors"
                                >
                                    Reply
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`${window.location.href}#reply-${reply.id}`)}
                                    className="hover:text-[#0ea5e9] transition-colors"
                                >
                                    Link
                                </button>
                                {activePost.type === 'question' && !activePost.isAnswered && (
                                    <button
                                        onClick={() => acceptReply(activePost.id, reply.id)}
                                        className="hover:text-emerald-500 transition-colors ml-auto"
                                    >
                                        Mark as Answer
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reply form */}
            <div className="pt-4 border-t border-white/6">
                <h3 className="text-sm font-semibold text-white/95 mb-3">Add a Reply</h3>

                {replyingTo && (
                    <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-t-xl border border-white/8 border-b-0 mb-0">
                        <div className="text-sm text-[#9aa6b2] truncate">
                            Replying to <span className="text-[#0ea5e9]">@{replyingTo.authorName}</span>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-[#9aa6b2] hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-[#0b1113] border border-white/8 text-white placeholder-[#9aa6b2] text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 resize-none ${replyingTo ? 'rounded-b-xl rounded-t-none' : 'rounded-xl'
                        }`}
                />
                <div className="flex justify-end mt-3">
                    <button
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim() || isSubmitting}
                        className="px-4 py-2 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 disabled:opacity-50 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
}
