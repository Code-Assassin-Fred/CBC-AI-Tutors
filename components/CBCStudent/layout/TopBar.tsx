'use client';

import React, { useEffect, useState } from 'react';
import { useAuthUser } from '@/lib/hooks';

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuthUser();

  const displayName = profile?.displayName || user?.displayName || 'Student';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    // Initialize state in case the page is already scrolled
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`h-16 flex items-center justify-end px-6 sticky top-0 z-30 transition-colors duration-300 ${
        scrolled ? 'bg-[#0b1113]/60 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      {/* Centered Search Bar with right-side clearance */}
      <div className="absolute left-6 right-40 sm:right-48 md:right-56 lg:right-64">
        <label aria-label="Search" className="block">
          <div className="h-10 w-full rounded-full bg-[#0b0f12] border border-white/10 ring-1 ring-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] flex items-center px-3">
            {/* Search icon */}
            <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="text"
              placeholder="Search here!"
              className="flex-1 bg-transparent outline-none px-3 text-sm text-white/90 placeholder-white/50"
            />
            {/* Mic pill */}
            <div className="w-7 h-7 rounded-full bg-[#0f1318] border border-white/10 flex items-center justify-center text-white/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a5 5 0 01-10 0m5 5v3m-4 0h8" />
              </svg>
            </div>
          </div>
        </label>
      </div>
      {/* Right: Icon Cluster */}
      <div className="flex items-center gap-3.5">
        {/* Theme Toggle */}
        <button
          className="w-9 h-9 rounded-full bg-[#7c3aed] text-white shadow-[0_6px_18px_rgba(124,58,237,0.4)] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          aria-label="Toggle theme"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-full bg-[#0b1113] border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/30"
          aria-label="Notifications"
        >
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification dot */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0b1113]"></span>
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 rounded-full bg-[#0b1113] border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/30"
          aria-label="Settings"
        >
          <svg className="w-5 h-5 text-[#9aa6b2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden shadow-[0_2px_0_rgba(255,255,255,0.04)_inset]">
          <img
            src="https://i.pravatar.cc/150?img=25"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
