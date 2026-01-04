"use client";

import { useCommunity } from '@/lib/context/CommunityContext';

export default function CommunitySidebar() {
    const { groups, myGroups, joinGroup, leaveGroup, activeMembers, topContributors } = useCommunity();

    return (
        <div className="space-y-6">
            {/* Study Groups */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-5">
                <h3 className="text-sm font-semibold text-white/95 mb-4">Study Groups</h3>
                <div className="space-y-3">
                    {groups.map((group) => {
                        const isMember = myGroups.some(g => g.id === group.id);
                        return (
                            <div
                                key={group.id}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white/90 truncate">{group.name}</p>
                                    <p className="text-xs text-[#9aa6b2]">{group.memberCount} members</p>
                                </div>
                                <button
                                    onClick={() => isMember ? leaveGroup(group.id) : joinGroup(group.id)}
                                    className={`ml-3 text-xs px-3 py-1.5 rounded-lg transition-colors ${isMember
                                            ? 'text-[#9aa6b2] hover:text-red-400 hover:bg-red-500/10'
                                            : 'text-[#0ea5e9] bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20'
                                        }`}
                                >
                                    {isMember ? 'Leave' : 'Join'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Active Now */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-5">
                <h3 className="text-sm font-semibold text-white/95 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Active Now
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
                        <p className="text-xs text-[#9aa6b2]">No one online</p>
                    )}
                </div>
            </div>

            {/* Top Contributors */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-5">
                <h3 className="text-sm font-semibold text-white/95 mb-4">Top Contributors</h3>
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
