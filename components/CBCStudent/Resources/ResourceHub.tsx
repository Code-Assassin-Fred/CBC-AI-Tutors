"use client";

import { useEffect, useState } from 'react';
import { useResources } from '@/lib/context/ResourcesContext';
import ResourceCard from './ResourceCard';
import AIArticleViewer from './AIArticleViewer';
import { Search, Filter, RefreshCw, Wand2 } from 'lucide-react';
import { Resource } from '@/types/resource';

export default function ResourceHub() {
    const {
        resources,
        categories,
        activeCategory,
        setActiveCategory,
        activeSubcategory,
        setActiveSubcategory,
        isLoading,
        loadResources,
        searchQuery,
        setSearchQuery,
        activeResource,
        setActiveResource,
        isSaved,
        saveResource,
        unsaveResource,
        isGeneratingArticle
    } = useResources();

    // Initial load
    useEffect(() => {
        loadResources({
            category: activeCategory || undefined,
            subcategory: activeSubcategory || undefined,
            searchQuery: searchQuery || undefined
        });
    }, [activeCategory, activeSubcategory, searchQuery, loadResources]);

    // Polling for background generation
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!isLoading && resources.length === 0 && activeCategory) {
            interval = setInterval(() => {
                loadResources({
                    category: activeCategory || undefined,
                    subcategory: activeSubcategory || undefined,
                    searchQuery: searchQuery || undefined
                }, true); // Silent update
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, resources.length, activeCategory, activeSubcategory, searchQuery, loadResources]);

    const handleResourceClick = (resource: Resource) => {
        setActiveResource(resource);
    };

    const handleBack = () => {
        setActiveResource(null);
    };

    const toggleSave = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (isSaved(id)) {
            unsaveResource(id);
        } else {
            saveResource(id);
        }
    };

    // View: Article Viewer
    if (activeResource) {
        return <AIArticleViewer resource={activeResource} onBack={handleBack} />;
    }

    // View: Resource Hub Grid
    return (
        <div className="h-full flex flex-col space-y-4 sm:space-y-6">
            {/* Header Area */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                    <p className="text-xs sm:text-base text-slate-400">Curated AI-generated content for your learning journey</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="relative group flex-grow">
                        <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-[#228B22] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#228B22]/50 focus:bg-slate-800 w-full transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setActiveSubcategory(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === cat.id
                            ? 'bg-[#228B22] text-white shadow-lg shadow-[#228B22]/20'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Subcategories */}
            {activeCategory && (
                <div className="flex overflow-x-auto no-scrollbar gap-2 py-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                    <button
                        onClick={() => setActiveSubcategory(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex-shrink-0 ${!activeSubcategory
                            ? 'bg-slate-100 text-slate-900 border-slate-100'
                            : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}
                    >
                        All
                    </button>
                    {categories.find(c => c.id === activeCategory)?.subcategories.map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => setActiveSubcategory(sub.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex-shrink-0 ${activeSubcategory === sub.id
                                ? 'bg-[#228B22]/10 text-[#228B22] border-[#228B22]/30'
                                : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Grid */}
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <RefreshCw className="w-8 h-8 text-[#228B22] animate-spin mb-4" />
                    <p className="text-slate-400 animate-pulse">Scanning knowledge base...</p>
                </div>
            ) : resources.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                        <Wand2 className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Generating Knowledge</h3>
                    <p className="text-slate-400 mb-6">
                        We don't have resources for this specific topic yet, but our AI agents are researching it right now. Check back in a few moments!
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#228B22]/10 text-[#228B22] text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Agents working...
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-500">
                    {resources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onClick={() => handleResourceClick(resource)}
                            isSaved={isSaved(resource.id)}
                            onToggleSave={(e) => toggleSave(e, resource.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
