"use client";

import { CareerPath } from '@/types/careerPath';

interface MyCareerPathsProps {
    paths: CareerPath[];
    isLoading?: boolean;
    onSelectPath: (path: CareerPath) => void;
}

export default function MyCareerPaths({ paths, isLoading, onSelectPath }: MyCareerPathsProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (paths.length === 0) {
        return (
            <div className="text-center py-12 text-white/50">
                <p>No career paths yet</p>
                <p className="text-sm mt-2">Generate a path above to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {paths.map(path => (
                <button
                    key={path.id}
                    onClick={() => onSelectPath(path)}
                    className="w-full flex items-center gap-4 p-4 bg-[#0b0f12] border border-white/10 rounded-xl text-left hover:border-white/20 transition-colors"
                >
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{path.title}</h3>
                        <p className="text-white/40 text-sm truncate">{path.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-white/30 text-sm">
                        {path.courses.length} courses
                    </div>
                    <span className="text-white/30">→</span>
                </button>
            ))}
        </div>
    );
}
