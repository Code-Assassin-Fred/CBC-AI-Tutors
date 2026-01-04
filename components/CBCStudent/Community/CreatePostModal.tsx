"use client";

import { useState, useRef } from 'react';
import { useCommunity } from '@/lib/context/CommunityContext';
import { PostType, Attachment } from '@/types/community';
import { useAuth } from '@/lib/context/AuthContext';

export default function CreatePostModal() {
    const { user } = useAuth();
    const { showCreateModal, setShowCreateModal, createPost, isSubmitting } = useCommunity();

    const [type, setType] = useState<PostType>('question');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [linkInput, setLinkInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        setShowCreateModal(false);
        setType('question');
        setTitle('');
        setContent('');
        setTags([]);
        setTagInput('');
        setAttachments([]);
        setLinkInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        await createPost(type, title.trim(), content.trim(), tags, attachments);
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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !user) return;

        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', user.uid);

                const response = await fetch('/api/community/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setAttachments(prev => [...prev, data.attachment]);
                } else {
                    const error = await response.json();
                    alert(error.error || 'Upload failed');
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddLink = () => {
        if (!linkInput.trim()) return;

        let url = linkInput.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const newAttachment: Attachment = {
            id: `link-${Date.now()}`,
            type: 'link',
            url,
            name: url,
        };

        setAttachments(prev => [...prev, newAttachment]);
        setLinkInput('');
    };

    const removeAttachment = (id: string) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    const getAttachmentIcon = (type: Attachment['type']) => {
        switch (type) {
            case 'image': return '🖼️';
            case 'video': return '🎬';
            case 'document': return '📄';
            case 'link': return '🔗';
            default: return '📎';
        }
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
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-white/6 bg-[#0a0f14]">
                    <h3 className="text-lg font-semibold text-white">New Post</h3>
                    <button
                        onClick={handleClose}
                        className="p-1 text-[#9aa6b2] hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-xs text-[#9aa6b2] mb-2">Post type</label>
                        <div className="flex gap-2">
                            {types.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setType(t.value)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${type === t.value
                                        ? 'bg-[#0ea5e9] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]'
                                        : 'bg-white/5 text-[#9aa6b2] hover:bg-white/10'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs text-[#9aa6b2] mb-1.5">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={type === 'question' ? 'What do you want to know?' : type === 'resource' ? 'What are you sharing?' : 'Give your post a title'}
                            className="w-full px-3 py-2.5 bg-[#0b1113] border border-white/8 rounded-lg text-white placeholder-[#9aa6b2]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40"
                            autoFocus
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-xs text-[#9aa6b2] mb-1.5">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Provide more details..."
                            rows={4}
                            className="w-full px-3 py-2.5 bg-[#0b1113] border border-white/8 rounded-lg text-white placeholder-[#9aa6b2]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 resize-none"
                        />
                    </div>

                    {/* Attachments (shown for Resource type or always) */}
                    <div>
                        <label className="block text-xs text-[#9aa6b2] mb-2">
                            Attachments <span className="text-[#9aa6b2]/50">(images, videos, docs, links)</span>
                        </label>

                        {/* Attachment list */}
                        {attachments.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {attachments.map((att) => (
                                    <div
                                        key={att.id}
                                        className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg"
                                    >
                                        <span className="text-base">{getAttachmentIcon(att.type)}</span>
                                        <span className="flex-1 text-sm text-white truncate">{att.name}</span>
                                        {att.size && (
                                            <span className="text-xs text-[#9aa6b2]">
                                                {(att.size / 1024).toFixed(0)}KB
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(att.id)}
                                            className="text-[#9aa6b2] hover:text-red-400"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="px-3 py-2 bg-white/5 text-[#9aa6b2] rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-1.5"
                            >
                                {isUploading ? '⏳ Uploading...' : '📎 Add File'}
                            </button>
                        </div>

                        {/* Link input */}
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={linkInput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                placeholder="Paste a link..."
                                className="flex-1 px-3 py-2 bg-[#0b1113] border border-white/8 rounded-lg text-white placeholder-[#9aa6b2]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddLink();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddLink}
                                disabled={!linkInput.trim()}
                                className="px-3 py-2 bg-white/5 text-[#9aa6b2] rounded-lg text-sm hover:bg-white/10 disabled:opacity-50 transition-colors"
                            >
                                🔗 Add
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs text-[#9aa6b2] mb-1.5">
                            Tags <span className="text-[#9aa6b2]/50">(press Enter to add)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-[#9aa6b2] rounded text-xs"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="text-[#9aa6b2]/50 hover:text-white"
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
                            className="w-full px-3 py-2 bg-[#0b1113] border border-white/8 rounded-lg text-white placeholder-[#9aa6b2]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40"
                            disabled={tags.length >= 5}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2.5 bg-white/5 text-[#9aa6b2] rounded-lg text-sm hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !content.trim() || isSubmitting || isUploading}
                            className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 disabled:opacity-50 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
