'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarNavProps {
  active?: string;
}

export default function SidebarNav({ active = 'Dashboard' }: SidebarNavProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(active);

  const navItems: NavItem[] = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      href: '/dashboard/student/cbc',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      )
    },
    {
      id: 'Classroom',
      label: 'Classroom',
      href: '/dashboard/student/cbc/classroom',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )
    },
    {
      id: 'Courses',
      label: 'Courses',
      href: '/dashboard/student/cbc/courses',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      id: 'Resources',
      label: 'Resources',
      href: '/dashboard/student/cbc/resources',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      )
    },
    {
      id: 'Career Paths',
      label: 'Career Paths',
      href: '/dashboard/student/cbc/paths',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      )
    },
    {
      id: 'Schedule',
      label: 'Schedule',
      href: '/dashboard/student/cbc/schedule',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      id: 'Community',
      label: 'Community',
      href: '/dashboard/student/cbc/community',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      )
    }
  ];

  return (
    <div className="w-72 sticky top-0 h-screen flex flex-col items-center pt-8">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-5 px-2">
        <svg className="w-8 h-8 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className="text-lg font-semibold text-white/95">E-Learning</span>
      </div>

      {/* Sidebar */}
  <aside className="flex flex-col flex-1 w-[90%] bg-linear-to-b from-[#0b0f12] to-[#0c1116] rounded-t-2xl border-t border-l border-r border-white/10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        {/* Scrollable Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveItem(item.id)}
                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ease-in-out ${
                  isActive ? 'text-[#7c3aed]' : 'text-[#9aa6b2] hover:text-white/90'
                }`}
                aria-label={item.label}
              >
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-2xl bg-[#7c3aed]/10 shadow-[0_8px_24px_rgba(124,58,237,0.35)] transition-all duration-300" />
                )}
                <span
                  className={`${
                    isActive ? 'text-[#7c3aed]' : 'text-[#9aa6b2] group-hover:text-white/90'
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`${isActive ? 'text-[#7c3aed]' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Promo Card */}
        <div className="p-4">
          <div className="p-4 rounded-xl bg-linear-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white/95">Free Trial</p>
                <p className="text-xs text-[#9aa6b2] mt-1">7 days left</p>
              </div>
            </div>
            <button
              className="w-full px-3 py-2 text-xs font-medium rounded-md border border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-colors"
              aria-label="Upgrade now"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
