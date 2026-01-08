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
        <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-3 sm:p-6">
            {/* Header with search and create */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex-1 relative">
                    <svg className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-[#0b1113] border border-white/8 rounded-lg sm:rounded-xl text-white placeholder-[#9aa6b2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0ea5e9] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] self-stretch sm:self-auto"
                >
                    + New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/6">
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => {
                                setFilter(f.value);
                                setShowingSaved(false);
                            }}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${filter === f.value && !showingSaved
                                ? 'bg-[#0ea5e9] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]'
                                : 'text-[#9aa6b2] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowingSaved(true)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${showingSaved
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
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#0b1113] border border-white/8 rounded-lg text-xs sm:text-sm text-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 self-end sm:self-auto"
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
