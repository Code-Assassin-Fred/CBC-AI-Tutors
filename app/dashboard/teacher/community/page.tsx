"use client";

import DashboardLayout from '@/components/CBCTeacher/layout/DashboardLayout';
import { CommunityProvider, useCommunity } from '@/lib/context/CommunityContext';
import TeacherCommunityFeed from '@/components/CBCTeacher/Community/TeacherCommunityFeed';
import PostDetail from '@/components/CBCStudent/Community/PostDetail';
import CommunitySidebar from '@/components/CBCStudent/Community/CommunitySidebar';
import CreatePostModal from '@/components/CBCStudent/Community/CreatePostModal';
import { useDashboardProtection } from '@/hooks/useDashboardProtection';

function CommunityContent() {
    const { activePost } = useCommunity();

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-0 h-full">
            {/* Main layout with independent scrolling */}
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
                {/* Main content - scrolls independently */}
                <div className="flex-1 min-w-0 overflow-y-auto pr-2 custom-scrollbar">
                    {activePost ? (
                        <PostDetail />
                    ) : (
                        <TeacherCommunityFeed />
                    )}
                </div>

                {/* Sidebar - scrolls independently */}
                <div className="w-full lg:w-80 flex-shrink-0 lg:overflow-y-auto pl-2">
                    <CommunitySidebar />
                </div>
            </div>

            {/* Create modal */}
            <CreatePostModal />
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
