"use client";

import React, { useEffect, useRef } from 'react';
import {
    LessonAgentType,
    LESSON_AGENTS,
    AgentUIState,
    SectionProgress,
    ActivityProgress,
} from '@/types/lesson-agent.types';

// ============================================
// TYPES
// ============================================

interface LessonAgentProgressPanelProps {
    isGenerating: boolean;
    currentAgent: LessonAgentType | null;
    agents: AgentUIState[];
    sections: SectionProgress[];
    activities: ActivityProgress[];
    overallProgress: number;
    currentMessage: string;
}

// ============================================
// AGENT STEP COMPONENT
// ============================================

function AgentStep({
    agent,
    isActive,
    sections,
    activities,
}: {
    agent: AgentUIState;
    isActive: boolean;
    sections?: SectionProgress[];
    activities?: ActivityProgress[];
}) {
    const stepRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isActive && stepRef.current) {
            stepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isActive]);

    const agentInfo = LESSON_AGENTS[agent.type];

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
        <div
            ref={stepRef}
            className={`relative rounded-xl overflow-hidden transition-all duration-300 ${isActive ? 'scale-[1.02] z-10 shadow-2xl shadow-cyan-500/10' : 'z-0'}`}
        >
            {/* Active Agent effects: Marching Ants + Border Tracer */}
            {isActive && (
                <>
                    <style>{`
                        @keyframes marching-ants {
                            0% { background-position: 0 0, 0 100%, 0 0, 100% 0; }
                            100% { background-position: 40px 0, -40px 100%, 0 -40px, 100% 40px; }
                        }
                        @keyframes border-tracer {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>

                    {/* 1. Border Tracer (Sharp Conic Sweep) */}
                    <div className="absolute inset-[-100%] animate-[border-tracer_3s_linear_infinite]">
                        <div
                            className="w-full h-full"
                            style={{
                                background: 'conic-gradient(from 0deg, transparent 70%, #22d3ee 85%, #22d3ee 100%)'
                            }}
                        />
                    </div>

                    {/* 2. Marching Ants (Animated Dashed Border) */}
                    <div
                        className="absolute inset-[0.5px] rounded-xl"
                        style={{
                            backgroundImage: `
                                linear-gradient(90deg, #22d3ee 50%, transparent 50%),
                                linear-gradient(90deg, #22d3ee 50%, transparent 50%),
                                linear-gradient(0deg, #22d3ee 50%, transparent 50%),
                                linear-gradient(0deg, #22d3ee 50%, transparent 50%)
                            `,
                            backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
                            backgroundSize: '20px 1.5px, 20px 1.5px, 1.5px 20px, 1.5px 20px',
                            backgroundPosition: '0 0, 0 100%, 0 0, 100% 0',
                            animation: 'marching-ants 1s linear infinite',
                            opacity: 0.3
                        }}
                    />
                </>
            )}

            <div className={`relative flex items-start gap-3 py-3 px-4 rounded-xl transition-colors ${isActive
                ? 'bg-[#0d1117] m-[3px]'
                : agent.state === 'complete'
                    ? 'bg-transparent border border-emerald-500/20 m-[2px]'
                    : 'bg-transparent border border-white/5 m-[2px]'
                }`}>
                {/* Status Indicator */}
                <div className={`flex-shrink-0 text-lg ${isActive ? 'animate-spin' : ''}`}>
                    {isActive ? '🔄' : getStateIcon()}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getStateColor()}`}>
                            {agentInfo.name}
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${agent.state === 'complete'
                            ? 'text-emerald-400 border border-emerald-400/20'
                            : agent.state === 'running'
                                ? 'text-cyan-400 border border-cyan-400/20'
                                : agent.state === 'error'
                                    ? 'text-red-400 border border-red-400/20'
                                    : 'text-white/20 border border-white/5'
                            }`}>
                            {agent.state === 'running' ? 'Active' :
                                agent.state.charAt(0).toUpperCase() + agent.state.slice(1)}
                        </span>
                    </div>
                    <p className={`text-sm mt-1 ${agent.state === 'pending' ? 'text-white/30' : 'text-white/60'
                        }`}>
                        {agent.message || agentInfo.description}
                    </p>

                    {/* Section Progress for Instructional Agent */}
                    {agent.type === 'instructional' && sections && sections.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            {sections.map((s) => (
                                <div key={s.index} className="flex items-center gap-2 text-sm">
                                    <span className={`text-xs ${s.state === 'complete' ? 'text-emerald-400' :
                                        s.state === 'writing' ? 'text-cyan-400 animate-pulse' :
                                            'text-white/30'
                                        }`}>
                                        {s.state === 'complete' ? '✓' :
                                            s.state === 'writing' ? '→' : '○'}
                                    </span>
                                    <span className={`${s.state === 'complete' ? 'text-white/60' :
                                        s.state === 'writing' ? 'text-cyan-300' :
                                            'text-white/30'
                                        }`}>
                                        Section {s.index + 1}: {s.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Activity Progress for Creative Agent */}
                    {agent.type === 'creative' && activities && activities.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            {activities.map((act) => (
                                <div key={act.index} className="flex items-center gap-2 text-sm">
                                    <span className={`text-xs ${act.state === 'complete' ? 'text-emerald-400' :
                                        act.state === 'designing' ? 'text-cyan-400 animate-pulse' :
                                            'text-white/30'
                                        }`}>
                                        {act.state === 'complete' ? '✓' :
                                            act.state === 'designing' ? '→' : '○'}
                                    </span>
                                    <span className={`${act.state === 'complete' ? 'text-white/60' :
                                        act.state === 'designing' ? 'text-cyan-300' :
                                            'text-white/30'
                                        }`}>
                                        {act.title}
                                    </span>
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

export default function LessonAgentProgressPanel({
    isGenerating,
    currentAgent,
    agents,
    sections,
    activities,
    overallProgress,
    currentMessage,
}: LessonAgentProgressPanelProps) {
    if (!isGenerating && agents.length === 0) {
        return null;
    }

    return (
        <div className="bg-[#0b0f12] border border-white/10 rounded-2xl p-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                    <svg className="w-5 h-5 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">
                        {isGenerating ? 'Generating Custom Lesson' : 'Lesson Generation Complete'}
                    </h3>
                    <p className="text-sm text-white/50">
                        {currentMessage || 'Specialized agents are building your lesson...'}
                    </p>
                </div>
            </div>

            {/* Agent Timeline */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {agents.map((agent) => (
                    <AgentStep
                        key={agent.type}
                        agent={agent}
                        isActive={currentAgent === agent.type}
                        sections={agent.type === 'instructional' ? sections : undefined}
                        activities={agent.type === 'creative' ? activities : undefined}
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
                        className="h-full bg-cyan-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
