import React from 'react';
import { Resource } from '@/types/resource';
import { ArrowLeft, Share2, Bookmark, ThumbsUp, Calendar, User, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIArticleViewerProps {
    resource: Resource;
    onBack: () => void;
}

export default function AIArticleViewer({ resource, onBack }: AIArticleViewerProps) {
    if (resource.type !== 'ai-article') return null;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Resources
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-sm font-medium border border-teal-500/20">
                        {resource.category.replace('-', ' ')}
                    </span>
                    {resource.verifiedAt && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20" title={`Verified on ${new Date(resource.verifiedAt).toLocaleDateString()}`}>
                            <ShieldCheck className="w-3 h-3" />
                            Verified Content
                        </span>
                    )}
                </div>

                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {resource.title}
                </h1>

                <p className="text-xl text-slate-300 mb-6 leading-relaxed">
                    {resource.description}
                </p>

                <div className="flex items-center justify-between py-6 border-y border-slate-800">
                    <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(resource.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {resource.generatedBy === 'ai-agent' ? 'AI Researcher' : 'Staff Curator'}
                        </div>
                        {resource.duration && (
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                {resource.duration}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="prose prose-invert prose-lg max-w-none prose-headings:text-teal-50 prose-a:text-teal-400 prose-strong:text-teal-200">
                {resource.content ? (
                    <ReactMarkdown>{resource.content}</ReactMarkdown>
                ) : (
                    <div className="p-8 text-center bg-slate-800/50 rounded-xl text-slate-400 italic">
                        No content available for this resource yet.
                    </div>
                )}
            </article>

            {/* References / Sources */}
            {resource.sources && resource.sources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-4">Sources & Citations</h3>
                    <ul className="space-y-3">
                        {resource.sources.map((source: any, idx: number) => (
                            <li key={idx} className="text-slate-400 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <span className="text-slate-200 font-medium">{source.title}</span>
                                {source.author && <span className="text-slate-500"> — {source.author}</span>}
                                {source.year && <span className="text-slate-600"> ({source.year})</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
