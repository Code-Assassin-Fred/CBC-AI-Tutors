"use client";

import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CommunityProvider, useCommunity } from '@/lib/context/CommunityContext';
import CommunityFeed from '@/components/CBCStudent/Community/CommunityFeed';
import PostDetail from '@/components/CBCStudent/Community/PostDetail';
import CommunitySidebar from '@/components/CBCStudent/Community/CommunitySidebar';
import CreatePostModal from '@/components/CBCStudent/Community/CreatePostModal';

function CommunityContent() {
    const { activePost } = useCommunity();

    return (
        <div className="max-w-7xl mx-auto pt-8 px-4 pb-4">
            {/* Main layout with independent scrolling */}
            <div className="flex gap-6 h-[calc(100vh-120px)]">
                {/* Main content - scrolls independently */}
                <div className="flex-1 min-w-0 overflow-y-auto pr-2">
                    {activePost ? (
                        <PostDetail />
                    ) : (
                        <CommunityFeed />
                    )}
                </div>

                {/* Sidebar - scrolls independently */}
                <div className="w-80 flex-shrink-0 overflow-y-auto pl-2 hidden lg:block">
                    <CommunitySidebar />
                </div>
            </div>

            {/* Create modal */}
            <CreatePostModal />
        </div>
    );
}

export default function CommunityPage() {
    return (
        <DashboardLayout active="Community">
            <CommunityProvider>
                <CommunityContent />
            </CommunityProvider>
        </DashboardLayout>
    );
}
