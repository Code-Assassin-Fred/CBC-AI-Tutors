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
        <div className="max-w-7xl mx-auto pt-8 px-4 pb-16">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Community</h1>
                <p className="text-[#9aa6b2]">Connect with learners, ask questions, and share knowledge</p>
            </div>

            {/* Main layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2">
                    {activePost ? (
                        <PostDetail />
                    ) : (
                        <CommunityFeed />
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
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
