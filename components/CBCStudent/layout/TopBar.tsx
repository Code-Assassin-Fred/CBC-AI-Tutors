'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import NotificationsModal from './NotificationsModal';
import SettingsModal from './SettingsModal';

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userInitial = (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <>
      <div
        className={`h-16 flex items-center justify-end px-6 sticky top-0 z-30 transition-colors duration-300 ${scrolled ? 'bg-[#0b1113]/60 backdrop-blur-xl' : 'bg-transparent'
          }`}
      >
        {/* Right Icon Cluster */}
        <div className="flex items-center gap-3.5">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative w-9 h-9 rounded-full bg-[#0b1113] border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            aria-label="Notifications"
          >
            <svg
              className="w-5 h-5 text-[#9aa6b2]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0b1113]" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-full bg-[#0b1113] border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            aria-label="Settings"
          >
            <svg
              className="w-5 h-5 text-[#9aa6b2]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden shadow-[0_2px_0_rgba(255,255,255,0.04)_inset] bg-[#1a1f23] flex items-center justify-center">
            {user?.photoURL && !imgError ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-[#0ea5e9] font-bold text-sm bg-[#0ea5e9]/10">
                {userInitial}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
