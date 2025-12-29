"use client";

import { ReadModeContent } from '@/lib/types/agents';
import { useCourses } from '@/lib/context/CoursesContext';

interface CourseExplanationViewProps {
    content: ReadModeContent;
}

export default function CourseExplanationView({ content }: CourseExplanationViewProps) {
    const { speak, stopSpeaking, isPlaying } = useCourses();

    const handleSpeak = (text: string) => {
        if (isPlaying) {
            stopSpeaking();
        } else {
            speak(text);
        }
    };

    // Combine all content for "read all"
    const allText = [
        content.introduction,
        ...content.sections.map(s => `${s.title}. ${s.content}`),
        content.summary,
    ].join(' ');

    return (
        <div className="prose prose-invert max-w-none">
            {/* Read All Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => handleSpeak(allText)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${isPlaying
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                        }`}
                >
                    {isPlaying ? (
                        <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                            Stop
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Read All
                        </>
                    )}
                </button>
            </div>

            {/* Introduction */}
            <p className="text-white/80 text-base leading-relaxed mb-8">
                {content.introduction}
            </p>

            {/* Sections */}
            {content.sections.map((section, index) => (
                <div key={section.id || index} className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-3">
                        {section.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed mb-4 whitespace-pre-wrap">
                        {section.content}
                    </p>

                    {/* Key Points */}
                    {section.keyPoints && section.keyPoints.length > 0 && (
                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-violet-300 mb-2">Key Points</h4>
                            <ul className="space-y-1">
                                {section.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                        <svg className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Examples */}
                    {section.examples && section.examples.length > 0 && (
                        <div className="space-y-3">
                            {section.examples.map((example, i) => (
                                <div key={i} className="bg-white/5 rounded-lg p-4 border-l-2 border-amber-500/50">
                                    <h5 className="text-sm font-medium text-amber-400 mb-1">
                                        {example.title}
                                    </h5>
                                    <p className="text-sm text-white/60">
                                        {example.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Summary */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
                    Summary
                </h3>
                <p className="text-white/70 leading-relaxed">
                    {content.summary}
                </p>
            </div>

            {/* Review Questions */}
            {content.reviewQuestions && content.reviewQuestions.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                        Review Questions
                    </h3>
                    <div className="space-y-3">
                        {content.reviewQuestions.map((question, i) => (
                            <div key={i} className="flex items-start gap-3 text-white/60 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                    {i + 1}
                                </span>
                                {question}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
