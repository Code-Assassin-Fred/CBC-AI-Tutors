"use client";

import { useEffect } from 'react';
import { useCommunity } from '@/lib/context/CommunityContext';
import PostItem from './PostItem';

export default function CommunityFeed() {
    const {
        posts,
        filter,
        setFilter,
        sort,
        setSort,
        searchQuery,
        setSearchQuery,
        isLoadingFeed,
        loadPosts,
        setShowCreateModal,
        setActivePost,
        showingSaved,
        setShowingSaved,
    } = useCommunity();

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'questions', label: 'Questions' },
        { value: 'discussions', label: 'Discussions' },
    ] as const;

    return (
        <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-6">
            {/* Header with search and create */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0b1113] border border-white/8 rounded-xl text-white placeholder-[#9aa6b2] text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-xl text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center gap-2 shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
                >
                    + New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/6">
                <div className="flex gap-1">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => {
                                setFilter(f.value);
                                setShowingSaved(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value && !showingSaved
                                    ? 'bg-[#0ea5e9] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]'
                                    : 'text-[#9aa6b2] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowingSaved(true)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showingSaved
                                ? 'bg-[#0ea5e9] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]'
                                : 'text-[#9aa6b2] hover:text-white hover:bg-white/5'
                            }`}
                    >
                        🔖 Saved
                    </button>
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="px-3 py-1.5 bg-[#0b1113] border border-white/8 rounded-lg text-sm text-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40"
                >
                    <option value="recent">Recent</option>
                    <option value="popular">Popular</option>
                    <option value="unanswered">Unanswered</option>
                </select>
            </div>

            {/* Posts */}
            {isLoadingFeed ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 mx-auto border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostItem
                            key={post.id}
                            post={post}
                            onClick={() => setActivePost(post)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-[#9aa6b2]">
                    <p>{showingSaved ? 'No saved posts' : 'No posts found'}</p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-[#0ea5e9] text-sm hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
