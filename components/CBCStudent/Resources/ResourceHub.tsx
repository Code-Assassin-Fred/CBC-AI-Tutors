'use client';

import React, { useState } from 'react';
import { useResources } from '@/lib/context/ResourcesContext';
import ResourceCard from './ResourceCard';
import AIArticleViewer from './AIArticleViewer';
import { Resource } from '@/types/resources';

export default function ResourceHub() {
    const { resources, setFilter, generateAIArticle, isLoading } = useResources();
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!searchQuery.trim()) return;
        setIsGenerating(true);
        const id = await generateAIArticle(searchQuery);
        setIsGenerating(false);
        // Open the new resource
        const newRes = resources.find(r => r.id === id); // Ideally context returns the object or we find it
        // For now, context mock returns ID. We need to wait for state update or fetch from context.
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Learning Resources</h1>
                    <p className="text-white/60">Curated tools, guides, and AI-generated deep dives to accelerate your growth.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <input
                            type="text"
                            placeholder="Search or ask for a guide..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0b0f12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#0ea5e9]"
                        />
                        <svg className="w-5 h-5 text-white/30 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !searchQuery}
                        className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                        {isGenerating ? (
                            'Generating...'
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Generate Guide
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-10 space-y-10">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
                        <button className="text-sm text-[#0ea5e9] hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {resources.slice(0, 4).map(resource => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                onClick={() => setSelectedResource(resource)}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Meta-Learning & Productivity</h3>
                        <button className="text-sm text-[#0ea5e9] hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Mock filling active data for demo if not enough specific data */}
                        {resources.map(resource => (
                            <ResourceCard
                                key={`dup-${resource.id}`}
                                resource={resource}
                                onClick={() => setSelectedResource(resource)}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {/* Viewer Modal */}
            {selectedResource && (
                <AIArticleViewer
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                />
            )}
        </div>
    );
}
