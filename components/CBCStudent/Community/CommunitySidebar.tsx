"use client";

import { useCommunity } from '@/lib/context/CommunityContext';

export default function CommunitySidebar() {
    const { groups, myGroups, joinGroup, leaveGroup, activeMembers, topContributors } = useCommunity();

    return (
        <div className="space-y-6">
            {/* Study Groups */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Study Groups</h3>
                <div className="space-y-2">
                    {groups.map((group) => {
                        const isMember = myGroups.some(g => g.id === group.id);
                        return (
                            <div
                                key={group.id}
                                className="flex items-center justify-between py-2"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{group.icon}</span>
                                    <div>
                                        <p className="text-sm text-white">{group.name}</p>
                                        <p className="text-xs text-white/40">{group.memberCount} members</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => isMember ? leaveGroup(group.id) : joinGroup(group.id)}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${isMember
                                            ? 'text-white/40 hover:text-red-400'
                                            : 'text-[#0ea5e9] hover:bg-[#0ea5e9]/10'
                                        }`}
                                >
                                    {isMember ? 'Leave' : 'Join'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Active Now */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#10b981] rounded-full" />
                    Active Now
                </h3>
                <div className="space-y-2">
                    {activeMembers.length > 0 ? (
                        activeMembers.slice(0, 5).map((member) => (
                            <div key={member.userId} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                                    {member.displayName.charAt(0)}
                                </div>
                                <span className="text-sm text-white/70">{member.displayName}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-white/40">No one online</p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Top Contributors */}
            <div>
                <h3 className="text-sm font-medium text-white mb-3">Top Contributors</h3>
                <div className="space-y-2">
                    {topContributors.slice(0, 5).map((member, idx) => (
                        <div key={member.userId} className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center text-xs text-white/30">
                                {idx + 1}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">
                                {member.displayName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/70 truncate">{member.displayName}</p>
                            </div>
                            <span className="text-xs text-[#0ea5e9]">{member.reputation}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
