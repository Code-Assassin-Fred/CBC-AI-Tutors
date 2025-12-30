"use client";

import { useState } from 'react';
import { useCommunity } from '@/lib/context/CommunityContext';
import { PostType } from '@/types/community';

export default function CreatePostModal() {
    const { showCreateModal, setShowCreateModal, createPost, isSubmitting } = useCommunity();

    const [type, setType] = useState<PostType>('question');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handleClose = () => {
        setShowCreateModal(false);
        setType('question');
        setTitle('');
        setContent('');
        setTags([]);
        setTagInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        await createPost(type, title.trim(), content.trim(), tags);
        handleClose();
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
            if (tag && !tags.includes(tag) && tags.length < 5) {
                setTags([...tags, tag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    if (!showCreateModal) return null;

    const types: { value: PostType; label: string; desc: string }[] = [
        { value: 'question', label: 'Question', desc: 'Ask for help' },
        { value: 'discussion', label: 'Discussion', desc: 'Start a conversation' },
        { value: 'resource', label: 'Resource', desc: 'Share something' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#0b0f12] rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">New Post</h3>
                    <button
                        onClick={handleClose}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-xs text-white/50 mb-2">Post type</label>
                        <div className="flex gap-2">
                            {types.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setType(t.value)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${type === t.value
                                            ? 'bg-[#0ea5e9] text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={type === 'question' ? 'What do you want to know?' : 'Give your post a title'}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                            autoFocus
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Provide more details..."
                            rows={4}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50 resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs text-white/50 mb-1.5">
                            Tags <span className="text-white/30">(press Enter to add)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="text-white/40 hover:text-white"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                            disabled={tags.length >= 5}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2.5 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !content.trim() || isSubmitting}
                            className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
