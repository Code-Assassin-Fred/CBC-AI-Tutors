'use client';

import React, { createContext, useContext, useState } from 'react';
import { Resource, ResourceFilter, ResourceCategory } from '@/types/resources';

// Mock Data
const MOCK_RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'The Future of AI work',
        description: 'How specialized AI agents are changing the workforce landscape.',
        type: 'ai-article',
        category: 'ai-future',
        subcategory: 'Job Market',
        tags: ['AI', 'career', 'future'],
        relatedCareers: [],
        relatedSkills: [],
        isFree: true,
        saves: 120,
        helpfulVotes: 45,
        createdAt: new Date()
    },
    {
        id: '2',
        title: 'Deep Work',
        description: 'Excerpts and summary of Cal Newport\'s book.',
        type: 'book',
        category: 'meta-learning',
        subcategory: 'Productivity',
        tags: ['focus', 'productivity'],
        relatedCareers: [],
        relatedSkills: [],
        isFree: false,
        saves: 85,
        helpfulVotes: 30,
        createdAt: new Date()
    }
];

interface ResourcesContextType {
    resources: Resource[];
    isLoading: boolean;
    activeFilter: ResourceFilter;

    // Actions
    setFilter: (filter: ResourceFilter) => void;
    searchResources: (query: string) => Promise<void>;
    generateAIArticle: (topic: string) => Promise<string | null>; // Returns ID
}

const ResourcesContext = createContext<ResourcesContextType | undefined>(undefined);

export function ResourcesProvider({ children }: { children: React.ReactNode }) {
    const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<ResourceFilter>({});

    const setFilter = (filter: ResourceFilter) => {
        setActiveFilter(filter);
        // TODO: Filter local resources or fetch new ones
    };

    const searchResources = async (query: string) => {
        setIsLoading(true);
        // TODO: API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    const generateAIArticle = async (topic: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/resources/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error('Failed to generate article');
            }

            const data = await response.json();

            const newArticle: Resource = {
                id: `gen-${Date.now()}`,
                title: data.title,
                description: data.description,
                type: 'ai-article',
                category: data.category as ResourceCategory,
                subcategory: data.subcategory,
                tags: data.tags,
                relatedCareers: [],
                relatedSkills: [],
                isFree: true,
                saves: 0,
                helpfulVotes: 0,
                createdAt: new Date(),
                content: data.markdownContent,
                duration: data.duration,
                difficulty: data.difficulty
            };

            setResources(prev => [newArticle, ...prev]);
            return newArticle.id;
        } catch (err) {
            console.error(err);
            // Optionally handle error state here
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ResourcesContext.Provider value={{
            resources,
            isLoading,
            activeFilter,
            setFilter,
            searchResources,
            generateAIArticle
        }}>
            {children}
        </ResourcesContext.Provider>
    );
}

export function useResources() {
    const context = useContext(ResourcesContext);
    if (!context) {
        throw new Error('useResources must be used within a ResourcesProvider');
    }
    return context;
}
