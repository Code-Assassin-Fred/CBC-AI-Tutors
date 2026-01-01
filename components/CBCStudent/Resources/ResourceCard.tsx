import React from 'react';
import { Resource } from '@/types/resource';
import { BookOpen, ExternalLink, Video, PenTool, Bookmark, ThumbsUp, Clock, BarChart } from 'lucide-react';

interface ResourceCardProps {
    resource: Resource;
    onClick: () => void;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
}

export default function ResourceCard({ resource, onClick, isSaved, onToggleSave }: ResourceCardProps) {
    const getIcon = () => {
        switch (resource.type) {
            case 'ai-article': return <BookOpen className="w-5 h-5 text-teal-400" />;
            case 'external-article': return <ExternalLink className="w-5 h-5 text-blue-400" />;
            case 'video': return <Video className="w-5 h-5 text-red-400" />;
            case 'tool': return <PenTool className="w-5 h-5 text-purple-400" />;
            default: return <BookOpen className="w-5 h-5 text-gray-400" />;
        }
    };

    const getDifficultyColor = (diff?: string) => {
        switch (diff) {
            case 'beginner': return 'text-green-400 bg-green-400/10';
            case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
            case 'advanced': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-[#1E293B]/50 border border-slate-700/50 rounded-xl p-5 hover:border-teal-500/30 hover:bg-[#1E293B]/80 transition-all cursor-pointer flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-slate-800/50 group-hover:scale-110 transition-transform">
                    {getIcon()}
                </div>
                <button
                    onClick={onToggleSave}
                    className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${isSaved ? 'text-teal-400' : 'text-slate-400'}`}
                >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-teal-400' : ''}`} />
                </button>
            </div>

            <h3 className="text-lg font-semibold text-slate-100 mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors">
                {resource.title}
            </h3>

            <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">
                {resource.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {resource.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                    </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {resource.duration || '5 min'}
                </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {resource.helpfulVotes}
                    </span>
                    <span className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3" />
                        {resource.saves}
                    </span>
                </div>

                {resource.generatedBy === 'ai-agent' && (
                    <span className="flex items-center gap-1 text-teal-500/70" title="AI Generated & Verified">
                        <BarChart className="w-3 h-3" />
                        AI Verified {resource.qualityScore ? `(${resource.qualityScore})` : ''}
                    </span>
                )}
            </div>
        </div>
    );
}
