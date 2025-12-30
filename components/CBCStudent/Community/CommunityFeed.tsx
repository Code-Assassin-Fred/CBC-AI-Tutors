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
    } = useCommunity();

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'questions', label: 'Questions' },
        { value: 'discussions', label: 'Discussions' },
    ] as const;

    const sorts = [
        { value: 'recent', label: 'Recent' },
        { value: 'popular', label: 'Popular' },
        { value: 'unanswered', label: 'Unanswered' },
    ] as const;

    return (
        <div>
            {/* Header with search and create */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                    />
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === f.value
                                    ? 'bg-[#0ea5e9] text-white'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 focus:outline-none focus:border-[#0ea5e9]/50"
                >
                    {sorts.map((s) => (
                        <option key={s.value} value={s.value} className="bg-[#0b0f12]">
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Posts */}
            {isLoadingFeed ? (
                <div className="text-center py-12">
                    <div className="w-6 h-6 mx-auto border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : posts.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {posts.map((post) => (
                        <PostItem
                            key={post.id}
                            post={post}
                            onClick={() => setActivePost(post)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-white/40">
                    <p>No posts found</p>
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
