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
        await createReply(activePost.id, replyContent.trim());
        setReplyContent('');
        setIsSubmitting(false);
    };

    return (
        <div>
            {/* Back button */}
            <button
                onClick={() => setActivePost(null)}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Feed
            </button>

            {/* Post header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium ${activePost.type === 'question'
                            ? activePost.isAnswered ? 'text-[#10b981]' : 'text-[#f59e0b]'
                            : 'text-[#0ea5e9]'
                        }`}>
                        {activePost.type === 'question'
                            ? activePost.isAnswered ? 'Answered' : 'Question'
                            : activePost.type.charAt(0).toUpperCase() + activePost.type.slice(1)
                        }
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-white/40">{activePost.authorName}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-white/40">{formatTime(activePost.createdAt)}</span>
                </div>

                <h1 className="text-xl font-semibold text-white mb-4">
                    {activePost.title}
                </h1>

                <p className="text-white/70 leading-relaxed mb-4">
                    {activePost.content}
                </p>

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                    {activePost.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 text-xs text-white/50 bg-white/5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 text-sm text-white/50 pt-4 border-t border-white/5">
                    <button
                        onClick={() => likePost(activePost.id)}
                        className="flex items-center gap-1.5 hover:text-[#0ea5e9] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {activePost.likes} likes
                    </button>
                    <button
                        onClick={() => savePost(activePost.id)}
                        className="flex items-center gap-1.5 hover:text-[#0ea5e9] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                    </button>
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {activePost.views} views
                    </span>
                </div>
            </div>

            {/* Replies */}
            <div className="mb-6">
                <h2 className="text-sm font-medium text-white mb-4">
                    {activeReplies.length} Replies
                </h2>

                <div className="space-y-4">
                    {activeReplies.map((reply) => (
                        <div
                            key={reply.id}
                            className={`py-4 border-l-2 pl-4 ${reply.isAccepted
                                    ? 'border-[#10b981] bg-[#10b981]/5'
                                    : 'border-white/10'
                                }`}
                        >
                            {reply.isAccepted && (
                                <div className="flex items-center gap-1 text-xs text-[#10b981] mb-2">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accepted Answer
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-white/70">{reply.authorName}</span>
                                <span className="text-white/20">•</span>
                                <span className="text-xs text-white/40">{formatTime(reply.createdAt)}</span>
                            </div>

                            <p className="text-white/60 text-sm mb-3">{reply.content}</p>

                            <div className="flex items-center gap-4 text-xs text-white/40">
                                <button
                                    onClick={() => likeReply(reply.id)}
                                    className="flex items-center gap-1 hover:text-[#0ea5e9] transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {reply.likes}
                                </button>
                                {activePost.type === 'question' && !activePost.isAnswered && (
                                    <button
                                        onClick={() => acceptReply(activePost.id, reply.id)}
                                        className="hover:text-[#10b981] transition-colors"
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
            <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-white mb-3">Add a Reply</h3>
                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50 resize-none"
                />
                <div className="flex justify-end mt-3">
                    <button
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim() || isSubmitting}
                        className="px-4 py-2 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
}
