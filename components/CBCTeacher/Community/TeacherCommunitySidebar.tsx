"use client";

import { useCommunity } from '@/lib/context/CommunityContext';

export default function TeacherCommunitySidebar() {
    const { activeMembers, topContributors } = useCommunity();

    return (
        <div className="space-y-6">

            {/* Active Teachers (reusing context for online users, assuming shared for now) */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-5">
                <h3 className="text-sm font-semibold text-white/95 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Active Colleagues
                </h3>
                <div className="space-y-2">
                    {activeMembers.length > 0 ? (
                        activeMembers.slice(0, 5).map((member) => (
                            <div key={member.userId} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs text-[#9aa6b2]">
                                    {member.displayName.charAt(0)}
                                </div>
                                <span className="text-sm text-[#9aa6b2]">{member.displayName}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-[#9aa6b2]">No colleagues online</p>
                    )}
                </div>
            </div>

            {/* Top Contributors */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-5">
                <h3 className="text-sm font-semibold text-white/95 mb-4">Top Teacher Contributors</h3>
                <div className="space-y-2">
                    {topContributors.slice(0, 5).map((member, idx) => (
                        <div key={member.userId} className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center text-xs text-[#9aa6b2]/50">
                                {idx + 1}
                            </span>
                            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs text-[#9aa6b2]">
                                {member.displayName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#9aa6b2] truncate">{member.displayName}</p>
                            </div>
                            <span className="text-xs text-[#0ea5e9]">{member.reputation}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
