"use client";

import { useResources } from '@/lib/context/ResourcesContext';

export default function AIArticleViewer() {
    const { activeResource, setActiveResource, isSaved, saveResource, unsaveResource } = useResources();

    if (!activeResource) return null;

    const saved = isSaved(activeResource.id);

    // Sample article content (would come from AI generation or database)
    const articleContent = activeResource.content || `
## Introduction

Learning how to learn is perhaps the most valuable meta-skill you can develop. In a rapidly changing world where new technologies and fields emerge constantly, the ability to quickly acquire new skills is more valuable than any single skill itself.

## What is Active Recall?

Active recall is a study technique that involves actively stimulating your memory during the learning process. Instead of passively reading or reviewing material, you deliberately try to retrieve information from your memory.

### Why Does It Work?

When you attempt to recall information, you strengthen the neural pathways associated with that information. This makes future recall easier and more reliable. Research has shown that:

- Testing yourself is more effective than re-reading
- Effortful retrieval creates stronger memories
- Mistakes during recall are actually helpful for learning

## Practical Techniques

### Flashcards

Create flashcards with questions on one side and answers on the other. The key is to genuinely try to recall the answer before flipping the card.

### The Feynman Technique

1. Choose a concept you want to learn
2. Explain it as if teaching a child
3. Identify gaps in your explanation
4. Review and simplify

### Self-Testing

After reading a section, close the book and write down everything you remember. Then check what you missed.

## Combining with Spaced Repetition

Active recall becomes even more powerful when combined with spaced repetition. By testing yourself at optimal intervals, you can maximize retention while minimizing study time.

## Conclusion

Start implementing active recall today. It may feel harder than passive review, but that difficulty is exactly what makes it effective. Your brain learns best when it has to work for the information.
    `;

    return (
        <div className="max-w-3xl mx-auto pt-8 px-4 pb-16">
            {/* Back button */}
            <button
                onClick={() => setActiveResource(null)}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Resources
            </button>

            {/* Article Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded text-xs">
                        AI-Generated Article
                    </span>
                    {activeResource.difficulty && (
                        <span className={`px-2 py-1 rounded text-xs ${activeResource.difficulty === 'beginner'
                                ? 'bg-[#10b981]/10 text-[#10b981]'
                                : activeResource.difficulty === 'intermediate'
                                    ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                                    : 'bg-[#ef4444]/10 text-[#ef4444]'
                            }`}>
                            {activeResource.difficulty}
                        </span>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    {activeResource.title}
                </h1>

                <p className="text-white/60 mb-4">
                    {activeResource.description}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-white/40">
                        {activeResource.duration && (
                            <span>{activeResource.duration}</span>
                        )}
                        <span>{activeResource.helpfulVotes} found helpful</span>
                    </div>

                    <button
                        onClick={() => saved ? unsaveResource(activeResource.id) : saveResource(activeResource.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${saved
                                ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {saved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mb-8" />

            {/* Article Content */}
            <article className="prose prose-invert prose-sm max-w-none">
                <div
                    className="text-white/80 leading-relaxed space-y-4"
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {articleContent.split('\n\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('## ')) {
                            return (
                                <h2 key={idx} className="text-xl font-semibold text-white mt-8 mb-4">
                                    {paragraph.replace('## ', '')}
                                </h2>
                            );
                        }
                        if (paragraph.startsWith('### ')) {
                            return (
                                <h3 key={idx} className="text-lg font-medium text-white mt-6 mb-3">
                                    {paragraph.replace('### ', '')}
                                </h3>
                            );
                        }
                        if (paragraph.startsWith('- ')) {
                            return (
                                <ul key={idx} className="list-disc list-inside space-y-1 text-white/70">
                                    {paragraph.split('\n').map((item, i) => (
                                        <li key={i}>{item.replace('- ', '')}</li>
                                    ))}
                                </ul>
                            );
                        }
                        if (paragraph.match(/^\d\./)) {
                            return (
                                <ol key={idx} className="list-decimal list-inside space-y-1 text-white/70">
                                    {paragraph.split('\n').map((item, i) => (
                                        <li key={i}>{item.replace(/^\d\.\s/, '')}</li>
                                    ))}
                                </ol>
                            );
                        }
                        return (
                            <p key={idx} className="text-white/70">
                                {paragraph}
                            </p>
                        );
                    })}
                </div>
            </article>

            {/* Footer Actions */}
            <div className="mt-12 pt-6 border-t border-white/10">
                <p className="text-sm text-white/40 mb-4">Was this article helpful?</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-colors">
                        Yes, helpful
                    </button>
                    <button className="px-4 py-2 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10 transition-colors">
                        Not really
                    </button>
                </div>
            </div>
        </div>
    );
}
