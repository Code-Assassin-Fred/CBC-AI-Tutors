'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';

export default function WelcomeHeaderCard() {
    const { user } = useAuth();
    const firstName = user?.displayName?.split(' ')[0] || 'Teacher';

    return (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] p-8 md:p-10 shadow-2xl">
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>

            <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Welcome back, {firstName}!
                </h1>
                <p className="text-white/90 text-lg leading-relaxed">
                    Ready to inspire your students today? Access your guides, generate new materials, and connect with the community.
                </p>
            </div>

            <div className="absolute right-8 bottom-0 hidden md:block opacity-90">
                {/* Illustration or icon can go here */}
                <svg className="w-32 h-32 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                </svg>
            </div>
        </div>
    );
}
