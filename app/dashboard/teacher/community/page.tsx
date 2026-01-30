"use client";

import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import { CommunityProvider, useCommunity } from '@/lib/context/CommunityContext';
import TeacherCommunityFeed from '@/components/CBCTeacher/Community/TeacherCommunityFeed';
import PostDetail from '@/components/CBCStudent/Community/PostDetail';
import CreatePostModal from '@/components/CBCStudent/Community/CreatePostModal';
import { useDashboardProtection } from '@/hooks/useDashboardProtection';

function CommunityContent() {
    const { activePost } = useCommunity();

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-0 h-full pb-20 lg:pb-0">
            {/* Main layout with independent scrolling */}
            <div className="flex flex-col h-auto lg:h-[calc(100vh-140px)]">
                {/* Main content - scrolls independently on desktop */}
                <div className="flex-1 min-w-0 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
                    {activePost ? (
                        <PostDetail />
                    ) : (
                        <TeacherCommunityFeed />
                    )}
                </div>
            </div>

            {/* Create modal */}
            <CreatePostModal authorRole="teacher" />
        </div>
    );
}

export default function TeacherCommunityPage() {
    useDashboardProtection(['teacher']);

    return (
        <DashboardLayout active="Community">
            <CommunityProvider>
                <CommunityContent />
            </CommunityProvider>
        </DashboardLayout>
    );
}
