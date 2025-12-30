"use client";

import { useEffect } from 'react';
import { useResources } from '@/lib/context/ResourcesContext';
import ResourceCard from './ResourceCard';
import AIArticleViewer from './AIArticleViewer';

export default function ResourceHub() {
    const {
        categories,
        activeCategory,
        setActiveCategory,
        activeSubcategory,
        setActiveSubcategory,
        resources,
        isLoading,
        loadResources,
        activeResource,
        setActiveResource,
        searchQuery,
        setSearchQuery,
    } = useResources();

    // Load resources when category changes
    useEffect(() => {
        loadResources({
            category: activeCategory || undefined,
            subcategory: activeSubcategory || undefined,
            searchQuery: searchQuery || undefined,
        });
    }, [activeCategory, activeSubcategory, searchQuery, loadResources]);

    // If viewing a specific resource
    if (activeResource) {
        return <AIArticleViewer />;
    }

    const activeTab = categories.find(c => c.id === activeCategory);

    // Sample resources for display
    const sampleResources = [
        {
            id: '1',
            type: 'ai-article' as const,
            title: 'The Science of Active Recall',
            description: 'Learn how retrieval practice can dramatically improve your learning outcomes and long-term retention.',
            category: 'meta-learning' as const,
            subcategory: 'active-recall',
            tags: ['learning', 'memory', 'study-techniques'],
            difficulty: 'beginner' as const,
            duration: '8 min read',
            free: true,
            saves: 234,
            helpfulVotes: 89,
            relatedCareers: [],
            relatedSkills: [],
            createdAt: new Date(),
        },
        {
            id: '2',
            type: 'ai-article' as const,
            title: 'Spaced Repetition: Never Forget What You Learn',
            description: 'Master the technique that helps you remember anything for years, not just days.',
            category: 'meta-learning' as const,
            subcategory: 'spaced-repetition',
            tags: ['learning', 'memory', 'anki'],
            difficulty: 'beginner' as const,
            duration: '10 min read',
            free: true,
            saves: 456,
            helpfulVotes: 167,
            relatedCareers: [],
            relatedSkills: [],
            createdAt: new Date(),
        },
        {
            id: '3',
            type: 'tool' as const,
            title: 'Anki - Spaced Repetition Software',
            description: 'Free flashcard app that uses spaced repetition to help you remember anything.',
            externalUrl: 'https://apps.ankiweb.net/',
            category: 'tools' as const,
            subcategory: 'study-tools',
            tags: ['flashcards', 'memory', 'free'],
            free: true,
            saves: 892,
            helpfulVotes: 445,
            relatedCareers: [],
            relatedSkills: [],
            createdAt: new Date(),
        },
        {
            id: '4',
            type: 'ai-article' as const,
            title: 'Deep Work: Rules for Focused Success',
            description: 'Learn how to achieve uninterrupted focus in a world full of distractions.',
            category: 'meta-learning' as const,
            subcategory: 'focus',
            tags: ['productivity', 'focus', 'deep-work'],
            difficulty: 'intermediate' as const,
            duration: '12 min read',
            free: true,
            saves: 567,
            helpfulVotes: 234,
            relatedCareers: [],
            relatedSkills: [],
            createdAt: new Date(),
        },
        {
            id: '5',
            type: 'ai-article' as const,
            title: 'Which Jobs Are Safe from AI?',
            description: 'A data-driven analysis of careers that will thrive alongside artificial intelligence.',
            category: 'ai-future' as const,
            subcategory: 'ai-safe-careers',
            tags: ['ai', 'careers', 'future'],
            difficulty: 'beginner' as const,
            duration: '15 min read',
            free: true,
            saves: 1234,
            helpfulVotes: 567,
            relatedCareers: [],
            relatedSkills: [],
            createdAt: new Date(),
        },
        {
            id: '6',
            type: 'tool' as const,
            title: 'Notion - All-in-one Workspace',
            description: 'Notes, docs, project management, and wikis in one tool. Perfect for students.',
            externalUrl: 'https://notion.so/',
            category: 'tools' as const,
            subcategory: 'productivity',
            tags: ['productivity', 'notes', 'organization'],
            free: true,
            saves: 2341,
            helpfulVotes: 890,
            relatedCareers: [],
            relatedSkills: [],
            createdAt: new Date(),
        },
    ];

    const displayResources = resources.length > 0 ? resources : sampleResources.filter(r =>
        !activeCategory || r.category === activeCategory
    );

    return (
        <div className="max-w-6xl mx-auto pt-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Resources</h1>
                <p className="text-white/50">
                    Curated learning resources, tools, and AI-generated articles
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#0ea5e9]/50"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => {
                            setActiveCategory(category.id);
                            setActiveSubcategory(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Subcategory Pills */}
            {activeTab && activeTab.subcategories.length > 0 && (
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveSubcategory(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeSubcategory
                                ? 'bg-white/15 text-white'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                    >
                        All
                    </button>
                    {activeTab.subcategories.map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => setActiveSubcategory(sub.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeSubcategory === sub.id
                                    ? 'bg-white/15 text-white'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Resources Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="w-8 h-8 mx-auto mb-4 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/50">Loading resources...</p>
                </div>
            ) : displayResources.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onClick={() => {
                                if (resource.type === 'ai-article') {
                                    setActiveResource(resource);
                                } else if (resource.externalUrl) {
                                    window.open(resource.externalUrl, '_blank');
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-white/50">No resources found</p>
                </div>
            )}
        </div>
    );
}
