"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    Resource,
    ResourceCategory,
    ResourceFilter,
    ArticleGenerationProgress,
    RESOURCE_HUB_CATEGORIES,
    ResourceHubCategory,
} from '@/types/resource';
import { useAuth } from './AuthContext';

// ============================================
// CONTEXT TYPE
// ============================================

interface ResourcesContextType {
    // Categories
    categories: ResourceHubCategory[];
    activeCategory: ResourceCategory | null;
    setActiveCategory: (category: ResourceCategory | null) => void;
    activeSubcategory: string | null;
    setActiveSubcategory: (subcategory: string | null) => void;

    // Resources
    resources: Resource[];
    isLoading: boolean;
    loadResources: (filter?: ResourceFilter) => Promise<void>;

    // AI Article Generation
    isGeneratingArticle: boolean;
    articleProgress: ArticleGenerationProgress | null;
    generateArticle: (topic: string, category: ResourceCategory) => Promise<Resource | null>;

    // Active Resource (for viewing)
    activeResource: Resource | null;
    setActiveResource: (resource: Resource | null) => void;

    // Career Filtering
    careerFilter: string | null;
    setCareerFilter: (careerId: string | null) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Saved Resources
    savedResources: string[];
    saveResource: (resourceId: string) => void;
    unsaveResource: (resourceId: string) => void;
    isSaved: (resourceId: string) => boolean;
}

const ResourcesContext = createContext<ResourcesContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface ResourcesProviderProps {
    children: ReactNode;
}

export function ResourcesProvider({ children }: ResourcesProviderProps) {
    const { user } = useAuth();

    // Categories
    const [activeCategory, setActiveCategory] = useState<ResourceCategory | null>('meta-learning');
    const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

    // Resources
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Article Generation
    const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
    const [articleProgress, setArticleProgress] = useState<ArticleGenerationProgress | null>(null);

    // Active Resource
    const [activeResource, setActiveResource] = useState<Resource | null>(null);

    // Filtering
    const [careerFilter, setCareerFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Saved
    const [savedResources, setSavedResources] = useState<string[]>([]);

    // Load Resources
    const loadResources = useCallback(async (filter?: ResourceFilter) => {
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            if (filter?.category) params.set('category', filter.category);
            if (filter?.subcategory) params.set('subcategory', filter.subcategory);
            if (filter?.relatedCareer) params.set('career', filter.relatedCareer);
            if (filter?.searchQuery) params.set('q', filter.searchQuery);

            const response = await fetch(`/api/resources/list?${params.toString()}`);

            if (response.ok) {
                const data = await response.json();
                setResources(data.resources || []);
            }
        } catch (error) {
            console.error('Failed to load resources:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Generate AI Article
    const generateArticle = useCallback(async (
        topic: string,
        category: ResourceCategory
    ): Promise<Resource | null> => {
        if (!user) return null;

        setIsGeneratingArticle(true);
        setArticleProgress({ step: 'researching', message: 'Researching topic...', percentage: 0 });

        try {
            const response = await fetch('/api/resources/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    category,
                    userId: user.uid,
                }),
            });

            if (!response.ok) throw new Error('Generation failed');

            // Handle streaming if needed, or direct response
            const data = await response.json();

            setArticleProgress({ step: 'complete', message: 'Article ready!', percentage: 100 });

            return data.resource;
        } catch (error) {
            console.error('Article generation error:', error);
            setArticleProgress({ step: 'error', message: 'Failed to generate', percentage: 0 });
            return null;
        } finally {
            setIsGeneratingArticle(false);
        }
    }, [user]);

    // Save/Unsave Resources
    const saveResource = useCallback((resourceId: string) => {
        setSavedResources(prev => [...prev, resourceId]);
        // TODO: Persist to Firestore
    }, []);

    const unsaveResource = useCallback((resourceId: string) => {
        setSavedResources(prev => prev.filter(id => id !== resourceId));
        // TODO: Persist to Firestore
    }, []);

    const isSaved = useCallback((resourceId: string) => {
        return savedResources.includes(resourceId);
    }, [savedResources]);

    const value: ResourcesContextType = {
        categories: RESOURCE_HUB_CATEGORIES,
        activeCategory,
        setActiveCategory,
        activeSubcategory,
        setActiveSubcategory,
        resources,
        isLoading,
        loadResources,
        isGeneratingArticle,
        articleProgress,
        generateArticle,
        activeResource,
        setActiveResource,
        careerFilter,
        setCareerFilter,
        searchQuery,
        setSearchQuery,
        savedResources,
        saveResource,
        unsaveResource,
        isSaved,
    };

    return (
        <ResourcesContext.Provider value={value}>
            {children}
        </ResourcesContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useResources() {
    const context = useContext(ResourcesContext);
    if (!context) {
        throw new Error('useResources must be used within ResourcesProvider');
    }
    return context;
}
