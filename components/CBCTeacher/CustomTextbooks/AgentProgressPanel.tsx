"use client";

import React from 'react';
import {
    TextbookAgentType,
    TEXTBOOK_AGENTS,
    AgentUIState,
    ChapterProgress,
    ImageProgress,
} from '@/types/textbook-agent.types';

// ============================================
// TYPES
// ============================================

interface AgentProgressPanelProps {
    isGenerating: boolean;
    currentAgent: TextbookAgentType | null;
    agents: AgentUIState[];
    chapters: ChapterProgress[];
    images: ImageProgress[];
    overallProgress: number;
    currentMessage: string;
}

// ============================================
// AGENT STEP COMPONENT
// ============================================

function AgentStep({
    agent,
    isActive,
    chapters,
    images,
}: {
    agent: AgentUIState;
    isActive: boolean;
    chapters?: ChapterProgress[];
    images?: ImageProgress[];
}) {
    const agentInfo = TEXTBOOK_AGENTS[agent.type];

    const getStateIcon = () => {
        switch (agent.state) {
            case 'complete':
                return '✅';
            case 'running':
                return '🔄';
            case 'error':
                return '❌';
            default:
                return '⏳';
        }
    };

    const getStateColor = () => {
        switch (agent.state) {
            case 'complete':
                return 'text-emerald-400';
            case 'running':
                return 'text-cyan-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-white/30';
        }
    };

    return (
        <div className={`transition-all duration-300 ${isActive ? 'scale-[1.02]' : ''}`}>
            <div className={`flex items-start gap-3 py-3 px-4 rounded-xl ${isActive
                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                    : agent.state === 'complete'
                        ? 'bg-emerald-500/5 border border-emerald-500/10'
                        : 'bg-white/5 border border-white/5'
                }`}>
                {/* Status Icon */}
                <div className={`flex-shrink-0 text-lg ${isActive ? 'animate-spin' : ''}`}>
                    {isActive ? '🔄' : getStateIcon()}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{agentInfo.icon}</span>
                        <span className={`font-semibold ${getStateColor()}`}>
                            {agentInfo.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${agent.state === 'complete'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : agent.state === 'running'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : agent.state === 'error'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-white/10 text-white/40'
                            }`}>
                            {agent.state === 'running' ? 'In Progress' :
                                agent.state.charAt(0).toUpperCase() + agent.state.slice(1)}
                        </span>
                    </div>
                    <p className={`text-sm mt-1 ${agent.state === 'pending' ? 'text-white/30' : 'text-white/60'
                        }`}>
                        {agent.message || agentInfo.description}
                    </p>

                    {/* Chapter Progress for Content Agent */}
                    {agent.type === 'content' && chapters && chapters.length > 0 && (
                        <div className="mt-3 space-y-1.5 pl-2 border-l-2 border-white/10">
                            {chapters.map((ch) => (
                                <div key={ch.index} className="flex items-center gap-2 text-sm">
                                    <span className={`text-xs ${ch.state === 'complete' ? 'text-emerald-400' :
                                            ch.state === 'writing' ? 'text-cyan-400 animate-pulse' :
                                                'text-white/30'
                                        }`}>
                                        {ch.state === 'complete' ? '✓' :
                                            ch.state === 'writing' ? '→' : '○'}
                                    </span>
                                    <span className={`${ch.state === 'complete' ? 'text-white/60' :
                                            ch.state === 'writing' ? 'text-cyan-300' :
                                                'text-white/30'
                                        }`}>
                                        Chapter {ch.index + 1}: {ch.title}
                                    </span>
                                    {ch.charCount && (
                                        <span className="text-white/30 text-xs">
                                            ({ch.charCount.toLocaleString()} chars)
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Image Progress for Illustration Agent */}
                    {agent.type === 'illustration' && images && images.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {images.map((img) => (
                                <div
                                    key={img.index}
                                    className={`w-10 h-10 rounded-lg border overflow-hidden ${img.state === 'complete'
                                            ? 'border-emerald-500/30'
                                            : img.state === 'generating'
                                                ? 'border-cyan-500/50 animate-pulse'
                                                : 'border-white/10'
                                        }`}
                                    title={img.description}
                                >
                                    {img.imageUrl ? (
                                        <img
                                            src={img.imageUrl}
                                            alt={img.description}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : img.state === 'generating' ? (
                                        <div className="w-full h-full bg-cyan-500/20 flex items-center justify-center">
                                            <span className="text-xs">🎨</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            <span className="text-xs text-white/30">🖼️</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AgentProgressPanel({
    isGenerating,
    currentAgent,
    agents,
    chapters,
    images,
    overallProgress,
    currentMessage,
}: AgentProgressPanelProps) {
    if (!isGenerating && agents.length === 0) {
        return null;
    }

    return (
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="relative">
                    <span className="text-2xl">⚡</span>
                    {isGenerating && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">
                        {isGenerating ? 'Generating Your Textbook' : 'Generation Complete'}
                    </h3>
                    <p className="text-sm text-white/50">
                        {currentMessage || 'Multi-agent workflow in progress...'}
                    </p>
                </div>
            </div>

            {/* Agent Timeline */}
            <div className="space-y-2">
                {agents.map((agent) => (
                    <AgentStep
                        key={agent.type}
                        agent={agent}
                        isActive={currentAgent === agent.type}
                        chapters={agent.type === 'content' ? chapters : undefined}
                        images={agent.type === 'illustration' ? images : undefined}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/50">Overall Progress</span>
                    <span className="text-sm font-mono text-cyan-400">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
